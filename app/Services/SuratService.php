<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Penduduk;
use App\Models\PengajuanSurat;
use App\Models\SuratOutput;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SuratService
{
    // ─── Build data untuk template ────────────────────────────────────────────

    public function buildData(PengajuanSurat $pengajuan, string $nomorSurat = '...'): array
    {
        $pengajuan->loadMissing(['user', 'masterSurat', 'suratOutput']);

        $user     = $pengajuan->user;
        $penduduk = Penduduk::where('nik', $user->nik)->first();
        $kades    = User::where('role', 'kepala_desa')->where('status', 'aktif')->first();

        // Nomor surat: pakai dari suratOutput jika sudah ada, atau argumen
        $nomor = $pengajuan->suratOutput?->no_surat ?? $nomorSurat;

        $settings = AppSetting::allAsArray();

        // Peta nilai profil warga — key HARUS sama dengan PROFILE_FIELDS di master-surat-template.tsx
        // Dipakai oleh template-blok.blade.php: kolom fields_table (source='profile')
        // dan substitusi {{var}} di blok paragraf
        $tglLahir    = $penduduk?->tanggal_lahir?->locale('id')->translatedFormat('d F Y') ?? '-';
        $tempatLahir = $penduduk?->tempat_lahir ?? '-';
        if ($penduduk) {
            $penduduk->loadMissing('wilayah');
        }
        $profileData = [
            'nama_lengkap'      => $penduduk?->nama ?? $user->name,
            'nik'               => $penduduk?->nik ?? $user->nik,
            'tempat_lahir'      => $tempatLahir,
            'tanggal_lahir'     => $tglLahir,
            'tempat_tgl_lahir'  => $tempatLahir . ', ' . $tglLahir,
            'jenis_kelamin'     => $penduduk?->jenis_kelamin_label ?? '-',
            'status_perkawinan' => $penduduk?->status_perkawinan_label ?? '-',
            'agama'             => $penduduk?->agama_label ?? '-',
            'pekerjaan'         => $penduduk?->pekerjaan ?? '-',
            'alamat'            => $penduduk?->alamat ?? '-',
            'kewarganegaraan'   => 'WNI',
            'no_kk'             => $penduduk?->no_kk ?? '-',
            'wilayah'           => $penduduk?->wilayah?->nama ?? '-',
        ];

        return [
            'pengajuan'   => $pengajuan,
            'user'        => $user,
            'masterSurat' => $pengajuan->masterSurat,
            'penduduk'    => $penduduk,
            'kades'       => $kades,
            'nomor_surat' => $nomor,
            'tanggal'     => Carbon::now()->locale('id')->translatedFormat('d F Y'),
            'settings'    => $settings,
            'profileData' => $profileData,
            // Tanda tangan saksi — diisi manual setelah cetak, kosong di template
            'rt_nama'     => null,
            'rw_nama'     => null,
            'camat_nama'  => null,
        ];
    }

    // ─── Pilih view blade sesuai ketersediaan template blok ─────────────────

    private function resolveView(PengajuanSurat $pengajuan): string
    {
        $pengajuan->loadMissing('masterSurat');

        return !empty($pengajuan->masterSurat?->template)
            ? 'surat.template-blok'
            : 'surat.template-surat';
    }

    // ─── Preview HTML (render on-the-fly, tidak disimpan) ────────────────────

    public function previewHtml(PengajuanSurat $pengajuan): string
    {
        $data = $this->buildData($pengajuan);
        return view($this->resolveView($pengajuan), $data)->render();
    }

    // ─── Generate nomor surat otomatis ───────────────────────────────────────
    //
    //  Format: {prefix}/{urut}/{kode_bidang}-{tahun}
    //  Contoh: 445/08/Ks-2026
    //  prefix & kode_bidang diambil dari master_surat, urut auto per jenis per tahun.

    public function generateNomor(PengajuanSurat $pengajuan): string
    {
        $pengajuan->loadMissing('masterSurat');

        $tahun      = now()->format('Y');
        $prefix     = $pengajuan->masterSurat->nomor_prefix ?? '474';
        $kodeBidang = $pengajuan->masterSurat->kode_bidang  ?? 'DS';

        // Hitung surat yang sudah diterbitkan untuk jenis ini di tahun ini
        $urutan = SuratOutput::whereYear('created_at', $tahun)
            ->whereHas('pengajuan', fn ($q) => $q->where('master_surat_id', $pengajuan->master_surat_id))
            ->count() + 1;

        return "{$prefix}/{$urutan}/{$kodeBidang}-{$tahun}";
    }

    // ─── Generate PDF → simpan → return SuratOutput ──────────────────────────

    public function generateAndStore(PengajuanSurat $pengajuan): SuratOutput
    {
        $nomor = $this->generateNomor($pengajuan);
        $data  = $this->buildData($pengajuan, $nomor);

        // Render PDF (portrait A4)
        $pdf = Pdf::loadView($this->resolveView($pengajuan), $data)
            ->setPaper('a4', 'portrait')
            ->setOption(['isRemoteEnabled' => false, 'defaultFont' => 'serif']);

        // Simpan ke storage/app/public/surat-output/{pengajuan_id}/...
        $filename = 'surat-output/' . $pengajuan->id . '/'
            . Str::slug($pengajuan->masterSurat->nama_surat)
            . '-' . now()->format('YmdHis') . '.pdf';

        Storage::disk('public')->put($filename, $pdf->output());

        // Hapus output lama jika ada (replace)
        $existing = $pengajuan->suratOutput;
        if ($existing && $existing->path_file !== $filename) {
            Storage::disk('public')->delete($existing->path_file);
        }

        return SuratOutput::updateOrCreate(
            ['pengajuan_id' => $pengajuan->id],
            [
                'no_surat'      => $nomor,
                'path_file'     => $filename,
                'tanggal_surat' => now()->toDateString(),
            ]
        );
    }

    // ─── Stream PDF untuk download ────────────────────────────────────────────

    public function streamPdf(PengajuanSurat $pengajuan): \Illuminate\Http\Response
    {
        $pengajuan->loadMissing(['suratOutput']);

        if ($pengajuan->suratOutput && Storage::disk('public')->exists($pengajuan->suratOutput->path_file)) {
            // Sudah ada file tersimpan — stream langsung
            $content  = Storage::disk('public')->get($pengajuan->suratOutput->path_file);
            $filename = Str::slug($pengajuan->masterSurat->nama_surat ?? 'surat') . '.pdf';

            return response($content, 200, [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        }

        // Fallback: generate on-the-fly tanpa simpan
        $pdf = Pdf::loadView($this->resolveView($pengajuan), $this->buildData($pengajuan))
            ->setPaper('a4', 'portrait');

        return $pdf->stream(Str::slug($pengajuan->masterSurat->nama_surat ?? 'surat') . '.pdf');
    }
}

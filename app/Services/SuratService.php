<?php

namespace App\Services;

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

        return [
            'pengajuan'   => $pengajuan,
            'user'        => $user,
            'masterSurat' => $pengajuan->masterSurat,
            'penduduk'    => $penduduk,
            'kades'       => $kades,
            'nomor_surat' => $nomor,
            'tanggal'     => Carbon::now()->locale('id')->translatedFormat('d F Y'),
            // Tanda tangan saksi — diisi manual setelah cetak, kosong di template
            'rt_nama'     => null,
            'rw_nama'     => null,
            'camat_nama'  => null,
        ];
    }

    // ─── Preview HTML (render on-the-fly, tidak disimpan) ────────────────────

    public function previewHtml(PengajuanSurat $pengajuan): string
    {
        return view('surat.template-surat', $this->buildData($pengajuan))->render();
    }

    // ─── Generate nomor surat otomatis ───────────────────────────────────────
    //
    //  Format: 474.1 / {seq} / {bulan} / DS-{tahun}
    //  474.1 = kode klasifikasi arsip kependudukan (sementara, konfirmasi nanti)
    //  Nanti bisa disesuaikan per kode masterSurat.

    public function generateNomor(PengajuanSurat $pengajuan): string
    {
        $tahun  = now()->format('Y');
        $bulan  = now()->format('m');
        $urutan = SuratOutput::whereYear('created_at', $tahun)->count() + 1;

        return '474.1/' . str_pad($urutan, 3, '0', STR_PAD_LEFT) . '/' . $bulan . '/DS-' . $tahun;
    }

    // ─── Generate PDF → simpan → return SuratOutput ──────────────────────────

    public function generateAndStore(PengajuanSurat $pengajuan): SuratOutput
    {
        $nomor = $this->generateNomor($pengajuan);
        $data  = $this->buildData($pengajuan, $nomor);

        // Render PDF (portrait A4)
        $pdf = Pdf::loadView('surat.template-surat', $data)
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
        $pdf = Pdf::loadView('surat.template-surat', $this->buildData($pengajuan))
            ->setPaper('a4', 'portrait');

        return $pdf->stream(Str::slug($pengajuan->masterSurat->nama_surat ?? 'surat') . '.pdf');
    }
}

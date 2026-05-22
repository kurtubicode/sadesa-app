<?php

namespace Database\Seeders;

use App\Models\DokumenPersyaratan;
use App\Models\MasterSurat;
use App\Models\PengesahanPermohonan;
use App\Models\PengajuanSurat;
use App\Models\SuratOutput;
use App\Models\User;
use App\Models\VerifikasiBerkas;
use Illuminate\Database\Seeder;

/**
 * Seed pengajuan surat dengan berbagai status pipeline:
 *   menunggu → diproses → diverifikasi → menunggu_pengesahan
 *   → disetujui → selesai
 *        └─→ ditolak_staff
 *        └─→ ditolak_kepala
 *
 * Setiap pengajuan dilengkapi relasi turunannya (dokumen, verifikasi,
 * pengesahan, surat_output) sesuai status.
 */
class PengajuanSuratSeeder extends Seeder
{
    public function run(): void
    {
        // ── Aktor ─────────────────────────────────────────────────────────────
        $warga  = User::where('role', 'warga')->where('status', 'aktif')->firstOrFail();
        $staff  = User::where('role', 'staff')->firstOrFail();
        $kades  = User::where('role', 'kepala_desa')->firstOrFail();

        // ── Master surat ──────────────────────────────────────────────────────
        $sktm   = MasterSurat::where('kode', 'SKTM')->firstOrFail();
        $sdom   = MasterSurat::where('kode', 'SDOM')->firstOrFail();
        $sku    = MasterSurat::where('kode', 'SKU')->firstOrFail();
        $pktp   = MasterSurat::where('kode', 'PKTP')->firstOrFail();
        $pkk    = MasterSurat::where('kode', 'PKK')->firstOrFail();

        // Bersihkan data lama
        PengajuanSurat::whereIn('user_id', [$warga->id])->each(function ($p) {
            $p->suratOutput?->delete();
            $p->pengesahanPermohonan?->delete();
            $p->verifikasiBerkas?->delete();
            $p->dokumenPersyaratan()->delete();
            $p->delete();
        });

        $dataWarga = [
            'nama'    => $warga->name,
            'nik'     => $warga->nik,
            'alamat'  => 'Kp. Sukaraja RT 02/RW 01, Desa Cirangkong',
            'no_hp'   => $warga->phone,
        ];

        // ─────────────────────────────────────────────────────────────────────
        // 1. MENUNGGU — SKTM baru diajukan, belum ada tindakan
        // ─────────────────────────────────────────────────────────────────────
        $p1 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260518/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sktm->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan' => 'Pengajuan beasiswa pendidikan untuk anak',
            ]),
            'status'         => 'menunggu',
            'catatan'        => null,
            'created_at'     => now()->subDays(4),
            'updated_at'     => now()->subDays(4),
        ]);
        $this->seedDokumen($p1->id, $sktm->persyaratan, now()->subDays(4));

        // ─────────────────────────────────────────────────────────────────────
        // 2. DIPROSES — SDOM sedang ditangani staff
        // ─────────────────────────────────────────────────────────────────────
        $p2 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260516/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sdom->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan' => 'Persyaratan pembukaan rekening bank',
            ]),
            'status'         => 'diproses',
            'catatan'        => null,
            'created_at'     => now()->subDays(6),
            'updated_at'     => now()->subDays(5),
        ]);
        $this->seedDokumen($p2->id, $sdom->persyaratan, now()->subDays(6));

        // ─────────────────────────────────────────────────────────────────────
        // 3. DIVERIFIKASI — SKU berkas sudah OK dari staff
        // ─────────────────────────────────────────────────────────────────────
        $p3 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260514/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sku->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan'    => 'Perpanjangan izin usaha toko kelontong',
                'nama_usaha'   => 'Toko Barokah',
                'jenis_usaha'  => 'Perdagangan',
                'alamat_usaha' => 'Kp. Sukaraja RT 02/RW 01',
            ]),
            'status'         => 'diverifikasi',
            'catatan'        => null,
            'created_at'     => now()->subDays(8),
            'updated_at'     => now()->subDays(6),
        ]);
        $this->seedDokumen($p3->id, $sku->persyaratan, now()->subDays(8));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p3->id,
            'staff_id'     => $staff->id,
            'status'       => 'disetujui',
            'catatan'      => 'Semua berkas lengkap dan valid.',
            'created_at'   => now()->subDays(6),
            'updated_at'   => now()->subDays(6),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 4. MENUNGGU PENGESAHAN — PKTP di meja kepala desa
        // ─────────────────────────────────────────────────────────────────────
        $p4 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260512/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $pktp->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan' => 'Perpanjangan e-KTP yang hilang',
            ]),
            'status'         => 'menunggu_pengesahan',
            'catatan'        => null,
            'created_at'     => now()->subDays(10),
            'updated_at'     => now()->subDays(7),
        ]);
        $this->seedDokumen($p4->id, $pktp->persyaratan, now()->subDays(10));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p4->id,
            'staff_id'     => $staff->id,
            'status'       => 'disetujui',
            'catatan'      => 'Berkas sudah diperiksa, diteruskan ke Kepala Desa.',
            'created_at'   => now()->subDays(7),
            'updated_at'   => now()->subDays(7),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 5. DISETUJUI — PKK sudah acc kepala desa, tinggal upload surat
        // ─────────────────────────────────────────────────────────────────────
        $p5 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260510/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $pkk->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan'       => 'Penambahan anggota keluarga (anak baru lahir)',
                'nama_anggota'    => 'Budi Santoso',
                'tanggal_lahir'   => '2026-04-01',
            ]),
            'status'         => 'disetujui',
            'catatan'        => null,
            'created_at'     => now()->subDays(12),
            'updated_at'     => now()->subDays(9),
        ]);
        $this->seedDokumen($p5->id, $pkk->persyaratan, now()->subDays(12));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p5->id,
            'staff_id'     => $staff->id,
            'status'       => 'disetujui',
            'catatan'      => null,
            'created_at'   => now()->subDays(10),
            'updated_at'   => now()->subDays(10),
        ]);
        PengesahanPermohonan::create([
            'pengajuan_id'   => $p5->id,
            'kepala_desa_id' => $kades->id,
            'status'         => 'disetujui',
            'catatan'        => 'Disetujui. Silakan proses surat.',
            'created_at'     => now()->subDays(9),
            'updated_at'     => now()->subDays(9),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 6. SELESAI — SKTM pipeline penuh, surat sudah diupload
        // ─────────────────────────────────────────────────────────────────────
        $p6 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260505/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sktm->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan' => 'Keringanan biaya rumah sakit RSUD',
            ]),
            'status'         => 'selesai',
            'catatan'        => null,
            'created_at'     => now()->subDays(17),
            'updated_at'     => now()->subDays(13),
        ]);
        $this->seedDokumen($p6->id, $sktm->persyaratan, now()->subDays(17));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p6->id,
            'staff_id'     => $staff->id,
            'status'       => 'disetujui',
            'catatan'      => null,
            'created_at'   => now()->subDays(16),
            'updated_at'   => now()->subDays(16),
        ]);
        PengesahanPermohonan::create([
            'pengajuan_id'   => $p6->id,
            'kepala_desa_id' => $kades->id,
            'status'         => 'disetujui',
            'catatan'        => null,
            'created_at'     => now()->subDays(15),
            'updated_at'     => now()->subDays(15),
        ]);
        SuratOutput::create([
            'pengajuan_id'  => $p6->id,
            'no_surat'      => '474.1/001/V/2026',
            'path_file'     => 'surat-output/' . $p6->id . '/sktm-ahmad-warga.pdf',
            'tanggal_surat' => now()->subDays(13)->toDateString(),
            'created_at'    => now()->subDays(13),
            'updated_at'    => now()->subDays(13),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 7. DITOLAK STAFF — SDOM berkas kurang lengkap
        // ─────────────────────────────────────────────────────────────────────
        $p7 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260508/0002',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sdom->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan' => 'Persyaratan melamar pekerjaan',
            ]),
            'status'         => 'ditolak_staff',
            'catatan'        => 'Surat Pengantar RT/RW tidak terlampir. Silakan ajukan ulang.',
            'created_at'     => now()->subDays(14),
            'updated_at'     => now()->subDays(13),
        ]);
        $this->seedDokumen($p7->id, ['Fotokopi KTP', 'Fotokopi Kartu Keluarga'], now()->subDays(14));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p7->id,
            'staff_id'     => $staff->id,
            'status'       => 'ditolak',
            'catatan'      => 'Surat Pengantar RT/RW tidak terlampir. Berkas tidak lengkap.',
            'created_at'   => now()->subDays(13),
            'updated_at'   => now()->subDays(13),
        ]);

        // ─────────────────────────────────────────────────────────────────────
        // 8. DITOLAK KEPALA DESA — SKU ditolak saat pengesahan
        // ─────────────────────────────────────────────────────────────────────
        $p8 = PengajuanSurat::create([
            'no_pengajuan'   => 'ADM/20260501/0001',
            'user_id'        => $warga->id,
            'master_surat_id'=> $sku->id,
            'data_formulir'  => array_merge($dataWarga, [
                'keperluan'    => 'Pengajuan pinjaman usaha ke koperasi',
                'nama_usaha'   => 'Warung Sate Mang Ahmad',
                'jenis_usaha'  => 'Kuliner',
                'alamat_usaha' => 'Kp. Sukaraja RT 02/RW 01',
            ]),
            'status'         => 'ditolak_kepala',
            'catatan'        => 'Foto tempat usaha tidak menunjukkan lokasi yang sesuai alamat.',
            'created_at'     => now()->subDays(21),
            'updated_at'     => now()->subDays(19),
        ]);
        $this->seedDokumen($p8->id, $sku->persyaratan, now()->subDays(21));
        VerifikasiBerkas::create([
            'pengajuan_id' => $p8->id,
            'staff_id'     => $staff->id,
            'status'       => 'disetujui',
            'catatan'      => null,
            'created_at'   => now()->subDays(20),
            'updated_at'   => now()->subDays(20),
        ]);
        PengesahanPermohonan::create([
            'pengajuan_id'   => $p8->id,
            'kepala_desa_id' => $kades->id,
            'status'         => 'ditolak',
            'catatan'        => 'Foto tempat usaha tidak menunjukkan lokasi yang sesuai alamat tercantum.',
            'created_at'     => now()->subDays(19),
            'updated_at'     => now()->subDays(19),
        ]);

        $this->command->info('PengajuanSuratSeeder: 8 pengajuan berhasil dibuat (semua status ter-cover).');
    }

    // ── Helper: buat dummy dokumen persyaratan ────────────────────────────────

    private function seedDokumen(int $pengajuanId, array $persyaratan, \Illuminate\Support\Carbon $at): void
    {
        $slug = fn (string $s) => strtolower(str_replace([' ', '/'], '-', $s));

        foreach ($persyaratan as $jenis) {
            DokumenPersyaratan::create([
                'pengajuan_id'  => $pengajuanId,
                'nama_file'     => $slug($jenis) . '.jpg',
                'path_file'     => "dokumen-persyaratan/{$pengajuanId}/" . $slug($jenis) . '.jpg',
                'jenis_dokumen' => $jenis,
                'created_at'    => $at,
                'updated_at'    => $at,
            ]);
        }
    }
}

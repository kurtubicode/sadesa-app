<?php

namespace Database\Seeders;

use App\Models\MasterSurat;
use Illuminate\Database\Seeder;

class MasterSuratSeeder extends Seeder
{
    public function run(): void
    {
        // Catatan: identitas warga (KTP, KK) sudah terverifikasi otomatis lewat akun & database
        // penduduk — tidak perlu upload ulang. 'persyaratan' hanya berisi dokumen pendukung
        // yang BELUM ada di sistem (bukti fisik eksternal, dokumen khusus, dll.)
        $data = [
            // ─── DOMISILI ────────────────────────────────────────────────────────
            [
                'kode'         => 'DOM-DLM',
                'kategori'     => 'domisili',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Domisili',
                'deskripsi'    => 'Surat keterangan domisili untuk warga dalam wilayah desa.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'DOM-LWY',
                'kategori'     => 'domisili',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Domisili Luar Wilayah',
                'deskripsi'    => 'Surat keterangan domisili untuk keperluan di luar wilayah desa.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'DOM-LBG',
                'kategori'     => 'domisili',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Domisili Lembaga',
                'deskripsi'    => 'Surat keterangan domisili untuk keperluan lembaga/organisasi.',
                'persyaratan'  => ['Akta Pendirian Lembaga/Organisasi'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'DOM-USH',
                'kategori'     => 'domisili',
                'nomor_prefix' => '510',
                'nama_surat'   => 'Surat Keterangan Domisili Usaha',
                'deskripsi'    => 'Surat keterangan domisili untuk keperluan usaha/bisnis.',
                'persyaratan'  => ['Foto Tempat Usaha'],
                'template'     => null,
                'is_active'    => true,
            ],

            // ─── IJIN ────────────────────────────────────────────────────────────
            [
                'kode'         => 'IJN-ABG',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Angkut Barang',
                'deskripsi'    => 'Surat ijin untuk mengangkut barang dalam/keluar wilayah desa.',
                'persyaratan'  => ['Daftar Barang yang Diangkut'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-SMI',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Sumbangan Insidentil',
                'deskripsi'    => 'Surat ijin untuk kegiatan pengumpulan sumbangan.',
                'persyaratan'  => ['Proposal Kegiatan'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-CTP',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Cuti Pabrik',
                'deskripsi'    => 'Surat keterangan untuk keperluan cuti kerja di pabrik.',
                'persyaratan'  => ['Surat Keterangan Bekerja dari Perusahaan'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-ORT',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Orang Tua',
                'deskripsi'    => 'Surat ijin dari orang tua untuk keperluan anak.',
                'persyaratan'  => ['Akta Kelahiran Anak'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-PMN',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Pom Mini',
                'deskripsi'    => 'Surat ijin operasional pom mini (SPBU mini).',
                'persyaratan'  => ['Foto Lokasi Usaha', 'Surat Persetujuan Tetangga'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-TTG',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Tetangga',
                'deskripsi'    => 'Surat persetujuan/ijin dari tetangga untuk kegiatan tertentu.',
                'persyaratan'  => [],                                   // pengajuan digital = permohonan itu sendiri
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'IJN-RMI',
                'kategori'     => 'ijin',
                'nomor_prefix' => '503',
                'nama_surat'   => 'Surat Ijin Keramaian',
                'deskripsi'    => 'Surat ijin untuk penyelenggaraan acara keramaian.',
                'persyaratan'  => ['Proposal Acara'],
                'template'     => null,
                'is_active'    => true,
            ],

            // ─── KETERANGAN ──────────────────────────────────────────────────────
            [
                'kode'         => 'KTR-LHR',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.2',
                'nama_surat'   => 'Surat Keterangan Lahir',
                'deskripsi'    => 'Surat keterangan kelahiran anak.',
                'persyaratan'  => ['Surat Keterangan Bidan/Dokter'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-PKJ',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Pekerjaan',
                'deskripsi'    => 'Surat keterangan pekerjaan/mata pencaharian warga.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-PDL',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Pindah Alamat',
                'deskripsi'    => 'Surat keterangan pindah alamat/domisili.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-KTR',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Umum',
                'deskripsi'    => 'Surat keterangan untuk berbagai keperluan umum.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-BNM',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Beda Nama',
                'deskripsi'    => 'Surat keterangan perbedaan nama pada dokumen kependudukan.',
                'persyaratan'  => ['Dokumen yang Menunjukkan Perbedaan Nama'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-BLM',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Belum Menikah',
                'deskripsi'    => 'Surat keterangan bahwa pemohon belum/tidak pernah menikah.',
                'persyaratan'  => [],                                   // dari database (status_perkawinan)
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-LNR',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Di Luar Negeri',
                'deskripsi'    => 'Surat keterangan untuk keperluan bekerja/tinggal di luar negeri.',
                'persyaratan'  => ['Paspor'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-KRM',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Kredit Motor',
                'deskripsi'    => 'Surat keterangan domisili untuk keperluan kredit/leasing kendaraan.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-LKT',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Luar Kota',
                'deskripsi'    => 'Surat keterangan untuk keperluan perjalanan/urusan luar kota.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-PGH',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Penghasilan',
                'deskripsi'    => 'Surat keterangan penghasilan untuk berbagai keperluan.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-PKK',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Pisah KK',
                'deskripsi'    => 'Surat keterangan untuk proses pemisahan Kartu Keluarga.',
                'persyaratan'  => [],                                   // semua dari database
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'KTR-MSK',
                'kategori'     => 'keterangan',
                'nomor_prefix' => '474.1',
                'nama_surat'   => 'Surat Keterangan Tidak Mampu',
                'deskripsi'    => 'Surat keterangan tidak mampu (miskin) untuk keperluan bantuan sosial.',
                'persyaratan'  => [],                                   // diverifikasi staff, semua dari database
                'template'     => null,
                'is_active'    => true,
            ],

            // ─── KETERANGAN TANAH ────────────────────────────────────────────────
            [
                'kode'         => 'TNH-WKF',
                'kategori'     => 'keterangan_tanah',
                'nomor_prefix' => '590',
                'nama_surat'   => 'Surat Keterangan Tanah Wakaf',
                'deskripsi'    => 'Surat keterangan mengenai tanah yang diwakafkan.',
                'persyaratan'  => ['Sertifikat/Dokumen Tanah', 'Surat Pernyataan Wakaf'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'TNH-BRI',
                'kategori'     => 'keterangan_tanah',
                'nomor_prefix' => '590',
                'nama_surat'   => 'Surat Keterangan Tanah (BRI)',
                'deskripsi'    => 'Surat keterangan tanah untuk keperluan pinjaman BRI.',
                'persyaratan'  => ['Sertifikat/Dokumen Tanah'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'TNH-KPL',
                'kategori'     => 'keterangan_tanah',
                'nomor_prefix' => '590',
                'nama_surat'   => 'Surat Keterangan Kepemilikan Tanah',
                'deskripsi'    => 'Surat keterangan kepemilikan tanah/lahan.',
                'persyaratan'  => ['Bukti Kepemilikan Tanah (Girik/AJB/Sertifikat)'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'TNH-PJM',
                'kategori'     => 'keterangan_tanah',
                'nomor_prefix' => '590',
                'nama_surat'   => 'Surat Keterangan Peminjaman Tanah',
                'deskripsi'    => 'Surat keterangan untuk perjanjian peminjaman tanah.',
                'persyaratan'  => ['Bukti Kepemilikan Tanah', 'Surat Persetujuan Kedua Belah Pihak'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'TNH-TKS',
                'kategori'     => 'keterangan_tanah',
                'nomor_prefix' => '590',
                'nama_surat'   => 'Surat Keterangan Tanah Tidak Sengketa',
                'deskripsi'    => 'Surat keterangan bahwa tanah/lahan tidak dalam sengketa.',
                'persyaratan'  => ['Bukti Kepemilikan Tanah', 'Surat Pernyataan Tidak Sengketa'],
                'template'     => null,
                'is_active'    => true,
            ],

            // ─── PENGANTAR NIKAH ─────────────────────────────────────────────────
            [
                'kode'         => 'NKH-LLK',
                'kategori'     => 'pengantar_nikah',
                'nomor_prefix' => '474.3',
                'nama_surat'   => 'Surat Pengantar Nikah (Laki-Laki)',
                'deskripsi'    => 'Surat pengantar nikah untuk calon mempelai laki-laki.',
                'persyaratan'  => ['Akta Kelahiran', 'Pas Foto 3x4 (4 lembar)'],
                'template'     => null,
                'is_active'    => true,
            ],
            [
                'kode'         => 'NKH-PRP',
                'kategori'     => 'pengantar_nikah',
                'nomor_prefix' => '474.3',
                'nama_surat'   => 'Surat Pengantar Nikah (Perempuan)',
                'deskripsi'    => 'Surat pengantar nikah untuk calon mempelai perempuan.',
                'persyaratan'  => ['Akta Kelahiran', 'Pas Foto 3x4 (4 lembar)'],
                'template'     => null,
                'is_active'    => true,
            ],
        ];

        // Assign kode_bidang berdasarkan kategori (default per kelompok surat)
        $bidangMap = [
            'domisili'         => 'Dom',
            'ijin'             => 'Ij',
            'keterangan'       => 'Ks',
            'keterangan_tanah' => 'KT',
            'pengantar_nikah'  => 'NK',
        ];

        foreach ($data as $item) {
            if (! isset($item['kode_bidang'])) {
                $item['kode_bidang'] = $bidangMap[$item['kategori']] ?? null;
            }
            MasterSurat::create($item);
        }

        $this->command->info('MasterSuratSeeder: ' . count($data) . ' jenis surat berhasil dibuat (5 kategori).');
    }
}

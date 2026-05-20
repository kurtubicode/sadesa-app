<?php

namespace Database\Seeders;

use App\Models\KontenDesa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KontenDesaSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil salah satu admin untuk dijadikan penulis
        $admin = User::where('role', 'admin')->first() ?? User::first();

        $berita = [
            [
                'judul' => 'Penyaluran Bantuan Langsung Tunai (BLT) Dana Desa Tahap 1',
                'tipe' => 'berita', // Pakai huruf kecil sesuai enum
                'konten' => '<p>Pemerintah Desa Cirangkong telah sukses melaksanakan penyaluran Bantuan Langsung Tunai (BLT) Dana Desa Tahap 1 untuk tahun ini. Kegiatan ini dihadiri langsung oleh Kepala Desa dan jajaran perangkat desa.</p><p>Diharapkan bantuan ini dapat membantu meringankan beban ekonomi warga yang membutuhkan.</p>',
                'status' => 'published',
            ],
            [
                'judul' => 'Pengumuman Kerja Bakti Massal Sambut Bulan Suci Ramadhan',
                'tipe' => 'pengumuman',
                'konten' => '<p>Diberitahukan kepada seluruh warga Desa Cirangkong, dalam rangka menyambut datangnya bulan suci Ramadhan, kita akan mengadakan kegiatan kerja bakti massal.</p><p><strong>Waktu:</strong> Minggu, pukul 07.00 WIB - Selesai<br><strong>Lokasi:</strong> Lingkungan RT/RW masing-masing.</p><p>Dimohon kehadirannya dengan membawa peralatan kebersihan masing-masing.</p>',
                'status' => 'published',
            ],
            [
                'judul' => 'Pendaftaran Pelatihan Kader Pemberdayaan Masyarakat',
                'tipe' => 'pengumuman',
                'konten' => '<p>Dibuka pendaftaran untuk pelatihan Kader Pemberdayaan Masyarakat Desa (KPMD) bagi pemuda-pemudi Desa Cirangkong. Acara ini bertujuan untuk meningkatkan kapasitas SDM desa.</p><p>Silakan mendaftar melalui Balai Desa pada jam kerja.</p>',
                'status' => 'published',
            ],
            [
                'judul' => 'Panen Raya Padi Petani Desa Cirangkong Meningkat',
                'tipe' => 'berita',
                'konten' => '<p>Berkat penyuluhan dari dinas pertanian setempat dan cuaca yang mendukung, panen raya padi musim ini di Desa Cirangkong mengalami peningkatan hasil sebesar 15% dibandingkan musim sebelumnya.</p>',
                'status' => 'published',
            ],
        ];

        foreach ($berita as $item) {
            KontenDesa::create([
                'admin_id' => $admin->id,
                'judul' => $item['judul'],
                'slug' => Str::slug($item['judul']),
                'tipe' => $item['tipe'],
                'konten' => $item['konten'],
                'status' => $item['status'],
                // Kolom thumbnail dihapus karena tidak ada di migration
            ]);
        }
    }
}
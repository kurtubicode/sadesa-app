<?php

namespace Database\Seeders;

use App\Models\KategoriAduan;
use Illuminate\Database\Seeder;

class KategoriAduanSeeder extends Seeder
{
    public function run(): void
    {
        $kategori = [
            ['nama_kategori' => 'Infrastruktur',       'deskripsi' => 'Jalan rusak, drainase, jembatan, dll.'],
            ['nama_kategori' => 'Kebersihan',           'deskripsi' => 'Sampah, sanitasi lingkungan, dll.'],
            ['nama_kategori' => 'Keamanan',             'deskripsi' => 'Gangguan keamanan dan ketertiban umum.'],
            ['nama_kategori' => 'Pelayanan Publik',     'deskripsi' => 'Keluhan terkait pelayanan pemerintah desa.'],
            ['nama_kategori' => 'Penerangan',           'deskripsi' => 'Lampu jalan mati, kelistrikan umum, dll.'],
            ['nama_kategori' => 'Lain-lain',            'deskripsi' => 'Pengaduan di luar kategori yang tersedia.'],
        ];

        foreach ($kategori as $k) {
            KategoriAduan::create($k);
        }
    }
}

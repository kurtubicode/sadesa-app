<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            WilayahSeeder::class,        // harus pertama — users FK ke wilayah
            UserSeeder::class,
            AppSettingSeeder::class,     // kop surat & kades defaults
            PendudukSeeder::class,       // data kependudukan warga (sumber template surat)
            MasterSuratSeeder::class,
            KategoriAduanSeeder::class,
            KontenDesaSeeder::class,
            PengajuanSuratSeeder::class, // pengajuan surat (semua status ter-cover)
            PengaduanSeeder::class,      // laporan / pengaduan warga
            NotifikasiSeeder::class,     // notifikasi dummy untuk warga
        ]);
    }
}

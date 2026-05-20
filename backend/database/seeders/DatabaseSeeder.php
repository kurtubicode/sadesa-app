<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            WilayahSeeder::class,       // harus pertama — users FK ke wilayah
            UserSeeder::class,
            MasterSuratSeeder::class,
            KategoriAduanSeeder::class,
            KontenDesaSeeder::class,
        ]);
    }
}

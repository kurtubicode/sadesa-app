<?php

namespace Database\Seeders;

use App\Models\Wilayah;
use Illuminate\Database\Seeder;

class WilayahSeeder extends Seeder
{
    public function run(): void
    {
        // Desa (root)
        $desa = Wilayah::create(['nama' => 'Desa Cirangkong', 'tipe' => 'desa', 'parent_id' => null]);

        // Dusun
        $dusun1 = Wilayah::create(['nama' => 'Dusun I',  'tipe' => 'dusun', 'parent_id' => $desa->id]);
        $dusun2 = Wilayah::create(['nama' => 'Dusun II', 'tipe' => 'dusun', 'parent_id' => $desa->id]);

        // RW di Dusun I
        $rw01 = Wilayah::create(['nama' => 'RW 001', 'tipe' => 'rw', 'parent_id' => $dusun1->id]);
        $rw02 = Wilayah::create(['nama' => 'RW 002', 'tipe' => 'rw', 'parent_id' => $dusun1->id]);

        // RW di Dusun II
        $rw03 = Wilayah::create(['nama' => 'RW 003', 'tipe' => 'rw', 'parent_id' => $dusun2->id]);
        $rw04 = Wilayah::create(['nama' => 'RW 004', 'tipe' => 'rw', 'parent_id' => $dusun2->id]);

        // RT di bawah RW 001
        Wilayah::create(['nama' => 'RT 001', 'tipe' => 'rt', 'parent_id' => $rw01->id]);
        Wilayah::create(['nama' => 'RT 002', 'tipe' => 'rt', 'parent_id' => $rw01->id]);

        // RT di bawah RW 002
        Wilayah::create(['nama' => 'RT 001', 'tipe' => 'rt', 'parent_id' => $rw02->id]);
        Wilayah::create(['nama' => 'RT 002', 'tipe' => 'rt', 'parent_id' => $rw02->id]);

        // RT di bawah RW 003
        Wilayah::create(['nama' => 'RT 001', 'tipe' => 'rt', 'parent_id' => $rw03->id]);
        Wilayah::create(['nama' => 'RT 002', 'tipe' => 'rt', 'parent_id' => $rw03->id]);

        // RT di bawah RW 004
        Wilayah::create(['nama' => 'RT 001', 'tipe' => 'rt', 'parent_id' => $rw04->id]);
        Wilayah::create(['nama' => 'RT 002', 'tipe' => 'rt', 'parent_id' => $rw04->id]);
    }
}

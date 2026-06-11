<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $desa = Wilayah::where('tipe', 'desa')->first();

        // Admin
        User::create([
            'nik'        => '3212000000000001',
            'name'       => 'Admin SADESA',
            'email'      => 'admin@sadesa.test',
            'password'   => 'password',
            'phone'      => '081200000001',
            'role'       => 'admin',
            'status'     => 'aktif',
            'wilayah_id' => $desa?->id,
        ]);

        // Kepala Desa
        User::create([
            'nik'        => '3212000000000002',
            'name'       => 'Kepala Desa Cirangkong',
            'email'      => 'kades@sadesa.test',
            'password'   => 'password',
            'phone'      => '081200000002',
            'role'       => 'kepala_desa',
            'status'     => 'aktif',
            'wilayah_id' => $desa?->id,
        ]);

        // Staff
        User::create([
            'nik'        => '3212000000000003',
            'name'       => 'Staff Pelayanan',
            'email'      => 'staff@sadesa.test',
            'password'   => 'password',
            'phone'      => '081200000003',
            'role'       => 'staff',
            'status'     => 'aktif',
            'wilayah_id' => $desa?->id,
        ]);

        // Warga (akun aktif untuk testing)
        User::create([
            'nik'        => '3212000000000004',
            'name'       => 'Ahmad Warga',
            'email'      => 'ahmad@sadesa.test',
            'password'   => 'password',
            'phone'      => '081200000004',
            'role'       => 'warga',
            'status'     => 'aktif',
            'wilayah_id' => $desa?->id,
        ]);
    }
}

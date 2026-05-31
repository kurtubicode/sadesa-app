<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // ── Kop Surat ──────────────────────────────────────────────────────
            'kop_jabatan'   => 'KEPALA DESA',
            'kop_nama_desa' => 'CIRANGKONG',
            'kop_kecamatan' => 'CIJAMBE',
            'kop_kabupaten' => 'SUBANG',
            'kop_alamat'    => 'Jln. Raya Lempar - Cirangkong Km. 08 Cijambe - Subang',
            'kop_telepon'   => '',
            'kop_fax'       => '',
            'kop_kode_pos'  => '41285',
            'kop_website'   => '',
            'kop_email'     => '',
            'kop_logo_path' => 'images/logo-kab-subang.png',

            // ── Kepala Desa ────────────────────────────────────────────────────
            'kades_nama'    => 'Asep Sutia',
            'kades_nip'     => '',
            'kades_jabatan' => 'Kepala Desa Cirangkong',
        ];

        foreach ($defaults as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->command->info('AppSettingSeeder: kop surat defaults seeded.');
    }
}

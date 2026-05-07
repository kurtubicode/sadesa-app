<?php

namespace Database\Seeders;

use App\Models\MasterSurat;
use Illuminate\Database\Seeder;

class MasterSuratSeeder extends Seeder
{
    public function run(): void
    {
        $jenisSurat = [
            [
                'kode'       => 'SKTM',
                'nama_surat' => 'Surat Keterangan Tidak Mampu',
                'persyaratan' => [
                    'Fotokopi KTP',
                    'Fotokopi Kartu Keluarga',
                    'Surat Pengantar RT/RW',
                    'Surat Keterangan dari Kepala Dusun',
                ],
                'template'  => null,
                'is_active' => true,
            ],
            [
                'kode'       => 'SDOM',
                'nama_surat' => 'Surat Keterangan Domisili',
                'persyaratan' => [
                    'Fotokopi KTP',
                    'Fotokopi Kartu Keluarga',
                    'Surat Pengantar RT/RW',
                ],
                'template'  => null,
                'is_active' => true,
            ],
            [
                'kode'       => 'SKU',
                'nama_surat' => 'Surat Keterangan Usaha',
                'persyaratan' => [
                    'Fotokopi KTP',
                    'Fotokopi Kartu Keluarga',
                    'Surat Pengantar RT/RW',
                    'Foto Tempat Usaha',
                ],
                'template'  => null,
                'is_active' => true,
            ],
            [
                'kode'       => 'PKTP',
                'nama_surat' => 'Surat Pengantar KTP',
                'persyaratan' => [
                    'Fotokopi Kartu Keluarga',
                    'Surat Pengantar RT/RW',
                    'Akta Kelahiran (untuk pembuatan baru)',
                ],
                'template'  => null,
                'is_active' => true,
            ],
            [
                'kode'       => 'PKK',
                'nama_surat' => 'Surat Pengantar Kartu Keluarga',
                'persyaratan' => [
                    'Fotokopi KTP Kepala Keluarga',
                    'Fotokopi Kartu Keluarga Lama',
                    'Surat Pengantar RT/RW',
                    'Dokumen pendukung perubahan KK (jika ada)',
                ],
                'template'  => null,
                'is_active' => true,
            ],
        ];

        foreach ($jenisSurat as $data) {
            MasterSurat::create($data);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Penduduk;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;

/**
 * Seed data kependudukan (tabel penduduk) untuk warga aktif.
 *
 * Data ini dipakai sebagai sumber field template surat:
 *   nama, NIK, tempat/tanggal lahir, jenis kelamin, agama,
 *   status perkawinan, pekerjaan, alamat, no KK.
 *
 * Link ke akun warga: nik warga di users === nik di penduduk.
 */
class PendudukSeeder extends Seeder
{
    public function run(): void
    {
        $desa = Wilayah::where('tipe', 'desa')->first();

        // ── Hapus data lama (idempoten) ───────────────────────────────────────
        $wargas = User::where('role', 'warga')->pluck('nik');
        Penduduk::whereIn('nik', $wargas)->delete();

        // ── Data kependudukan Ahmad Warga ─────────────────────────────────────
        Penduduk::create([
            'nik'               => '3212000000000004',   // sama dengan users.nik
            'nama'              => 'Ahmad Warga',
            'tempat_lahir'      => 'Subang',
            'tanggal_lahir'     => '1990-06-15',
            'jenis_kelamin'     => 'L',
            'agama'             => 'islam',
            'status_perkawinan' => 'kawin',
            'pekerjaan'         => 'Petani',
            'alamat'            => 'Kp. Sukaraja RT 002/RW 001, Desa Cirangkong, Kecamatan Cijambe, Kabupaten Subang',
            'no_kk'             => '3212000000000099',
            'wilayah_id'        => $desa?->id,
        ]);

        // ── Data kependudukan warga lain (jika ada) ───────────────────────────
        // Tambahkan di sini jika UserSeeder punya warga ke-2, ke-3, dst.
        // Contoh pola:
        // Penduduk::create([
        //     'nik'               => '321200000000XXXX',
        //     'nama'              => '...',
        //     ...
        // ]);

        $total = Penduduk::whereIn('nik', $wargas->merge(['3212000000000004']))->count();
        $this->command->info("PendudukSeeder: {$total} data kependudukan berhasil dibuat.");
    }
}

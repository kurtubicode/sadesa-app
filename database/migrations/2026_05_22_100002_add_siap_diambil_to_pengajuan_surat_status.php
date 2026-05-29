<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MySQL ENUM tidak bisa diubah via Blueprint::change() secara aman,
     * jadi pakai raw SQL agar urutan status sesuai alur bisnis.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE pengajuan_surat
            MODIFY COLUMN status ENUM(
                'menunggu',
                'diproses',
                'diverifikasi',
                'ditolak_staff',
                'menunggu_pengesahan',
                'disetujui',
                'ditolak_kepala',
                'siap_diambil',
                'selesai',
                'dibatalkan'
            ) NOT NULL DEFAULT 'menunggu'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE pengajuan_surat
            MODIFY COLUMN status ENUM(
                'menunggu',
                'diproses',
                'diverifikasi',
                'ditolak_staff',
                'menunggu_pengesahan',
                'disetujui',
                'ditolak_kepala',
                'selesai',
                'dibatalkan'
            ) NOT NULL DEFAULT 'menunggu'
        ");
    }
};

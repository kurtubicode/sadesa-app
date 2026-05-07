<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_surat', function (Blueprint $table) {
            $table->id();
            $table->string('no_pengajuan')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('master_surat_id')->constrained('master_surat')->restrictOnDelete();
            $table->json('data_formulir')->nullable();
            $table->enum('status', [
                'menunggu',
                'diproses',
                'diverifikasi',
                'ditolak_staff',
                'menunggu_pengesahan',
                'disetujui',
                'ditolak_kepala',
                'selesai',
                'dibatalkan',
            ])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_surat');
    }
};

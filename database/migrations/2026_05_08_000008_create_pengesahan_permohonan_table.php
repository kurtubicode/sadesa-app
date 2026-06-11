<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengesahan_permohonan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_id')->constrained('pengajuan_surat')->cascadeOnDelete();
            $table->foreignId('kepala_desa_id')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['disetujui', 'ditolak']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengesahan_permohonan');
    }
};

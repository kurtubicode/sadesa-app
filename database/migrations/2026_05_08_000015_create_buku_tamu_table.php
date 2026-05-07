<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buku_tamu', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pengunjung');
            $table->string('instansi')->nullable();
            $table->text('keperluan');
            $table->string('no_hp', 15)->nullable();
            $table->string('qr_token')->unique();
            $table->timestamp('waktu_kunjungan')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buku_tamu');
    }
};

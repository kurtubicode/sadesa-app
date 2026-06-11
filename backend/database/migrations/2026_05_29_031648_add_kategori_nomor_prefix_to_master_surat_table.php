<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_surat', function (Blueprint $table) {
            $table->string('kategori', 50)->nullable()->after('kode');
            $table->string('nomor_prefix', 50)->nullable()->after('kategori');
            $table->text('deskripsi')->nullable()->after('nama_surat');
        });
    }

    public function down(): void
    {
        Schema::table('master_surat', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'nomor_prefix', 'deskripsi']);
        });
    }
};

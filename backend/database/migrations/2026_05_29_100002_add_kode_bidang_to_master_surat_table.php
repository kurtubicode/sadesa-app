<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_surat', function (Blueprint $table) {
            $table->string('kode_bidang', 20)->nullable()->after('nomor_prefix');
        });
    }

    public function down(): void
    {
        Schema::table('master_surat', function (Blueprint $table) {
            $table->dropColumn('kode_bidang');
        });
    }
};

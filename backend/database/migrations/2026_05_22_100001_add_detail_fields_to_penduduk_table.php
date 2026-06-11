<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penduduk', function (Blueprint $table) {
            $table->string('tempat_lahir')->nullable()->after('tanggal_lahir');
            $table->enum('agama', [
                'islam', 'kristen', 'katolik', 'hindu', 'budha', 'konghucu', 'lainnya',
            ])->nullable()->after('jenis_kelamin');
            $table->enum('status_perkawinan', [
                'belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati',
            ])->nullable()->after('agama');
            $table->string('pekerjaan')->nullable()->after('status_perkawinan');
            $table->text('alamat')->nullable()->after('pekerjaan');
        });
    }

    public function down(): void
    {
        Schema::table('penduduk', function (Blueprint $table) {
            $table->dropColumn(['tempat_lahir', 'agama', 'status_perkawinan', 'pekerjaan', 'alamat']);
        });
    }
};

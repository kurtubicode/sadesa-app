<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik', 16)->unique()->nullable()->after('id');
            $table->string('phone', 15)->nullable()->after('email');
            $table->enum('role', ['publik', 'warga', 'staff', 'admin', 'kepala_desa'])
                  ->default('warga')->after('phone');
            $table->enum('status', ['aktif', 'nonaktif', 'menunggu_verifikasi'])
                  ->default('menunggu_verifikasi')->after('role');
            $table->foreignId('wilayah_id')->nullable()->constrained('wilayah')->nullOnDelete()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['wilayah_id']);
            $table->dropColumn(['nik', 'phone', 'role', 'status', 'wilayah_id']);
        });
    }
};

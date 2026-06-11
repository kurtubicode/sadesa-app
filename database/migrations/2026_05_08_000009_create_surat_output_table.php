<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surat_output', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_id')->constrained('pengajuan_surat')->cascadeOnDelete();
            $table->string('no_surat')->unique();
            $table->string('path_file');
            $table->date('tanggal_surat');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surat_output');
    }
};

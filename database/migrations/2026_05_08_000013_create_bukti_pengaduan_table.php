<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bukti_pengaduan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengaduan_id')->constrained('pengaduan')->cascadeOnDelete();
            $table->string('path_file');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bukti_pengaduan');
    }
};

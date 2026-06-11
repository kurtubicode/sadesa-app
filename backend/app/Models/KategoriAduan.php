<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriAduan extends Model
{
    protected $table = 'kategori_aduan';

    protected $fillable = ['nama_kategori', 'deskripsi'];

    public function pengaduan(): HasMany
    {
        return $this->hasMany(Pengaduan::class);
    }
}

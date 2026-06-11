<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengaduan extends Model
{
    protected $table = 'pengaduan';

    protected $fillable = [
        'user_id',
        'kategori_aduan_id',
        'judul',
        'deskripsi',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriAduan::class, 'kategori_aduan_id');
    }

    public function bukti(): HasMany
    {
        return $this->hasMany(BuktiPengaduan::class, 'pengaduan_id');
    }

    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanPengaduan::class, 'pengaduan_id');
    }
}

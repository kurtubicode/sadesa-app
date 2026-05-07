<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TanggapanPengaduan extends Model
{
    protected $table = 'tanggapan_pengaduan';

    protected $fillable = [
        'pengaduan_id',
        'user_id',
        'isi_tanggapan',
    ];

    public function pengaduan(): BelongsTo
    {
        return $this->belongsTo(Pengaduan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

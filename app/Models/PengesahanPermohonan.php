<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengesahanPermohonan extends Model
{
    protected $table = 'pengesahan_permohonan';

    protected $fillable = [
        'pengajuan_id',
        'kepala_desa_id',
        'status',
        'catatan',
    ];

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(PengajuanSurat::class, 'pengajuan_id');
    }

    public function kepalaDesa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kepala_desa_id');
    }
}

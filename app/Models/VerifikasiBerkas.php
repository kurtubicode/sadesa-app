<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerifikasiBerkas extends Model
{
    protected $table = 'verifikasi_berkas';

    protected $fillable = [
        'pengajuan_id',
        'staff_id',
        'status',
        'catatan',
    ];

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(PengajuanSurat::class, 'pengajuan_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}

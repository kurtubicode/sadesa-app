<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPersyaratan extends Model
{
    protected $table = 'dokumen_persyaratan';

    protected $fillable = [
        'pengajuan_id',
        'nama_file',
        'path_file',
        'jenis_dokumen',
    ];

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(PengajuanSurat::class, 'pengajuan_id');
    }
}

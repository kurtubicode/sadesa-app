<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratOutput extends Model
{
    protected $table = 'surat_output';

    protected $fillable = [
        'pengajuan_id',
        'no_surat',
        'path_file',
        'tanggal_surat',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_surat' => 'date',
        ];
    }

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(PengajuanSurat::class, 'pengajuan_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penduduk extends Model
{
    protected $table = 'penduduk';

    protected $fillable = [
        'nik',
        'nama',
        'tanggal_lahir',
        'jenis_kelamin',
        'no_kk',
        'wilayah_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }
}

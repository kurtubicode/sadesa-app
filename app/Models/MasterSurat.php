<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterSurat extends Model
{
    protected $table = 'master_surat';

    protected $fillable = [
        'kode',
        'nama_surat',
        'persyaratan',
        'template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'persyaratan' => 'array',
            'is_active'   => 'boolean',
        ];
    }

    public function pengajuanSurat(): HasMany
    {
        return $this->hasMany(PengajuanSurat::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}

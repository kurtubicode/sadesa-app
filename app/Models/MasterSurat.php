<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterSurat extends Model
{
    protected $table = 'master_surat';

    protected $fillable = [
        'kode',
        'kategori',
        'nomor_prefix',
        'kode_bidang',
        'nama_surat',
        'deskripsi',
        'persyaratan',
        'template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'persyaratan' => 'array',
            'template'    => 'array',
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

    // Kategori yang tersedia
    public static function kategoriList(): array
    {
        return [
            'domisili'         => 'Domisili',
            'ijin'             => 'Ijin',
            'keterangan'       => 'Keterangan',
            'keterangan_tanah' => 'Keterangan Tanah',
            'pengantar_nikah'  => 'Pengantar Nikah',
        ];
    }
}

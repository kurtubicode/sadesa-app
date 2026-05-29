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
        'tempat_lahir',
        'jenis_kelamin',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'alamat',
        'no_kk',
        'wilayah_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    /** Label jenis kelamin untuk surat */
    public function getJenisKelaminLabelAttribute(): string
    {
        return $this->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    /** Label status perkawinan untuk surat */
    public function getStatusPerkawinanLabelAttribute(): string
    {
        return match ($this->status_perkawinan) {
            'belum_kawin'  => 'Belum Kawin',
            'kawin'        => 'Kawin',
            'cerai_hidup'  => 'Cerai Hidup',
            'cerai_mati'   => 'Cerai Mati',
            default        => '-',
        };
    }

    /** Label agama untuk surat (kapital) */
    public function getAgamaLabelAttribute(): string
    {
        return ucfirst($this->agama ?? '-');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }
}

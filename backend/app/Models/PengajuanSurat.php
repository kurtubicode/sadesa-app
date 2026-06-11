<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PengajuanSurat extends Model
{
    protected $table = 'pengajuan_surat';

    protected $fillable = [
        'no_pengajuan',
        'user_id',
        'master_surat_id',
        'data_formulir',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'data_formulir' => 'array',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function masterSurat(): BelongsTo
    {
        return $this->belongsTo(MasterSurat::class);
    }

    public function dokumenPersyaratan(): HasMany
    {
        return $this->hasMany(DokumenPersyaratan::class, 'pengajuan_id');
    }

    public function verifikasiBerkas(): HasOne
    {
        return $this->hasOne(VerifikasiBerkas::class, 'pengajuan_id');
    }

    public function pengesahanPermohonan(): HasOne
    {
        return $this->hasOne(PengesahanPermohonan::class, 'pengajuan_id');
    }

    public function suratOutput(): HasOne
    {
        return $this->hasOne(SuratOutput::class, 'pengajuan_id');
    }

    public function ulasan(): HasOne
    {
        return $this->hasOne(Ulasan::class, 'pengajuan_id');
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    /** Generate nomor pengajuan otomatis: ADM/YYYYMMDD/XXXX */
    public static function generateNoPengajuan(): string
    {
        $prefix = 'ADM/' . now()->format('Ymd') . '/';
        $last   = static::where('no_pengajuan', 'like', $prefix . '%')
                         ->orderByDesc('id')
                         ->value('no_pengajuan');

        $seq = $last ? (int) substr($last, -4) + 1 : 1;

        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}

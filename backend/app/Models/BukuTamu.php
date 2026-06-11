<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BukuTamu extends Model
{
    protected $table = 'buku_tamu';

    protected $fillable = [
        'nama_pengunjung',
        'instansi',
        'keperluan',
        'no_hp',
        'qr_token',
        'waktu_kunjungan',
    ];

    protected function casts(): array
    {
        return [
            'waktu_kunjungan' => 'datetime',
        ];
    }

    /** Auto-generate qr_token saat creating */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->qr_token)) {
                $model->qr_token = static::generateQrToken();
            }
        });
    }

    /** Generate token unik untuk QR code */
    public static function generateQrToken(): string
    {
        do {
            $token = Str::random(32);
        } while (static::where('qr_token', $token)->exists());

        return $token;
    }
}

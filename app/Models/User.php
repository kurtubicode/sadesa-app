<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'nik',
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
        'wilayah_id',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    public function pengajuanSurat(): HasMany
    {
        return $this->hasMany(PengajuanSurat::class);
    }

    public function verifikasiBerkas(): HasMany
    {
        return $this->hasMany(VerifikasiBerkas::class, 'staff_id');
    }

    public function pengesahanPermohonan(): HasMany
    {
        return $this->hasMany(PengesahanPermohonan::class, 'kepala_desa_id');
    }

    public function ulasan(): HasMany
    {
        return $this->hasMany(Ulasan::class);
    }

    public function pengaduan(): HasMany
    {
        return $this->hasMany(Pengaduan::class);
    }

    public function tanggapanPengaduan(): HasMany
    {
        return $this->hasMany(TanggapanPengaduan::class);
    }

    public function notifikasi(): HasMany
    {
        return $this->hasMany(Notifikasi::class);
    }

    public function broadcastNotifikasi(): HasMany
    {
        return $this->hasMany(BroadcastNotifikasi::class, 'admin_id');
    }

    public function kontenDesa(): HasMany
    {
        return $this->hasMany(KontenDesa::class, 'admin_id');
    }

    public function auditLog(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isKepalaDesa(): bool
    {
        return $this->role === 'kepala_desa';
    }

    public function isWarga(): bool
    {
        return $this->role === 'warga';
    }

    public function isAktif(): bool
    {
        return $this->status === 'aktif';
    }
}

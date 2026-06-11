<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $table    = 'app_settings';
    protected $fillable = ['key', 'value'];

    // ── Helpers ──────────────────────────────────────────────────────────────

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /** Semua setting sebagai key-value array. */
    public static function allAsArray(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}

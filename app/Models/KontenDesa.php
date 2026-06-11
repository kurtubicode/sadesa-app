<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class KontenDesa extends Model
{
    protected $table = 'konten_desa';

    protected $fillable = [
        'admin_id',
        'judul',
        'slug',
        'konten',
        'tipe',
        'status',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeBerita($query)
    {
        return $query->where('tipe', 'berita');
    }

    public function scopePengumuman($query)
    {
        return $query->where('tipe', 'pengumuman');
    }

    /** Auto-generate slug dari judul */
    public static function buatSlug(string $judul): string
    {
        $slug = Str::slug($judul);
        $count = static::where('slug', 'like', $slug . '%')->count();

        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }
}

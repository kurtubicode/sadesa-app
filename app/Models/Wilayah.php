<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $fillable = ['nama', 'tipe', 'parent_id'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Wilayah::class, 'parent_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function penduduk(): HasMany
    {
        return $this->hasMany(Penduduk::class);
    }
}

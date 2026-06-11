<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BroadcastNotifikasi extends Model
{
    protected $table = 'broadcast_notifikasi';

    protected $fillable = [
        'admin_id',
        'judul',
        'pesan',
        'target_role',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}

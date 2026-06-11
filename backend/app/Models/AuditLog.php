<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $table = 'audit_log';

    protected $fillable = [
        'user_id',
        'action',
        'model',
        'model_id',
        'data',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Catat aktivitas ke audit log */
    public static function catat(string $action, string $model, int $modelId, array $data = []): void
    {
        static::create([
            'user_id'    => auth()->id(),
            'action'     => $action,
            'model'      => $model,
            'model_id'   => $modelId,
            'data'       => $data,
            'ip_address' => request()->ip(),
        ]);
    }
}

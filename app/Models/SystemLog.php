<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Read-only view of the existing system_logs table (created by the
 * 2026_11_13 migration). The spatie/laravel-activitylog package is in the
 * lock file but was never wired: no activity_log table, no LogsActivity
 * usage anywhere. The admin Activity Logs page surfaces these rows
 * instead of inventing audit entries.
 */
class SystemLog extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

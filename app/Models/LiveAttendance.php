<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveAttendance extends Model
{
    protected $fillable = [
        'live_session_id',
        'user_id',
        'joined_at',
        'left_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(LiveSession::class, 'live_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The user's currently open attendance for a session, if any.
     */
    public static function openFor(int $liveSessionId, int $userId): ?static
    {
        return static::query()
            ->where('live_session_id', $liveSessionId)
            ->where('user_id', $userId)
            ->whereNull('left_at')
            ->latest('joined_at')
            ->first();
    }

    /**
     * Close every still-open attendance for a session (called when the
     * session ends or is cancelled, so nobody is left "in" forever).
     */
    public static function closeOpenForSession(int $liveSessionId): int
    {
        return static::query()
            ->where('live_session_id', $liveSessionId)
            ->whereNull('left_at')
            ->update(['left_at' => now()]);
    }

    public function toDisplayArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name ?? '',
            'joined_at' => $this->joined_at?->toIso8601String(),
            'left_at' => $this->left_at?->toIso8601String(),
            'present' => $this->left_at === null,
        ];
    }
}

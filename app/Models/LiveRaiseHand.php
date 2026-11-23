<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveRaiseHand extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_LOWERED = 'lowered';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_LOWERED,
    ];

    protected $fillable = [
        'live_session_id',
        'user_id',
        'status',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(LiveSession::class, 'live_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Raise (or re-raise) a hand: one row per user per session, so raising
     * again after lowering re-activates the same row.
     */
    public static function raise(int $liveSessionId, int $userId): static
    {
        return static::query()->updateOrCreate(
            ['live_session_id' => $liveSessionId, 'user_id' => $userId],
            ['status' => self::STATUS_PENDING],
        );
    }

    public static function lower(int $liveSessionId, int $userId): ?static
    {
        $hand = static::query()
            ->where('live_session_id', $liveSessionId)
            ->where('user_id', $userId)
            ->first();

        if ($hand && $hand->status === self::STATUS_PENDING) {
            $hand->update(['status' => self::STATUS_LOWERED]);
        }

        return $hand;
    }

    public function toDisplayArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name ?? '',
            'status' => $this->status,
            'raised_at' => $this->updated_at?->format('g:i A') ?? '',
        ];
    }
}

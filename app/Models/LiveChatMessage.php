<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveChatMessage extends Model
{
    protected $fillable = [
        'live_session_id',
        'user_id',
        'message',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(LiveSession::class, 'live_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toDisplayArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name ?? '',
            'message' => $this->message,
            'time' => $this->created_at?->format('g:i A') ?? '',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

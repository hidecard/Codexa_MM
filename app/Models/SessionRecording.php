<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionRecording extends Model
{
    protected $fillable = [
        'live_session_id',
        'title',
        'video_url',
        'duration',
        'views',
    ];

    protected function casts(): array
    {
        return [
            'views' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(LiveSession::class, 'live_session_id');
    }

    public function toDisplayArray(): array
    {
        $session = $this->session;

        return [
            'id' => $this->id,
            'live_session_id' => $this->live_session_id,
            'title' => $this->title,
            'video_url' => $this->video_url,
            'duration' => $this->duration ?? '',
            'dur' => $this->duration ?? '',
            'views' => $this->views,
            'session_title' => $session?->title ?? '',
            'instructor' => $session?->instructor?->name ?? '',
            'date' => $session?->scheduled_at?->format('Y-m-d') ?? ($this->created_at?->format('Y-m-d') ?? ''),
            'course' => $session?->course_id ?? 0,
        ];
    }
}

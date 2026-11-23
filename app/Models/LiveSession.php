<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveSession extends Model
{
    use HasFactory;

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_LIVE = 'live';
    public const STATUS_ENDED = 'ended';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_SCHEDULED,
        self::STATUS_LIVE,
        self::STATUS_ENDED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'course_id',
        'instructor_id',
        'title',
        'description',
        'scheduled_at',
        'duration_minutes',
        'meeting_url',
        'status',
        'max_participants',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'max_participants' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(LiveAttendance::class, 'live_session_id');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(LiveChatMessage::class, 'live_session_id');
    }

    public function raiseHands(): HasMany
    {
        return $this->hasMany(LiveRaiseHand::class, 'live_session_id');
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(SessionRecording::class, 'live_session_id');
    }

    /**
     * Users currently in the session (open attendance rows).
     */
    public function presentAttendances(): HasMany
    {
        return $this->attendances()->whereNull('left_at');
    }

    public function getEndsAtAttribute(): ?Carbon
    {
        return $this->scheduled_at?->copy()->addMinutes($this->duration_minutes ?? 0);
    }

    /**
     * Display shape shared by the admin Live page, the instructor host view
     * and the student Live Classes list. Day/month/time labels are formatted
     * in Myanmar to match the existing UI.
     */
    public function toDisplayArray(): array
    {
        $start = $this->scheduled_at;
        $end = $this->ends_at;

        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'instructor_id' => $this->instructor_id,
            'title' => $this->title,
            'description' => $this->description,
            'desc' => $this->description ?? '',
            'scheduled_at' => $start?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'meeting_url' => $this->meeting_url,
            'status' => $this->status,
            'max_participants' => $this->max_participants,
            'instructor' => $this->instructor?->name ?? '',
            'courseTitle' => $this->course?->title ?? '',
            'day' => $start ? $start->format('d') : '—',
            'mon' => $start ? self::myanmarMonth((int) $start->format('n')) : '',
            'when' => $start ? self::myanmarWhen($start) : '',
            'time' => $start && $end ? self::myanmarTimeRange($start, $end) : '',
            'liveNow' => $this->status === self::STATUS_LIVE,
            // Users who have ever joined (one attendance row per user, so
            // count(*) is the distinct count); controllers load this with
            // withCount('attendances') to avoid an extra query.
            'joined' => $this->attendances_count ?? $this->attendances()->count(),
        ];
    }

    public static function myanmarMonth(int $month): string
    {
        return [
            1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
            5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
            9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
        ][$month] ?? '';
    }

    public static function myanmarWhen(Carbon $date): string
    {
        $today = Carbon::today($date->getTimezone());

        if ($date->isSameDay($today)) {
            return 'ယနေ့';
        }
        if ($date->isSameDay($today->copy()->addDay())) {
            return 'မနက်ဖြန်';
        }
        if ($date->isSameDay($today->copy()->subDay())) {
            return 'မနေ့က';
        }

        return [
            0 => 'တနင်္ဂနွေ', 1 => 'တနင်္လာ', 2 => 'အင်္ဂါ', 3 => 'ဗုဒ္ဓဟူး',
            4 => 'ကြာသပတေး', 5 => 'သောကြာ', 6 => 'စနေ',
        ][(int) $date->format('w')] ?? $date->format('Y-m-d');
    }

    public static function myanmarTimeRange(Carbon $start, Carbon $end): string
    {
        return self::myanmarTime($start).' – '.self::myanmarTime($end, false);
    }

    private static function myanmarTime(Carbon $time, bool $withDaypart = true): string
    {
        $hour = (int) $time->format('G');
        // Matches the existing UI convention (sample data used ညနေ for 7pm).
        $daypart = $hour < 12 ? 'မနက်' : ($hour < 16 ? 'နေ့လယ်' : ($hour < 20 ? 'ညနေ' : 'ည'));

        return ($withDaypart ? $daypart.' ' : '').$time->format('g:i');
    }
}

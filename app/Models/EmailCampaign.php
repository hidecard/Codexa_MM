<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_SENT = 'sent';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SCHEDULED,
        self::STATUS_SENT,
    ];

    public const AUDIENCES = ['all', 'students', 'instructors'];

    public const AUDIENCE_LABELS = [
        'all' => 'အားလုံး',
        'students' => 'ကျောင်းသားများ',
        'instructors' => 'သင်ကြားသူများ',
    ];

    protected $fillable = [
        'name',
        'subject',
        'body',
        'audience',
        'status',
        'scheduled_at',
        'sent_at',
        'recipients_count',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
            'recipients_count' => 'integer',
        ];
    }

    /**
     * Active users covered by an audience, for per-recipient dispatch.
     * 'all' covers students and instructors; an unknown/empty audience
     * defaults to active students.
     *
     * @return \Illuminate\Database\Eloquent\Builder<User>
     */
    public static function audienceQuery(string $audience): \Illuminate\Database\Eloquent\Builder
    {
        $roles = match ($audience) {
            'all' => ['student', 'instructor'],
            'students' => ['student'],
            'instructors' => ['instructor'],
            default => ['student'],
        };

        return User::role($roles)->where('status', 'active')->orderBy('id');
    }

    /**
     * How many users the audience covers. Used when a campaign is sent.
     */
    public static function audienceCount(string $audience): int
    {
        return static::audienceQuery($audience)->count();
    }

    public function trackings(): HasMany
    {
        return $this->hasMany(CampaignTracking::class, 'email_campaign_id');
    }

    public function toDisplayArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subject' => $this->subject,
            'body' => $this->body,
            'audience' => $this->audience,
            'audience_label' => self::AUDIENCE_LABELS[$this->audience] ?? $this->audience,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'sent' => $this->status === self::STATUS_SENT ? $this->recipients_count : 0,
            // Per-recipient open/click counts; controllers load these with
            // withCount to avoid extra queries per campaign.
            'opened' => $this->opened_count ?? $this->trackings()->whereNotNull('opened_at')->count(),
            'clicked' => $this->clicked_count ?? $this->trackings()->whereNotNull('clicked_at')->count(),
            'when' => $this->sent_at
                ? $this->sent_at->format('Y-m-d')
                : ($this->scheduled_at ? 'စီစဉ်ထား · '.$this->scheduled_at->format('Y-m-d H:i') : 'မူကြမ်း'),
        ];
    }
}

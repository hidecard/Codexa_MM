<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
     * How many users the audience covers. Used when a campaign is sent.
     */
    public static function audienceCount(string $audience): int
    {
        return match ($audience) {
            'students' => User::role('student')->count(),
            'instructors' => User::role('instructor')->count(),
            default => User::role(['student', 'instructor'])->count(),
        };
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
            // No open/click tracking exists yet; 0 is honest.
            'opened' => 0,
            'clicked' => 0,
            'when' => $this->sent_at
                ? $this->sent_at->format('Y-m-d')
                : ($this->scheduled_at ? 'စီစဉ်ထား · '.$this->scheduled_at->format('Y-m-d H:i') : 'မူကြမ်း'),
        ];
    }
}

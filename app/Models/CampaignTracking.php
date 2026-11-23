<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CampaignTracking extends Model
{
    protected $fillable = [
        'email_campaign_id',
        'user_id',
        'email',
        'token',
        'opened_at',
        'clicked_at',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'clicked_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class, 'email_campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Find or create the tracking row for one recipient of a campaign.
     * This is the hook the mail worker calls at dispatch time, before
     * building the mailable, so the pixel/click URLs exist in the email.
     */
    public static function forRecipient(EmailCampaign $campaign, User $recipient): static
    {
        return static::query()->firstOrCreate(
            ['email_campaign_id' => $campaign->id, 'email' => $recipient->email],
            ['user_id' => $recipient->id, 'token' => Str::random(40)],
        );
    }

    /**
     * Create tracking rows for every active user in the campaign audience.
     * Returns how many rows were created (existing rows are kept).
     * One-line hook for campaign dispatch: call before sending.
     */
    public static function attachToCampaign(EmailCampaign $campaign): int
    {
        $created = 0;

        EmailCampaign::audienceQuery($campaign->audience)
            ->chunkById(200, function ($recipients) use ($campaign, &$created) {
                foreach ($recipients as $recipient) {
                    $tracking = static::forRecipient($campaign, $recipient);

                    if ($tracking->wasRecentlyCreated) {
                        $created++;
                    }
                }
            });

        return $created;
    }

    /**
     * Signed tracking-pixel URL to embed in the campaign email.
     */
    public function pixelUrl(): string
    {
        return URL::signedRoute('tracking.pixel', ['token' => $this->token]);
    }

    /**
     * Ready-to-embed 1x1 tracking pixel <img> tag.
     */
    public function pixelImgTag(): string
    {
        return '<img src="'.e($this->pixelUrl()).'" width="1" height="1" alt="" style="display:none;">';
    }

    /**
     * Signed click-redirect URL wrapping a destination link. The signature
     * covers the destination, so only links the app generated can redirect.
     */
    public function clickUrl(string $destination): string
    {
        return URL::signedRoute('tracking.click', [
            'token' => $this->token,
            'url' => $destination,
        ]);
    }

    /**
     * Record the first open only — repeat pixel loads don't inflate stats.
     */
    public function markOpened(): void
    {
        if ($this->opened_at === null) {
            $this->update(['opened_at' => now()]);
        }
    }

    /**
     * Record the first click only. A click implies the email was opened,
     * so an unrecorded open is recorded at the same time.
     */
    public function markClicked(): void
    {
        $updates = [];

        if ($this->opened_at === null) {
            $updates['opened_at'] = now();
        }

        if ($this->clicked_at === null) {
            $updates['clicked_at'] = now();
        }

        if ($updates !== []) {
            $this->update($updates);
        }
    }
}

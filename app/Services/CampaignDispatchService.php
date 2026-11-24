<?php

namespace App\Services;

use App\Mail\CampaignMail;
use App\Models\CampaignTracking;
use App\Models\EmailCampaign;
use Illuminate\Support\Facades\Mail;

class CampaignDispatchService
{
    /**
     * Mailers that never deliver real email. Sending is blocked while any of
     * these is configured so the UI can never claim a fake delivery.
     */
    private const NON_DELIVERY_MAILERS = ['log', 'array', 'fail', 'fake'];

    public function mailIsConfigured(): bool
    {
        $mailer = config('mail.default');

        if (! $mailer || in_array($mailer, self::NON_DELIVERY_MAILERS, true)) {
            return false;
        }

        return (bool) config('mail.from.address');
    }

    /**
     * Dispatch one queued mailable per active recipient in the campaign's
     * audience and mark the campaign sent. Returns how many mails were
     * queued.
     *
     * CampaignMail implements ShouldQueue, so this only enqueues jobs;
     * a queue worker (php artisan queue:work) delivers them.
     * Tracking rows are created first so stats can populate.
     */
    public function send(EmailCampaign $campaign): int
    {
        CampaignTracking::attachToCampaign($campaign);

        $dispatched = 0;

        EmailCampaign::audienceQuery($campaign->audience)
            ->chunkById(200, function ($recipients) use ($campaign, &$dispatched) {
                foreach ($recipients as $recipient) {
                    Mail::to($recipient)->queue(new CampaignMail($campaign, $recipient));
                    $dispatched++;
                }
            });

        $campaign->update([
            'status' => EmailCampaign::STATUS_SENT,
            'sent_at' => now(),
            'recipients_count' => $dispatched,
        ]);

        return $dispatched;
    }
}

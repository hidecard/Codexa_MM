<?php

namespace App\Console\Commands;

use App\Models\EmailCampaign;
use App\Services\CampaignDispatchService;
use Illuminate\Console\Command;

class SendScheduledCampaigns extends Command
{
    protected $signature = 'campaigns:send-scheduled';

    protected $description = 'Send email campaigns whose scheduled time has arrived.';

    public function handle(CampaignDispatchService $dispatcher): int
    {
        if (! $dispatcher->mailIsConfigured()) {
            $this->info('No real mailer is configured; scheduled campaigns were left untouched.');

            return self::SUCCESS;
        }

        $due = EmailCampaign::query()
            ->where('status', EmailCampaign::STATUS_SCHEDULED)
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at')
            ->get();

        if ($due->isEmpty()) {
            $this->info('No scheduled campaigns are due.');

            return self::SUCCESS;
        }

        foreach ($due as $campaign) {
            $dispatched = $dispatcher->send($campaign);

            $this->info("Sent campaign #{$campaign->id} ({$campaign->subject}) to {$dispatched} recipient(s).");
        }

        return self::SUCCESS;
    }
}

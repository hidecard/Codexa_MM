<?php

namespace App\Mail;

use App\Models\CampaignTracking;
use App\Models\EmailCampaign;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public EmailCampaign $campaign,
        public User $recipient,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->campaign->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.campaign',
            with: [
                'campaign' => $this->campaign,
                'recipient' => $this->recipient,
                // Idempotent: the row is created at send time; this only
                // resolves it so the blade can embed the tracking pixel.
                'tracking' => CampaignTracking::forRecipient($this->campaign, $this->recipient),
            ],
        );
    }
}

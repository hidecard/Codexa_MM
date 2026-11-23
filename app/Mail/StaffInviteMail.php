<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffInviteMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  string  $setupUrl  Temporary signed URL to the invite-accept page.
     */
    public function __construct(
        public User $user,
        public string $setupUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You are invited to join Codexa MM as staff',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff-invite',
            with: [
                'user' => $this->user,
                'setupUrl' => $this->setupUrl,
            ],
        );
    }
}

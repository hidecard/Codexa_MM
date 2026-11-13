<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactMessageReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ContactMessage $contactMessage) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Codexa MM contact inquiry')
            ->greeting('A new contact inquiry has arrived.')
            ->line("From: {$this->contactMessage->name} <{$this->contactMessage->email}>")
            ->line("Subject: {$this->contactMessage->subject}")
            ->line($this->contactMessage->message)
            ->action('Open admin portal', url('/admin/dashboard'));
    }
}

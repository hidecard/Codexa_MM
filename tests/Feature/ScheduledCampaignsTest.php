<?php

use App\Mail\CampaignMail;
use App\Models\EmailCampaign;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function schedMakeStudent(array $overrides = []): User
{
    $user = User::factory()->create(array_merge(['status' => 'active'], $overrides));
    $user->assignRole('student');

    return $user;
}

function schedMakeCampaign(array $overrides = []): EmailCampaign
{
    return EmailCampaign::create(array_merge([
        'name' => 'Scheduled',
        'subject' => 'Scheduled subject',
        'body' => 'Hello!',
        'audience' => 'students',
        'status' => EmailCampaign::STATUS_SCHEDULED,
        'scheduled_at' => now()->subHour(),
    ], $overrides));
}

test('campaigns:send-scheduled sends campaigns whose scheduled time has arrived', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    $studentA = schedMakeStudent();
    $studentB = schedMakeStudent();
    schedMakeStudent(['status' => 'inactive']); // must not receive anything

    $campaign = schedMakeCampaign();

    $exitCode = $this->artisan('campaigns:send-scheduled')->run();

    expect($exitCode)->toBe(0);
    Mail::assertQueued(CampaignMail::class, 2);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($studentA->email)
        && $mail->campaign->id === $campaign->id);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($studentB->email));

    expect($campaign->fresh()->status)->toBe('sent')
        ->and($campaign->fresh()->sent_at)->not->toBeNull()
        ->and($campaign->fresh()->recipients_count)->toBe(2);
});

test('campaigns:send-scheduled skips campaigns that are not yet due', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    schedMakeStudent();
    $campaign = schedMakeCampaign(['scheduled_at' => now()->addHour()]);

    $exitCode = $this->artisan('campaigns:send-scheduled')->run();

    expect($exitCode)->toBe(0);
    Mail::assertNothingQueued();

    expect($campaign->fresh()->status)->toBe('scheduled')
        ->and($campaign->fresh()->sent_at)->toBeNull()
        ->and($campaign->fresh()->recipients_count)->toBe(0);
});

test('campaigns:send-scheduled skips campaigns that were already sent', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    schedMakeStudent();
    $campaign = schedMakeCampaign([
        'status' => EmailCampaign::STATUS_SENT,
        'sent_at' => now()->subDay(),
        'recipients_count' => 3,
    ]);

    $exitCode = $this->artisan('campaigns:send-scheduled')->run();

    expect($exitCode)->toBe(0);
    Mail::assertNothingQueued();

    expect($campaign->fresh()->status)->toBe('sent')
        ->and($campaign->fresh()->recipients_count)->toBe(3);
});

test('campaigns:send-scheduled skips drafts even with a past scheduled time', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    schedMakeStudent();
    $campaign = schedMakeCampaign(['status' => EmailCampaign::STATUS_DRAFT]);

    $this->artisan('campaigns:send-scheduled')->run();

    Mail::assertNothingQueued();
    expect($campaign->fresh()->status)->toBe('draft');
});

test('campaigns:send-scheduled leaves due campaigns untouched without a real mailer', function () {
    Mail::fake();
    config(['mail.default' => 'log']);

    schedMakeStudent();
    $campaign = schedMakeCampaign();

    $exitCode = $this->artisan('campaigns:send-scheduled')->run();

    expect($exitCode)->toBe(0);
    Mail::assertNothingQueued();

    expect($campaign->fresh()->status)->toBe('scheduled')
        ->and($campaign->fresh()->sent_at)->toBeNull();
});

test('campaigns:send-scheduled sends only the due campaign when several exist', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    schedMakeStudent();
    $due = schedMakeCampaign(['subject' => 'Due now']);
    $future = schedMakeCampaign(['subject' => 'Later', 'scheduled_at' => now()->addDay()]);

    $this->artisan('campaigns:send-scheduled')->run();

    Mail::assertQueued(CampaignMail::class, 1);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->campaign->id === $due->id);
    Mail::assertNotQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->campaign->id === $future->id);

    expect($due->fresh()->status)->toBe('sent')
        ->and($future->fresh()->status)->toBe('scheduled');
});

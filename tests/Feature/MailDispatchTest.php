<?php

use App\Mail\CampaignMail;
use App\Mail\StaffInviteMail;
use App\Models\EmailCampaign;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function mailMakeAdmin(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('admin');

    return $user;
}

function mailMakeStudent(array $overrides = []): User
{
    $user = User::factory()->create(array_merge(['status' => 'active'], $overrides));
    $user->assignRole('student');

    return $user;
}

function mailMakeInstructor(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('instructor');

    return $user;
}

// ---------------------------------------------------------------------------
// Email campaigns
// ---------------------------------------------------------------------------

test('campaign send dispatches one queued mail per active student in the audience', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    $studentA = mailMakeStudent();
    $studentB = mailMakeStudent();
    mailMakeStudent(['status' => 'inactive']); // must not receive anything
    mailMakeInstructor(); // wrong audience
    $admin = mailMakeAdmin();

    $campaign = EmailCampaign::create([
        'name' => 'Promo', 'subject' => '50% OFF', 'body' => 'Hello!', 'audience' => 'students',
    ]);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    Mail::assertQueued(CampaignMail::class, 2);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($studentA->email)
        && $mail->campaign->id === $campaign->id
        && $mail->recipient->id === $studentA->id);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($studentB->email));

    expect($campaign->fresh()->status)->toBe('sent')
        ->and($campaign->fresh()->sent_at)->not->toBeNull()
        ->and($campaign->fresh()->recipients_count)->toBe(2);
});

test('campaign send with audience all reaches students and instructors but not admins', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    $student = mailMakeStudent();
    $instructor = mailMakeInstructor();
    $admin = mailMakeAdmin();

    $campaign = EmailCampaign::create([
        'name' => 'News', 'subject' => 'News', 'body' => 'Hi all', 'audience' => 'all',
    ]);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    Mail::assertQueued(CampaignMail::class, 2);
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($student->email));
    Mail::assertQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($instructor->email));
    Mail::assertNotQueued(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo($admin->email));

    expect($campaign->fresh()->recipients_count)->toBe(2);
});

test('campaign send with the log mailer errors and queues nothing', function () {
    Mail::fake();
    config(['mail.default' => 'log']);

    $admin = mailMakeAdmin();
    mailMakeStudent();
    $campaign = EmailCampaign::create([
        'name' => 'X', 'subject' => 'Y', 'body' => '', 'audience' => 'all',
    ]);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertSessionHasErrors('send');

    Mail::assertNothingQueued();
    expect($campaign->fresh()->status)->toBe('draft');
});

// ---------------------------------------------------------------------------
// Staff invites
// ---------------------------------------------------------------------------

test('staff invite queues an invitation email with a valid signed setup link', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);
    $admin = mailMakeAdmin();

    $this->actingAs($admin)->post('/admin/academy/staff/invite', [
        'name' => 'Sam Support',
        'email' => 'sam@test.com',
        'role' => 'Support',
    ])->assertRedirect()
        ->assertSessionHas('success');

    $user = User::query()->where('email', 'sam@test.com')->firstOrFail();

    Mail::assertQueued(StaffInviteMail::class, 1);
    Mail::assertQueued(StaffInviteMail::class, function (StaffInviteMail $mail) use ($user) {
        return $mail->hasTo('sam@test.com')
            && $mail->user->id === $user->id
            && str_contains($mail->setupUrl, '/staff-invite/'.$user->id)
            && URL::hasValidSignature(Request::create($mail->setupUrl));
    });
});

test('staff invite without a real mailer shows the setup link to the admin', function () {
    Mail::fake();
    config(['mail.default' => 'log']);
    $admin = mailMakeAdmin();

    $response = $this->actingAs($admin)->post('/admin/academy/staff/invite', [
        'name' => 'Fay Finance',
        'email' => 'fay@test.com',
        'role' => 'Finance',
    ])->assertRedirect();

    $user = User::query()->where('email', 'fay@test.com')->firstOrFail();
    $message = $response->getSession()->get('success');

    expect($message)->toContain('No mailer is configured')
        ->and($message)->toContain('/staff-invite/'.$user->id);

    // The mail is still queued (it lands in the log once a worker runs it).
    Mail::assertQueued(StaffInviteMail::class, 1);
});

// ---------------------------------------------------------------------------
// Invite acceptance
// ---------------------------------------------------------------------------

test('invite accept page loads with a valid signed link', function () {
    $invited = User::factory()->create(['status' => 'active']);
    $url = URL::temporarySignedRoute('staff.invite.accept', now()->addDays(7), ['user' => $invited->id]);

    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/AcceptInvite')
            ->where('email', $invited->email)
            ->where('name', $invited->name)
        );
});

test('invite accept page rejects unsigned and expired links', function () {
    $invited = User::factory()->create(['status' => 'active']);

    $this->get('/staff-invite/'.$invited->id)->assertForbidden();

    $expired = URL::temporarySignedRoute('staff.invite.accept', now()->subMinute(), ['user' => $invited->id]);
    $this->get($expired)->assertForbidden();
});

test('accepting an invite sets the password and redirects to login', function () {
    $invited = User::factory()->create(['status' => 'active']);
    $url = URL::temporarySignedRoute('staff.invite.accept', now()->addDays(7), ['user' => $invited->id]);

    $this->post($url, [
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertRedirect(route('login'));

    expect(Hash::check('new-secure-password', $invited->fresh()->password))->toBeTrue();
});

test('accepting an invite rejects mismatched passwords', function () {
    $invited = User::factory()->create(['status' => 'active']);
    $originalHash = $invited->password;
    $url = URL::temporarySignedRoute('staff.invite.accept', now()->addDays(7), ['user' => $invited->id]);

    $this->post($url, [
        'password' => 'new-secure-password',
        'password_confirmation' => 'something-else',
    ])->assertSessionHasErrors('password');

    expect($invited->fresh()->password)->toBe($originalHash);
});

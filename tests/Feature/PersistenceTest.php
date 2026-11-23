<?php

// Worker B (Persistence) — integration settings, import history, live room
// (attendance/chat/raise-hand), session recordings, campaign tracking.

use App\Models\CampaignTracking;
use App\Models\Course;
use App\Models\EmailCampaign;
use App\Models\ImportHistory;
use App\Models\LiveAttendance;
use App\Models\LiveChatMessage;
use App\Models\LiveRaiseHand;
use App\Models\LiveSession;
use App\Models\SessionRecording;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function persistAdmin(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('admin');

    return $user;
}

function persistInstructor(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('instructor');

    return $user;
}

function persistStudent(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('student');

    return $user;
}

function persistSession(User $instructor, array $overrides = []): LiveSession
{
    return LiveSession::create(array_merge([
        'instructor_id' => $instructor->id,
        'title' => 'React Hooks Deep Dive — Live',
        'description' => 'useState and useEffect, live.',
        'scheduled_at' => now()->addDay()->setTime(19, 0)->toDateTimeString(),
        'duration_minutes' => 90,
        'meeting_url' => 'https://zoom.us/j/123456789',
        'max_participants' => 100,
    ], $overrides));
}

function persistCsvUpload(string $content, string $name = 'courses.csv'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($name, $content);
}

// ---- Integration settings ----

test('integration settings persist webhook url and service toggles', function () {
    $admin = persistAdmin();

    $this->actingAs($admin)
        ->put('/admin/academy/integrations/settings', [
            'webhook_url' => 'https://example.com/hooks/payments',
            'services' => ['zoom' => true, 'ga' => false, 'kbzpay' => false],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('settings', ['key' => 'webhook_url', 'value' => 'https://example.com/hooks/payments', 'group' => 'integrations']);
    $this->assertDatabaseHas('settings', ['key' => 'integration_zoom', 'value' => '1']);
    $this->assertDatabaseHas('settings', ['key' => 'integration_ga', 'value' => '0']);
    $this->assertDatabaseHas('settings', ['key' => 'integration_kbzpay', 'value' => '0']);

    $this->actingAs($admin)->get('/admin/academy/integrations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('integrations.webhook_url', 'https://example.com/hooks/payments')
            ->where('integrations.services.zoom', true)
            ->where('integrations.services.ga', false)
            ->where('integrations.services.kbzpay', false));
});

test('integration settings validate the webhook url', function () {
    $admin = persistAdmin();

    $this->actingAs($admin)
        ->put('/admin/academy/integrations/settings', ['webhook_url' => 'not-a-url'])
        ->assertSessionHasErrors('webhook_url');
});

test('integration settings reject non-admins', function () {
    $student = persistStudent();

    $this->actingAs($student)
        ->put('/admin/academy/integrations/settings', ['webhook_url' => 'https://example.com/hooks'])
        ->assertForbidden();
});

test('integration defaults seed on first visit', function () {
    $admin = persistAdmin();

    $this->actingAs($admin)->get('/admin/academy/integrations')->assertOk();

    expect(Setting::getValue('webhook_url'))->toBe('https://codexamm.com/webhooks/payments')
        ->and(Setting::getValue('integration_kbzpay'))->toBeTrue()
        ->and(Setting::getValue('integration_zoom'))->toBeFalse();
});

// ---- Import history ----

test('import confirm records history with filename and counts', function () {
    $admin = persistAdmin();
    $csv = "React Hooks Masterclass,Web Development,95000,intermediate\n,Programming,1000,beginner\nPython Basics,Programming,,beginner\n";

    $this->actingAs($admin)->post('/admin/academy/import/preview', ['file' => persistCsvUpload($csv, 'my-courses.csv')]);
    $token = session('import_preview')['token'];

    $this->actingAs($admin)
        ->post('/admin/academy/import/confirm', ['token' => $token])
        ->assertRedirect();

    $this->assertDatabaseHas('import_histories', [
        'user_id' => $admin->id,
        'filename' => 'my-courses.csv',
        'status' => 'partial',
        'rows_total' => 3,
        'rows_imported' => 2,
        'rows_skipped' => 1,
        'rows_failed' => 0,
    ]);

    $this->actingAs($admin)->get('/admin/academy/import')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('history', 1)
            ->where('history.0.filename', 'my-courses.csv')
            ->where('history.0.status', 'partial')
            ->where('history.0.rows_imported', 2));
});

test('import history marks a fully failed import as failed', function () {
    $admin = persistAdmin();
    $csv = "Bad Price,Design,not-a-number,beginner\n";

    $this->actingAs($admin)->post('/admin/academy/import/preview', ['file' => persistCsvUpload($csv)]);
    $token = session('import_preview')['token'];

    $this->actingAs($admin)->post('/admin/academy/import/confirm', ['token' => $token])->assertRedirect();

    $this->assertDatabaseHas('import_histories', [
        'status' => 'failed',
        'rows_total' => 1,
        'rows_imported' => 0,
        'rows_failed' => 1,
    ]);
});

test('import confirm cleans up the stored file and its meta sidecar', function () {
    $admin = persistAdmin();
    $csv = "React Hooks,Web Development,95000,intermediate\n";

    $this->actingAs($admin)->post('/admin/academy/import/preview', ['file' => persistCsvUpload($csv)]);
    $token = session('import_preview')['token'];

    expect(Storage::disk('local')->exists('imports/'.$token.'.meta'))->toBeTrue();

    $this->actingAs($admin)->post('/admin/academy/import/confirm', ['token' => $token])->assertRedirect();

    expect(Storage::disk('local')->exists('imports/'.$token))->toBeFalse()
        ->and(Storage::disk('local')->exists('imports/'.$token.'.meta'))->toBeFalse();
});

// ---- Live room: attendance ----

test('student can join a live session and re-joining does not duplicate attendance', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/join")
        ->assertOk()
        ->assertJsonPath('joined', true);

    $this->assertDatabaseHas('live_attendances', [
        'live_session_id' => $session->id,
        'user_id' => $student->id,
        'left_at' => null,
    ]);

    // Re-joining re-opens the same row.
    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/join")
        ->assertOk();

    expect(LiveAttendance::where('live_session_id', $session->id)->count())->toBe(1);

    // The joined count on the session now reflects real attendance.
    expect($session->fresh()->toDisplayArray()['joined'])->toBe(1);
});

test('student cannot join a session that is not live', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'scheduled']);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/join")
        ->assertStatus(422);

    expect(LiveAttendance::count())->toBe(0);
});

test('student can leave a session and attendance closes', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $this->actingAs($student)->postJson("/student/live-classes/{$session->id}/join")->assertOk();

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/leave")
        ->assertOk()
        ->assertJsonPath('joined', false);

    expect(LiveAttendance::openFor($session->id, $student->id))->toBeNull()
        ->and(LiveAttendance::where('live_session_id', $session->id)->first()->left_at)->not->toBeNull();
});

test('join respects max_participants', function () {
    $instructor = persistInstructor();
    $session = persistSession($instructor, ['status' => 'live', 'max_participants' => 1]);

    $first = persistStudent();
    $second = persistStudent();

    $this->actingAs($first)->postJson("/student/live-classes/{$session->id}/join")->assertOk();

    $this->actingAs($second)
        ->postJson("/student/live-classes/{$session->id}/join")
        ->assertStatus(422);

    expect(LiveAttendance::where('live_session_id', $session->id)->count())->toBe(1);
});

test('ending a session closes open attendance rows', function () {
    $admin = persistAdmin();
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $this->actingAs($student)->postJson("/student/live-classes/{$session->id}/join")->assertOk();

    $this->actingAs($admin)->post("/admin/academy/live-classes/{$session->id}/end")->assertRedirect();

    expect(LiveAttendance::openFor($session->id, $student->id))->toBeNull();
});

// ---- Live room: chat ----

test('student can post chat and room state returns it with attendees', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $this->actingAs($student)->postJson("/student/live-classes/{$session->id}/join")->assertOk();

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/chat", ['message' => 'ဆရာ အသံ ကောင်းပါတယ်'])
        ->assertCreated()
        ->assertJsonPath('message.message', 'ဆရာ အသံ ကောင်းပါတယ်')
        ->assertJsonPath('message.is_host', false);

    $this->assertDatabaseHas('live_chat_messages', [
        'live_session_id' => $session->id,
        'user_id' => $student->id,
        'message' => 'ဆရာ အသံ ကောင်းပါတယ်',
    ]);

    $this->actingAs($student)
        ->getJson("/student/live-classes/{$session->id}/room")
        ->assertOk()
        ->assertJsonPath('attendance_count', 1)
        ->assertJsonPath('joined', true)
        ->assertJsonCount(1, 'chat')
        ->assertJsonCount(1, 'attendees')
        ->assertJsonPath('attendees.0.name', $student->name);
});

test('chat requires a live session', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'scheduled']);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/chat", ['message' => 'hello'])
        ->assertStatus(422);

    expect(LiveChatMessage::count())->toBe(0);
});

test('instructor can chat in own session but not in another instructor session', function () {
    $owner = persistInstructor();
    $other = persistInstructor();
    $session = persistSession($owner, ['status' => 'live']);

    $this->actingAs($owner)
        ->postJson("/instructor/live-host/{$session->id}/chat", ['message' => 'Welcome everyone'])
        ->assertCreated()
        ->assertJsonPath('message.is_host', true);

    $this->actingAs($other)
        ->postJson("/instructor/live-host/{$session->id}/chat", ['message' => 'intruder'])
        ->assertForbidden();

    $this->actingAs($other)
        ->getJson("/instructor/live-host/{$session->id}/room")
        ->assertForbidden();

    expect(LiveChatMessage::count())->toBe(1);
});

// ---- Live room: raise hand ----

test('student can raise and lower a hand, and re-raising reactivates it', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/raise-hand")
        ->assertOk()
        ->assertJsonPath('raised', true);

    $this->assertDatabaseHas('live_raise_hands', [
        'live_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'pending',
    ]);

    $this->actingAs($student)
        ->getJson("/student/live-classes/{$session->id}/room")
        ->assertOk()
        ->assertJsonPath('my_hand_raised', true)
        ->assertJsonCount(1, 'raised_hands');

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/lower-hand")
        ->assertOk()
        ->assertJsonPath('raised', false);

    expect(LiveRaiseHand::first()->status)->toBe('lowered');

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/raise-hand")
        ->assertOk();

    expect(LiveRaiseHand::count())->toBe(1)
        ->and(LiveRaiseHand::first()->status)->toBe('pending');
});

test('host can lower a raised hand', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'live']);

    $hand = LiveRaiseHand::raise($session->id, $student->id);

    $this->actingAs($instructor)
        ->postJson("/instructor/live-host/{$session->id}/raise-hands/{$hand->id}/lower")
        ->assertOk()
        ->assertJsonPath('lowered', true);

    expect($hand->fresh()->status)->toBe('lowered');
});

test('raise hand requires a live session', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'scheduled']);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/raise-hand")
        ->assertStatus(422);

    expect(LiveRaiseHand::count())->toBe(0);
});

// ---- Session recordings ----

test('admin can create, update and delete a recording', function () {
    $admin = persistAdmin();
    $instructor = persistInstructor();
    $session = persistSession($instructor, ['status' => 'ended']);

    $this->actingAs($admin)
        ->post('/admin/academy/live-classes/recordings', [
            'live_session_id' => $session->id,
            'title' => 'React Hooks — Recording',
            'video_url' => 'https://www.youtube.com/watch?v=abc123',
            'duration' => '1:24:00',
        ])
        ->assertRedirect();

    $recording = SessionRecording::firstOrFail();
    expect($recording->title)->toBe('React Hooks — Recording')
        ->and($recording->views)->toBe(0);

    $this->actingAs($admin)
        ->put("/admin/academy/live-classes/recordings/{$recording->id}", [
            'live_session_id' => $session->id,
            'title' => 'React Hooks — Recording (edited)',
            'video_url' => 'https://www.youtube.com/watch?v=abc123',
            'duration' => '1:25:00',
        ])
        ->assertRedirect();

    expect($recording->fresh()->title)->toBe('React Hooks — Recording (edited)');

    $this->actingAs($admin)
        ->delete("/admin/academy/live-classes/recordings/{$recording->id}")
        ->assertRedirect();

    expect(SessionRecording::count())->toBe(0);
});

test('recording creation validates its fields', function () {
    $admin = persistAdmin();

    $this->actingAs($admin)
        ->post('/admin/academy/live-classes/recordings', [
            'live_session_id' => 99999,
            'title' => '',
            'video_url' => 'not-a-url',
        ])
        ->assertSessionHasErrors(['live_session_id', 'title', 'video_url']);
});

test('student view increment counts views and rejects mismatched sessions', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'ended']);
    $otherSession = persistSession($instructor, ['status' => 'ended']);
    $recording = SessionRecording::create([
        'live_session_id' => $session->id,
        'title' => 'Recording',
        'video_url' => 'https://www.youtube.com/watch?v=abc123',
        'duration' => '1:00:00',
    ]);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/recordings/{$recording->id}/view")
        ->assertOk()
        ->assertJsonPath('views', 1);

    $this->actingAs($student)
        ->postJson("/student/live-classes/{$session->id}/recordings/{$recording->id}/view")
        ->assertOk()
        ->assertJsonPath('views', 2);

    // The recording does not belong to the other session.
    $this->actingAs($student)
        ->postJson("/student/live-classes/{$otherSession->id}/recordings/{$recording->id}/view")
        ->assertNotFound();
});

test('ended sessions without a recording still appear in the recorded list', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $withRecording = persistSession($instructor, ['status' => 'ended', 'title' => 'With Recording', 'scheduled_at' => now()->subDay()->setTime(19, 0)->toDateTimeString()]);
    $withoutRecording = persistSession($instructor, ['status' => 'ended', 'title' => 'Without Recording', 'scheduled_at' => now()->subDays(2)->setTime(19, 0)->toDateTimeString()]);
    SessionRecording::create([
        'live_session_id' => $withRecording->id,
        'title' => 'With Recording — Video',
        'video_url' => 'https://www.youtube.com/watch?v=abc123',
        'duration' => '1:00:00',
        'views' => 3,
    ]);

    $this->actingAs($student)->get('/student/live-classes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('recorded', 2)
            ->where('recorded.0.title', 'With Recording — Video')
            ->where('recorded.0.views', 3)
            ->where('recorded.1.title', 'Without Recording')
            ->where('recorded.1.video_url', null)
            ->where('recorded.1.views', 0));

    expect($withoutRecording->fresh()->status)->toBe('ended');
});

test('student live list and detail show real recordings with view counts', function () {
    $instructor = persistInstructor();
    $student = persistStudent();
    $session = persistSession($instructor, ['status' => 'ended']);
    SessionRecording::create([
        'live_session_id' => $session->id,
        'title' => 'React Hooks — Recording',
        'video_url' => 'https://www.youtube.com/watch?v=abc123',
        'duration' => '1:24:00',
        'views' => 7,
    ]);

    $this->actingAs($student)->get('/student/live-classes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('recorded', 1)
            ->where('recorded.0.title', 'React Hooks — Recording')
            ->where('recorded.0.views', 7)
            ->where('recorded.0.video_url', 'https://www.youtube.com/watch?v=abc123'));

    $this->actingAs($student)->get("/student/live-classes/{$session->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('recordings', 1)
            ->where('recordings.0.title', 'React Hooks — Recording'));
});

// ---- Campaign tracking ----

function persistCampaign(array $overrides = []): EmailCampaign
{
    return EmailCampaign::create(array_merge([
        'name' => 'Welcome series',
        'subject' => 'Welcome to Codexa MM',
        'body' => 'Hello!',
        'audience' => 'students',
        'status' => 'sent',
        'sent_at' => now(),
        'recipients_count' => 1,
    ], $overrides));
}

test('tracking pixel records the first open only and returns a gif', function () {
    $campaign = persistCampaign();
    $student = persistStudent();
    $tracking = CampaignTracking::forRecipient($campaign, $student);

    $this->get($tracking->pixelUrl())
        ->assertOk()
        ->assertHeader('Content-Type', 'image/gif');

    expect($tracking->fresh()->opened_at)->not->toBeNull();

    $firstOpen = $tracking->fresh()->opened_at;

    // A second load does not move the timestamp.
    $this->get($tracking->pixelUrl())->assertOk();

    expect($tracking->fresh()->opened_at->equalTo($firstOpen))->toBeTrue();
});

test('tracking pixel with an invalid signature does not record an open', function () {
    $campaign = persistCampaign();
    $student = persistStudent();
    $tracking = CampaignTracking::forRecipient($campaign, $student);

    // Unsigned URL: the pixel still returns, but nothing is recorded.
    $this->get('/t/o/'.$tracking->token)->assertOk();

    expect($tracking->fresh()->opened_at)->toBeNull();
});

test('click redirect records click and open and redirects to the destination', function () {
    $campaign = persistCampaign();
    $student = persistStudent();
    $tracking = CampaignTracking::forRecipient($campaign, $student);

    $this->get($tracking->clickUrl('https://codexamm.com/courses'))
        ->assertRedirect('https://codexamm.com/courses');

    $fresh = $tracking->fresh();
    expect($fresh->clicked_at)->not->toBeNull()
        ->and($fresh->opened_at)->not->toBeNull();
});

test('click redirect with an invalid signature is rejected', function () {
    $campaign = persistCampaign();
    $student = persistStudent();
    $tracking = CampaignTracking::forRecipient($campaign, $student);

    $this->get('/t/c/'.$tracking->token.'?url=https://example.com')->assertNotFound();

    expect($tracking->fresh()->clicked_at)->toBeNull();
});

test('campaign display shows real opened and clicked counts', function () {
    $admin = persistAdmin();
    $campaign = persistCampaign();
    $first = persistStudent();
    $second = persistStudent();
    $opened = CampaignTracking::forRecipient($campaign, $first);
    $opened->markOpened();
    $clicked = CampaignTracking::forRecipient($campaign, $second);
    $clicked->markClicked();

    $this->actingAs($admin)->get('/admin/academy/marketing')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('campaigns', 1)
            ->where('campaigns.0.opened', 2)
            ->where('campaigns.0.clicked', 1));
});

test('attachToCampaign creates one tracking row per audience recipient', function () {
    persistStudent();
    persistStudent();
    persistInstructor();
    $campaign = persistCampaign(['audience' => 'students', 'status' => 'draft']);

    // The seeder also creates students, so count the audience dynamically.
    $expected = EmailCampaign::audienceCount('students');

    expect(CampaignTracking::attachToCampaign($campaign))->toBe($expected)
        ->and(CampaignTracking::where('email_campaign_id', $campaign->id)->count())->toBe($expected);

    // Idempotent: a second attach creates nothing new.
    expect(CampaignTracking::attachToCampaign($campaign))->toBe(0)
        ->and(CampaignTracking::where('email_campaign_id', $campaign->id)->count())->toBe($expected);

    // The instructor is outside the 'students' audience.
    expect(CampaignTracking::where('email_campaign_id', $campaign->id)->whereHas('user', fn ($q) => $q->role('instructor'))->count())->toBe(0);
});

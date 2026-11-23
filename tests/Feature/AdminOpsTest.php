<?php

// Worker 4 — Admin ops + live sessions.

use App\Http\Controllers\Admin\Academy\ImportController;
use App\Http\Controllers\Admin\Academy\IntegrationController;
use App\Http\Controllers\Admin\Academy\LiveSessionController;
use App\Http\Controllers\Admin\Academy\MarketingController;
use App\Http\Controllers\Admin\Academy\SystemController;
use App\Models\ApiKey;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\EmailCampaign;
use App\Models\LiveSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function makeAdmin(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('admin');

    return $user;
}

function makeInstructor(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('instructor');

    return $user;
}

function makeStudent(): User
{
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('student');

    return $user;
}

function sessionPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'React Hooks Deep Dive — Live',
        'description' => 'useState and useEffect, live.',
        'scheduled_at' => now()->addDay()->setTime(19, 0)->toDateTimeString(),
        'duration_minutes' => 90,
        'meeting_url' => 'https://zoom.us/j/123456789',
        'max_participants' => 100,
    ], $overrides);
}

// ---- Live sessions: admin CRUD + status actions (HTTP) ----

test('admin can create a live session', function () {
    $admin = makeAdmin();
    $instructor = makeInstructor();

    $this->actingAs($admin)
        ->post('/admin/academy/live-classes', sessionPayload(['instructor_id' => $instructor->id]))
        ->assertRedirect();

    $this->assertDatabaseHas('live_sessions', [
        'title' => 'React Hooks Deep Dive — Live',
        'instructor_id' => $instructor->id,
        'status' => 'scheduled',
        'duration_minutes' => 90,
    ]);
});

test('live session creation validates required fields', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->post('/admin/academy/live-classes', ['title' => ''])
        ->assertSessionHasErrors(['title', 'instructor_id', 'scheduled_at', 'duration_minutes']);
});

test('admin can update and delete a live session', function () {
    $admin = makeAdmin();
    $instructor = makeInstructor();
    $session = LiveSession::create(sessionPayload(['instructor_id' => $instructor->id]));

    $this->actingAs($admin)
        ->put('/admin/academy/live-classes/'.$session->id, sessionPayload([
            'instructor_id' => $instructor->id,
            'title' => 'Renamed Session',
            'duration_minutes' => 60,
        ]))
        ->assertRedirect();

    expect($session->fresh()->title)->toBe('Renamed Session')
        ->and($session->fresh()->duration_minutes)->toBe(60);

    $this->actingAs($admin)
        ->delete('/admin/academy/live-classes/'.$session->id)
        ->assertRedirect();

    $this->assertDatabaseMissing('live_sessions', ['id' => $session->id]);
});

test('live session status transitions enforce their state machine', function () {
    $admin = makeAdmin();
    $instructor = makeInstructor();
    $session = LiveSession::create(sessionPayload(['instructor_id' => $instructor->id]));

    // Cannot end a session that never started.
    $this->actingAs($admin)
        ->post('/admin/academy/live-classes/'.$session->id.'/end')
        ->assertSessionHasErrors('status');
    expect($session->fresh()->status)->toBe('scheduled');

    $this->actingAs($admin)->post('/admin/academy/live-classes/'.$session->id.'/start')->assertRedirect();
    expect($session->fresh()->status)->toBe('live');

    $this->actingAs($admin)->post('/admin/academy/live-classes/'.$session->id.'/end')->assertRedirect();
    expect($session->fresh()->status)->toBe('ended');

    // Ended sessions cannot be cancelled.
    $this->actingAs($admin)
        ->post('/admin/academy/live-classes/'.$session->id.'/cancel')
        ->assertSessionHasErrors('status');
});

test('cancelled live sessions can be restored to scheduled', function () {
    $admin = makeAdmin();
    $instructor = makeInstructor();
    $session = LiveSession::create(sessionPayload(['instructor_id' => $instructor->id]));

    $this->actingAs($admin)->post('/admin/academy/live-classes/'.$session->id.'/cancel')->assertRedirect();
    expect($session->fresh()->status)->toBe('cancelled');

    $this->actingAs($admin)->post('/admin/academy/live-classes/'.$session->id.'/restore')->assertRedirect();
    expect($session->fresh()->status)->toBe('scheduled');
});

test('non-admin users cannot manage live sessions', function () {
    $student = makeStudent();
    $instructor = makeInstructor();

    $this->actingAs($student)
        ->post('/admin/academy/live-classes', sessionPayload(['instructor_id' => $instructor->id]))
        ->assertForbidden();
});

// ---- Live sessions: instructor ownership ----

test('instructors can start and end only their own sessions', function () {
    $owner = makeInstructor();
    $other = makeInstructor();
    $own = LiveSession::create(sessionPayload(['instructor_id' => $owner->id]));
    $theirs = LiveSession::create(sessionPayload(['instructor_id' => $other->id, 'title' => 'Not mine']));

    $this->actingAs($owner)->post('/instructor/live-host/'.$own->id.'/start')->assertRedirect();
    expect($own->fresh()->status)->toBe('live');

    $this->actingAs($owner)->post('/instructor/live-host/'.$theirs->id.'/start')->assertForbidden();
    expect($theirs->fresh()->status)->toBe('scheduled');

    $this->actingAs($owner)->post('/instructor/live-host/'.$own->id.'/end')->assertRedirect();
    expect($own->fresh()->status)->toBe('ended');
});

// ---- Live sessions: index payloads (HTTP, with re-registered GET routes) ----

test('admin live index returns sessions with Myanmar display labels and stats', function () {
    $admin = makeAdmin();
    $instructor = makeInstructor();
    LiveSession::create(sessionPayload([
        'instructor_id' => $instructor->id,
        'scheduled_at' => now()->addDay()->setTime(19, 0)->toDateTimeString(),
    ]));

    $this->actingAs($admin)->get('/admin/academy/live-classes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Live/Index')
            ->has('sessions', 1)
            ->where('sessions.0.when', 'မနက်ဖြန်')
            ->where('sessions.0.time', 'ညနေ 7:00 – 8:30')
            ->where('sessions.0.instructor', $instructor->name)
            ->where('stats.total', 1)
            ->where('stats.upcoming', 1));
});

test('instructor live index returns only the instructor own sessions', function () {
    $owner = makeInstructor();
    $other = makeInstructor();
    LiveSession::create(sessionPayload(['instructor_id' => $owner->id]));
    LiveSession::create(sessionPayload(['instructor_id' => $other->id, 'title' => 'Other session']));

    $this->actingAs($owner)->get('/instructor/live-host')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/LiveHost/Index')
            ->has('sessions', 1)
            ->where('sessions.0.title', 'React Hooks Deep Dive — Live'));
});

test('student live index lists scheduled and live sessions and ended recordings', function () {
    $student = makeStudent();
    $instructor = makeInstructor();
    LiveSession::create(sessionPayload(['instructor_id' => $instructor->id]));
    $ended = LiveSession::create(sessionPayload(['instructor_id' => $instructor->id, 'title' => 'Ended Session']));
    $ended->update(['status' => 'ended']);
    $cancelled = LiveSession::create(sessionPayload(['instructor_id' => $instructor->id, 'title' => 'Cancelled Session']));
    $cancelled->update(['status' => 'cancelled']);

    $this->actingAs($student)->get('/student/live-classes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/LiveClasses/Index')
            ->has('upcoming', 1)
            ->has('recorded', 1)
            ->where('recorded.0.title', 'Ended Session'));
});

// ---- API keys ----

test('api key creation flashes the full key once and stores it encrypted', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)
        ->post('/admin/academy/integrations/api-keys', ['name' => 'Mobile App API', 'provider' => 'general'])
        ->assertRedirect();

    $response->assertSessionHas('new_api_key');

    $plain = session('new_api_key');
    expect($plain)->toStartWith('cmx_live_');

    $key = ApiKey::firstOrFail();
    expect($key->key_value)->toBe($plain) // decrypted via the cast
        ->and(DB::table('api_keys')->first()->key_value)->not->toBe($plain) // encrypted at rest
        ->and($key->toArray())->not->toHaveKey('key_value'); // hidden from arrays
});

test('api key list responses expose only the last 4 characters', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)->post('/admin/academy/integrations/api-keys', ['name' => 'Mobile App API', 'provider' => 'youtube']);
    $plain = session('new_api_key');

    $this->actingAs($admin)->get('/admin/academy/integrations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Integrations/Index')
            ->has('keys', 1)
            ->missing('keys.0.key_value')
            ->where('keys.0.last4', substr($plain, -4))
            ->where('keys.0.provider', 'youtube'));
});

test('api keys can be regenerated, revoked, reactivated and deleted', function () {
    $admin = makeAdmin();
    $key = ApiKey::create(['name' => 'Old', 'provider' => 'general', 'key_value' => 'cmx_live_oldkeyvalue']);
    $oldPlain = $key->key_value;

    $response = $this->actingAs($admin)
        ->post('/admin/academy/integrations/api-keys/'.$key->id.'/regenerate')
        ->assertRedirect();
    $response->assertSessionHas('new_api_key');
    expect(session('new_api_key'))->not->toBe($oldPlain)
        ->and($key->fresh()->key_value)->toBe(session('new_api_key'));

    $this->actingAs($admin)->post('/admin/academy/integrations/api-keys/'.$key->id.'/revoke')->assertRedirect();
    expect($key->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->post('/admin/academy/integrations/api-keys/'.$key->id.'/reactivate')->assertRedirect();
    expect($key->fresh()->is_active)->toBeTrue();

    $this->actingAs($admin)->put('/admin/academy/integrations/api-keys/'.$key->id, ['name' => 'Renamed', 'provider' => 'zoom'])->assertRedirect();
    expect($key->fresh()->name)->toBe('Renamed');

    $this->actingAs($admin)->delete('/admin/academy/integrations/api-keys/'.$key->id)->assertRedirect();
    $this->assertDatabaseMissing('api_keys', ['id' => $key->id]);
});

// ---- Email campaigns ----

test('admin can create, update, schedule and delete campaigns', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)->post('/admin/academy/marketing/campaigns', [
        'name' => 'November Promo',
        'subject' => '50% OFF everything',
        'body' => 'Hello students',
        'audience' => 'students',
    ])->assertRedirect();

    $campaign = EmailCampaign::firstOrFail();
    expect($campaign->status)->toBe('draft');

    $this->actingAs($admin)->put('/admin/academy/marketing/campaigns/'.$campaign->id, [
        'name' => 'November Promo v2',
        'subject' => '50% OFF everything!',
        'body' => 'Hello students!',
        'audience' => 'all',
    ])->assertRedirect();
    expect($campaign->fresh()->name)->toBe('November Promo v2');

    $this->actingAs($admin)->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/schedule', [
        'scheduled_at' => now()->addDay()->toDateTimeString(),
    ])->assertRedirect();
    expect($campaign->fresh()->status)->toBe('scheduled')
        ->and($campaign->fresh()->scheduled_at)->not->toBeNull();

    $this->actingAs($admin)->delete('/admin/academy/marketing/campaigns/'.$campaign->id)->assertRedirect();
    $this->assertDatabaseMissing('email_campaigns', ['id' => $campaign->id]);
});

test('campaign scheduling rejects past dates', function () {
    $admin = makeAdmin();
    $campaign = EmailCampaign::create(['name' => 'X', 'subject' => 'Y', 'body' => '', 'audience' => 'all']);

    $this->actingAs($admin)->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/schedule', [
        'scheduled_at' => now()->subDay()->toDateTimeString(),
    ])->assertSessionHasErrors('scheduled_at');
});

test('sending a campaign fails clearly when no real mailer is configured', function () {
    config(['mail.default' => 'log']);
    $admin = makeAdmin();
    $campaign = EmailCampaign::create(['name' => 'X', 'subject' => 'Y', 'body' => '', 'audience' => 'all']);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertSessionHasErrors('send');

    expect($campaign->fresh()->status)->toBe('draft')
        ->and($campaign->fresh()->sent_at)->toBeNull();
});

test('sending a campaign with a mailer configured marks it sent with the audience count', function () {
    config(['mail.default' => 'smtp']);
    makeStudent();
    makeStudent();
    makeInstructor();
    $admin = makeAdmin();
    $campaign = EmailCampaign::create(['name' => 'X', 'subject' => 'Y', 'body' => '', 'audience' => 'students']);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($campaign->fresh()->status)->toBe('sent')
        ->and($campaign->fresh()->sent_at)->not->toBeNull()
        ->and($campaign->fresh()->recipients_count)->toBe(User::role('student')->count())
        ->and($campaign->fresh()->recipients_count)->toBeGreaterThanOrEqual(2);
});

test('marketing index reports whether mail delivery is configured', function () {
    config(['mail.default' => 'log']);
    $admin = makeAdmin();

    $this->actingAs($admin)->get('/admin/academy/marketing')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Marketing/Index')
            ->where('mailConfigured', false));
});

// ---- Bulk import ----

function csvUpload(string $content): UploadedFile
{
    return UploadedFile::fake()->createWithContent('courses.csv', $content);
}

test('import preview parses a csv and reports rows and errors without creating courses', function () {
    $admin = makeAdmin();
    $csv = "title,category,price,level\nReact Hooks,Web Development,95000,intermediate\n,Programming,1000,beginner\nBad Price,Design,not-a-number,beginner\n";

    $this->actingAs($admin)
        ->post('/admin/academy/import/preview', ['file' => csvUpload($csv)])
        ->assertRedirect()
        ->assertSessionHas('import_preview');

    $preview = session('import_preview');
    expect($preview['total_rows'])->toBe(3)
        ->and($preview['valid_rows'])->toBe(2)
        ->and($preview['errors'])->toHaveCount(1)
        ->and($preview['sample'][0]['title'])->toBe('React Hooks')
        ->and(Course::where('title', 'React Hooks')->exists())->toBeFalse();

    Storage::disk('local')->delete('imports/'.$preview['token']);
});

test('import confirm creates courses, creates categories and skips title-less rows', function () {
    $admin = makeAdmin();
    $csv = "React Hooks Masterclass,Web Development,95000,intermediate\n,Programming,1000,beginner\nPython Basics,Programming,,beginner\n";

    $this->actingAs($admin)->post('/admin/academy/import/preview', ['file' => csvUpload($csv)]);
    $token = session('import_preview')['token'];
    $before = Course::count();

    $this->actingAs($admin)
        ->post('/admin/academy/import/confirm', ['token' => $token])
        ->assertRedirect()
        ->assertSessionHas('import_result');

    $result = session('import_result');
    expect($result['created'])->toBe(2)
        ->and($result['skipped'])->toBe(1)
        ->and(Course::count())->toBe($before + 2);

    $course = Course::where('title', 'React Hooks Masterclass')->firstOrFail();
    expect($course->status)->toBe('draft')
        ->and($course->slug)->toBe('react-hooks-masterclass')
        ->and($course->price)->toEqual(95000)
        ->and($course->level)->toBe('intermediate')
        ->and($course->category->name)->toBe('Web Development')
        ->and($course->instructor_id)->toBe($admin->id);

    expect(CourseCategory::where('name', 'Programming')->exists())->toBeTrue();
    expect(Storage::disk('local')->exists('imports/'.$token))->toBeFalse();
});

test('import preview rejects non-csv files', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->post('/admin/academy/import/preview', ['file' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
        ->assertSessionHasErrors('file');
});

test('import confirm rejects an unknown token', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->post('/admin/academy/import/confirm', ['token' => 'doesnotexist123.csv'])
        ->assertSessionHasErrors('file');
});

// ---- System status ----

test('system index returns real runtime data', function () {
    $admin = makeAdmin();
    makeStudent();
    CourseCategory::create(['name' => 'General', 'slug' => 'general', 'is_active' => true]);

    $this->actingAs($admin)->get('/admin/academy/system')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/System/Index')
            ->where('system.php_version', PHP_VERSION)
            ->where('system.laravel_version', \Illuminate\Foundation\Application::VERSION)
            ->where('system.queue', config('queue.default'))
            ->where('system.cache', config('cache.default'))
            ->where('system.database.ok', true)
            ->where('system.counts.users', User::count())
            ->where('system.counts.courses', Course::count()));
});

test('import index renders with no pending preview or result', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)->get('/admin/academy/import')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Import/Index')
            ->where('preview', null)
            ->where('result', null));
});

// ---- Route registration sanity ----

test('admin ops write routes resolve to their controllers', function () {
    expect(Route::getRoutes()->getByName('admin.academy.live-classes.store')->getAction('uses'))
        ->toBe(LiveSessionController::class.'@store')
        ->and(Route::getRoutes()->getByName('admin.academy.integrations.api-keys.regenerate')->getAction('uses'))
        ->toBe(IntegrationController::class.'@regenerate')
        ->and(Route::getRoutes()->getByName('admin.academy.marketing.campaigns.send')->getAction('uses'))
        ->toBe(MarketingController::class.'@send')
        ->and(Route::getRoutes()->getByName('admin.academy.import.confirm')->getAction('uses'))
        ->toBe(ImportController::class.'@confirm')
        ->and(Route::getRoutes()->getByName('instructor.live-host.start')->getAction('uses'))
        ->toBe(LiveSessionController::class.'@instructorStart');
});

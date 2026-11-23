<?php

use App\Models\Badge;
use App\Models\CertificateTemplate;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function platformMakeAdmin(): User
{
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    return $admin;
}

function platformMakeStudent(): User
{
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');

    return $student;
}

// ---------------------------------------------------------------------------
// Platform settings
// ---------------------------------------------------------------------------

test('settings index returns defaults and seeds them', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->get('/admin/settings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Settings/Index')
            ->where('settings.platform_name', 'Codexa MM')
            ->where('settings.support_email', 'support@codexamm.com')
            ->where('settings.instructor_share_pct', 50)
            ->where('settings.refund_days', 7)
            ->where('settings.feature_maintenance', false)
            ->where('settings.feature_signup', true)
            ->where('settings.gateway_kbz', true)
            ->where('emailTemplates.welcome.subject', 'Codexa MM သို့ ကြိုဆိုပါတယ်, {{name}}!')
        );

    $this->assertDatabaseHas('settings', ['key' => 'platform_name', 'value' => 'Codexa MM', 'group' => 'general']);
    $this->assertDatabaseHas('settings', ['key' => 'feature_signup', 'value' => '1', 'type' => 'boolean', 'group' => 'features']);
});

test('settings update persists whitelisted keys only', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->put('/admin/settings', [
        'platform_name' => 'Test Academy',
        'support_email' => 'help@test.com',
        'instructor_share_pct' => 60,
        'refund_days' => 14,
        'feature_maintenance' => true,
        'feature_signup' => false,
        'gateway_kbz' => false,
        'email_templates' => ['welcome' => ['subject' => 'Hi there', 'body' => 'Welcome!']],
        'evil_key' => 'should not be stored',
    ])->assertRedirect();

    $this->assertDatabaseHas('settings', ['key' => 'platform_name', 'value' => 'Test Academy']);
    $this->assertDatabaseHas('settings', ['key' => 'instructor_share_pct', 'value' => '60', 'type' => 'integer']);
    $this->assertDatabaseHas('settings', ['key' => 'feature_maintenance', 'value' => '1', 'type' => 'boolean']);
    $this->assertDatabaseHas('settings', ['key' => 'feature_signup', 'value' => '0', 'type' => 'boolean']);
    $this->assertDatabaseHas('settings', ['key' => 'gateway_kbz', 'value' => '0', 'type' => 'boolean']);
    $this->assertDatabaseHas('settings', ['key' => 'email_welcome_subject', 'value' => 'Hi there', 'group' => 'email']);
    $this->assertDatabaseMissing('settings', ['key' => 'evil_key']);

    // Values come back typed.
    $this->actingAs($admin)->get('/admin/settings')
        ->assertInertia(fn (Assert $page) => $page
            ->where('settings.platform_name', 'Test Academy')
            ->where('settings.instructor_share_pct', 60)
            ->where('settings.feature_maintenance', true)
            ->where('settings.gateway_kbz', false)
        );
});

test('settings update validates input', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->put('/admin/settings', [
        'platform_name' => 'Test Academy',
        'support_email' => 'not-an-email',
        'instructor_share_pct' => 150,
        'refund_days' => -1,
    ])->assertSessionHasErrors(['support_email', 'instructor_share_pct', 'refund_days']);
});

test('non-admin cannot access settings', function () {
    $student = platformMakeStudent();

    $this->actingAs($student)->get('/admin/settings')->assertForbidden();
    $this->actingAs($student)->put('/admin/settings', [
        'platform_name' => 'X',
        'support_email' => 'x@test.com',
        'instructor_share_pct' => 50,
        'refund_days' => 7,
    ])->assertForbidden();
});

// ---------------------------------------------------------------------------
// Certificate templates
// ---------------------------------------------------------------------------

test('cert template index seeds three defaults with exactly one default', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->get('/admin/academy/cert-templates')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/CertTemplate/Index')
            ->has('templates', 3)
        );

    expect(CertificateTemplate::query()->where('is_default', true)->count())->toBe(1);
    expect(CertificateTemplate::query()->where('name', 'Classic Navy')->first()->is_default)->toBeTrue();
});

test('cert template crud works', function () {
    $admin = platformMakeAdmin();
    $this->actingAs($admin)->get('/admin/academy/cert-templates')->assertOk();

    $this->actingAs($admin)->post('/admin/academy/cert-templates', [
        'name' => 'Midnight',
        'design_config' => ['title' => 'Done!', 'color' => '#000000', 'accent' => '#ffffff'],
        'is_default' => false,
    ])->assertRedirect();

    $template = CertificateTemplate::query()->where('name', 'Midnight')->first();
    expect($template)->not->toBeNull()
        ->and($template->design_config['title'])->toBe('Done!')
        ->and($template->is_default)->toBeFalse();

    $this->actingAs($admin)->put("/admin/academy/cert-templates/{$template->id}", [
        'name' => 'Midnight Blue',
        'design_config' => ['title' => 'Finished!', 'color' => '#000011', 'accent' => '#eeeeee'],
    ])->assertRedirect();

    $template->refresh();
    expect($template->name)->toBe('Midnight Blue')
        ->and($template->design_config['title'])->toBe('Finished!');

    $this->actingAs($admin)->delete("/admin/academy/cert-templates/{$template->id}")->assertRedirect();
    $this->assertDatabaseMissing('certificate_templates', ['id' => $template->id]);
});

test('setting a new default clears the old one', function () {
    $admin = platformMakeAdmin();
    $this->actingAs($admin)->get('/admin/academy/cert-templates')->assertOk();

    $teal = CertificateTemplate::query()->where('name', 'Teal Modern')->first();

    $this->actingAs($admin)->post("/admin/academy/cert-templates/{$teal->id}/set-default")->assertRedirect();

    expect(CertificateTemplate::query()->where('is_default', true)->count())->toBe(1);
    expect($teal->fresh()->is_default)->toBeTrue();
    expect(CertificateTemplate::query()->where('name', 'Classic Navy')->first()->is_default)->toBeFalse();
});

test('the default cert template cannot be deleted', function () {
    $admin = platformMakeAdmin();
    $this->actingAs($admin)->get('/admin/academy/cert-templates')->assertOk();

    $default = CertificateTemplate::query()->where('is_default', true)->first();

    $this->actingAs($admin)->delete("/admin/academy/cert-templates/{$default->id}")
        ->assertSessionHasErrors(['template']);

    $this->assertDatabaseHas('certificate_templates', ['id' => $default->id]);
});

// ---------------------------------------------------------------------------
// Staff & roles
// ---------------------------------------------------------------------------

test('staff index lists admin and instructor users, not students', function () {
    $admin = User::factory()->create(['name' => 'Aaron Admin', 'status' => 'active']);
    $admin->assignRole('admin');
    $instructor = User::factory()->create(['name' => 'Ivy Instructor', 'status' => 'active']);
    $instructor->assignRole('instructor');
    platformMakeStudent();

    $this->actingAs($admin)->get('/admin/academy/staff')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Staff/Index')
            ->has('staff', 2)
            ->where('staff.0.name', 'Aaron Admin')
            ->where('staff.0.role', 'Admin')
            ->where('staff.0.status', 'active')
            ->where('staff.1.name', 'Ivy Instructor')
            ->where('staff.1.role', 'Instructor')
        );
});

test('staff invite creates an active account with the chosen role', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->post('/admin/academy/staff/invite', [
        'name' => 'Sam Support',
        'email' => 'sam@test.com',
        'role' => 'Support',
    ])->assertRedirect();

    $user = User::query()->where('email', 'sam@test.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->status)->toBe('active')
        ->and($user->hasRole('support'))->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull();

    // Duplicate email is rejected.
    $this->actingAs($admin)->post('/admin/academy/staff/invite', [
        'name' => 'Sam Again',
        'email' => 'sam@test.com',
        'role' => 'Finance',
    ])->assertSessionHasErrors(['email']);
});

test('staff invite as super admin also keeps the admin role', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->post('/admin/academy/staff/invite', [
        'name' => 'Sue Super',
        'email' => 'sue@test.com',
        'role' => 'Super Admin',
    ])->assertRedirect();

    $user = User::query()->where('email', 'sue@test.com')->first();
    expect($user->hasRole('super-admin'))->toBeTrue()
        ->and($user->hasRole('admin'))->toBeTrue();
});

test('staff role change syncs roles', function () {
    $admin = platformMakeAdmin();
    Role::findOrCreate('support', 'web');
    $member = User::factory()->create(['status' => 'active']);
    $member->assignRole('support');

    $this->actingAs($admin)->put("/admin/academy/staff/{$member->id}/role", ['role' => 'Finance'])
        ->assertRedirect();

    expect($member->fresh()->hasRole('finance'))->toBeTrue()
        ->and($member->fresh()->hasRole('support'))->toBeFalse();
});

test('an admin cannot remove their own admin role', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->put("/admin/academy/staff/{$admin->id}/role", ['role' => 'Support'])
        ->assertSessionHasErrors(['role']);

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

test('staff status can be toggled, but not for your own account', function () {
    $admin = platformMakeAdmin();
    Role::findOrCreate('support', 'web');
    $member = User::factory()->create(['status' => 'active']);
    $member->assignRole('support');

    $this->actingAs($admin)->put("/admin/academy/staff/{$member->id}/status", ['status' => 'inactive'])
        ->assertRedirect();
    expect($member->fresh()->status)->toBe('inactive');

    $this->actingAs($admin)->put("/admin/academy/staff/{$member->id}/status", ['status' => 'active'])
        ->assertRedirect();
    expect($member->fresh()->status)->toBe('active');

    $this->actingAs($admin)->put("/admin/academy/staff/{$admin->id}/status", ['status' => 'inactive'])
        ->assertSessionHasErrors(['status']);
    expect($admin->fresh()->status)->toBe('active');
});

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

test('gamification index returns badge records and xp rules', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->get('/admin/academy/gamification')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Gamification/Index')
            ->has('badges', 8)
            ->where('badges.0.name', 'First Steps')
            ->where('badges.0.is_active', true)
            ->where('badges.0.rule_type', 'lessons_completed')
            ->where('badges.0.threshold', 1)
            ->has('xpRules', 6)
            ->where('xpRules.0.key', 'xp_lesson_complete')
            ->where('xpRules.0.xp', 20)
            ->has('ruleTypes', 5)
            ->has('icons')
        );

    // Badges come from the Badge model now; no JSON 'badges' setting is created.
    $this->assertDatabaseHas('badges', ['name' => 'First Steps', 'rule_type' => 'lessons_completed', 'threshold' => 1]);
    $this->assertDatabaseHas('settings', ['key' => 'xp_quiz_pass', 'value' => '50', 'group' => 'gamification']);
    $this->assertDatabaseMissing('settings', ['key' => 'badges']);
});

test('gamification update persists xp rules only', function () {
    $admin = platformMakeAdmin();
    $this->actingAs($admin)->get('/admin/academy/gamification')->assertOk();

    $this->actingAs($admin)->put('/admin/academy/gamification', [
        'xp_lesson_complete' => 25,
        'xp_quiz_pass' => 60,
        'some_random_key' => 'ignored',
    ])->assertRedirect();

    expect(Setting::getValue('xp_lesson_complete'))->toBe(25);
    expect(Setting::getValue('xp_quiz_pass'))->toBe(60);
    $this->assertDatabaseMissing('settings', ['key' => 'some_random_key']);
    // Badge records are untouched by the XP-rules update.
    expect(Badge::count())->toBe(8);
});

// ---------------------------------------------------------------------------
// Landing CMS
// ---------------------------------------------------------------------------

test('cms index returns landing content defaults', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->get('/admin/academy/cms')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Cms/Index')
            ->where('content.promo', '🎉 50% OFF — သင်တန်း အားလုံး · CODEXA10 code သုံးပါ')
            ->where('content.heroTitle', 'မြန်မာဘာသာနဲ့ Programming ကို သုညကနေ သင်ယူပါ')
        );

    $this->assertDatabaseHas('settings', ['key' => 'landing_promo', 'group' => 'landing']);
});

test('cms update persists landing content', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->put('/admin/academy/cms', [
        'promo' => 'New promo text',
        'heroTitle' => 'New hero title',
        'heroIntro' => 'New intro paragraph.',
    ])->assertRedirect();

    expect(Setting::getValue('landing_promo'))->toBe('New promo text');
    expect(Setting::getValue('landing_hero_title'))->toBe('New hero title');
    expect(Setting::getValue('landing_hero_intro'))->toBe('New intro paragraph.');
});

test('cms update validates required content', function () {
    $admin = platformMakeAdmin();

    $this->actingAs($admin)->put('/admin/academy/cms', [
        'promo' => '',
        'heroTitle' => '',
        'heroIntro' => '',
    ])->assertSessionHasErrors(['promo', 'heroTitle', 'heroIntro']);
});

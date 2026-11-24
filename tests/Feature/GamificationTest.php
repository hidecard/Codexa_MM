<?php

use App\Models\Badge;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function gamMakeUser(string $role): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole($role);

    return $user;
}

function gamBadgePayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Night Owl',
        'description' => 'ညဘက် သင်ယူခြင်း',
        'icon' => 'moon',
        'rule_type' => Badge::RULE_XP_THRESHOLD,
        'threshold' => 250,
        'is_active' => true,
    ], $overrides);
}

// --- Badge CRUD (Badge model is the source of truth) ---

test('admin can create a badge', function () {
    $admin = gamMakeUser('admin');

    $this->actingAs($admin)->post('/admin/academy/gamification/badges', gamBadgePayload())
        ->assertRedirect();

    $this->assertDatabaseHas('badges', [
        'name' => 'Night Owl',
        'icon' => 'moon',
        'rule_type' => Badge::RULE_XP_THRESHOLD,
        'threshold' => 250,
        'is_active' => true,
    ]);
});

test('admin can update a badge', function () {
    $admin = gamMakeUser('admin');
    Badge::ensureSeeded();
    $badge = Badge::where('name', 'First Steps')->firstOrFail();

    $this->actingAs($admin)->put("/admin/academy/gamification/badges/{$badge->id}", [
        'name' => 'First Steps',
        'description' => 'Updated description',
        'icon' => 'flame',
        'rule_type' => Badge::RULE_LESSONS_COMPLETED,
        'threshold' => 3,
        'is_active' => false,
    ])->assertRedirect();

    expect($badge->fresh())
        ->description->toBe('Updated description')
        ->icon->toBe('flame')
        ->threshold->toBe(3)
        ->is_active->toBeFalse();
});

test('admin can toggle a badge', function () {
    $admin = gamMakeUser('admin');
    Badge::ensureSeeded();
    $badge = Badge::where('name', 'Quiz Master')->firstOrFail();
    expect($badge->is_active)->toBeTrue();

    $this->actingAs($admin)->post("/admin/academy/gamification/badges/{$badge->id}/toggle")
        ->assertRedirect();
    expect($badge->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->post("/admin/academy/gamification/badges/{$badge->id}/toggle")
        ->assertRedirect();
    expect($badge->fresh()->is_active)->toBeTrue();
});

test('admin can delete a badge', function () {
    $admin = gamMakeUser('admin');
    Badge::ensureSeeded();
    $badge = Badge::where('name', '500 XP')->firstOrFail();

    $this->actingAs($admin)->delete("/admin/academy/gamification/badges/{$badge->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('badges', ['id' => $badge->id]);
    expect(Badge::count())->toBe(7);
});

test('badge creation validates name uniqueness, icon and rule type', function () {
    $admin = gamMakeUser('admin');
    Badge::ensureSeeded();

    $this->actingAs($admin)->post('/admin/academy/gamification/badges', gamBadgePayload(['name' => 'First Steps']))
        ->assertSessionHasErrors(['name']);

    $this->actingAs($admin)->post('/admin/academy/gamification/badges', gamBadgePayload(['icon' => '🎯']))
        ->assertSessionHasErrors(['icon']);

    $this->actingAs($admin)->post('/admin/academy/gamification/badges', gamBadgePayload(['rule_type' => 'streak_days']))
        ->assertSessionHasErrors(['rule_type']);

    $this->actingAs($admin)->post('/admin/academy/gamification/badges', gamBadgePayload(['threshold' => 0]))
        ->assertSessionHasErrors(['threshold']);

    expect(Badge::count())->toBe(8);
});

test('students cannot manage badges', function () {
    $student = gamMakeUser('student');
    Badge::ensureSeeded();
    $badge = Badge::where('name', 'First Steps')->firstOrFail();

    $this->actingAs($student)->get('/admin/academy/gamification')->assertForbidden();
    $this->actingAs($student)->post('/admin/academy/gamification/badges', gamBadgePayload())->assertForbidden();
    $this->actingAs($student)->put("/admin/academy/gamification/badges/{$badge->id}", gamBadgePayload())->assertForbidden();
    $this->actingAs($student)->delete("/admin/academy/gamification/badges/{$badge->id}")->assertForbidden();
    $this->actingAs($student)->post("/admin/academy/gamification/badges/{$badge->id}/toggle")->assertForbidden();
});

// --- Legacy JSON badge migration ---

test('legacy json badges migrate once without duplicating starter badges', function () {
    $admin = gamMakeUser('admin');

    // Two entries match starter badges (one by exact name, one by slug
    // with different casing); two are genuinely new.
    Setting::setValue('badges', [
        ['name' => 'First Steps', 'desc' => 'legacy copy', 'xp' => 20, 'icon' => '🎯', 'active' => true],
        ['name' => 'quiz master', 'desc' => 'legacy copy', 'xp' => 100, 'icon' => '🧠', 'active' => true],
        ['name' => 'Streak 7', 'desc' => '၇ ရက် ဆက်တိုက် သင်ယူခြင်း', 'xp' => 70, 'icon' => '🔥', 'active' => true],
        ['name' => 'Live Learner', 'desc' => 'Live class 5 ခု တက်ရောက်ခြင်း', 'xp' => 80, 'icon' => '📺', 'active' => false],
    ], 'gamification');

    $this->actingAs($admin)->get('/admin/academy/gamification')->assertOk();

    expect(Badge::count())->toBe(10);
    expect(Badge::where('name', 'First Steps')->count())->toBe(1);
    expect(Badge::where('name', 'Quiz Master')->count())->toBe(1);

    $streak = Badge::where('name', 'Streak 7')->firstOrFail();
    expect($streak->rule_type)->toBe(Badge::RULE_XP_THRESHOLD)
        ->and($streak->threshold)->toBe(70)
        ->and($streak->icon)->toBe('flame')
        ->and($streak->description)->toBe('၇ ရက် ဆက်တိုက် သင်ယူခြင်း')
        ->and($streak->is_active)->toBeTrue();

    $live = Badge::where('name', 'Live Learner')->firstOrFail();
    expect($live->icon)->toBe('live')
        ->and($live->threshold)->toBe(80)
        ->and($live->is_active)->toBeFalse();

    // The legacy setting is consumed, so a second visit migrates nothing.
    $this->assertDatabaseMissing('settings', ['key' => 'badges']);
    $this->actingAs($admin)->get('/admin/academy/gamification')->assertOk();
    expect(Badge::count())->toBe(10);
});

test('migrateFromJson is idempotent when called directly', function () {
    Badge::ensureSeeded();

    $json = [
        ['name' => 'Streak 7', 'desc' => 'streak', 'xp' => 70, 'icon' => '🔥', 'active' => true],
        ['name' => 'Streak 7', 'desc' => 'duplicate in the same payload', 'xp' => 70, 'icon' => '🔥', 'active' => true],
    ];

    expect(Badge::migrateFromJson($json))->toBe(1);
    expect(Badge::migrateFromJson($json))->toBe(0);
    expect(Badge::where('name', 'Streak 7')->count())->toBe(1);
});

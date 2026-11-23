<?php

// Integration pass: cross-worker wiring the workers could not do alone —
// campaign open/click tracking wired into dispatch, re-report guard,
// instructor-share setting as the single source of truth, order revenue in
// earnings stats, and the admin Permissions page.

use App\Mail\CampaignMail;
use App\Models\CampaignTracking;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\CourseReview;
use App\Models\EmailCampaign;
use App\Models\Order;
use App\Models\ReviewReport;
use App\Models\Setting;
use App\Models\User;
use App\Support\AcademyAnalytics;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function intMakeUser(string $role, array $overrides = []): User
{
    $user = User::factory()->create(array_merge(['status' => 'active'], $overrides));
    $user->assignRole($role);

    return $user;
}

function intMakeCourse(User $instructor, array $overrides = []): Course
{
    return Course::factory()->create(array_merge([
        'instructor_id' => $instructor->id,
        'status' => 'published',
        'published_at' => now(),
        'price' => 100000,
        'sale_price' => null,
    ], $overrides));
}

function intMakeOrderPayment(User $student, array $items, float $amount): CoursePayment
{
    $order = Order::create(['student_id' => $student->id, 'total' => $amount, 'status' => 'paid']);

    foreach ($items as $courseId => $price) {
        $order->items()->create(['course_id' => $courseId, 'price' => $price]);
    }

    return CoursePayment::create([
        'student_id' => $student->id,
        'course_id' => null,
        'order_id' => $order->id,
        'amount' => $amount,
        'method' => 'kbzpay',
        'status' => 'approved',
    ]);
}

// --- Campaign tracking wired into dispatch ---

test('campaign send creates tracking rows for every recipient', function () {
    Mail::fake();
    config(['mail.default' => 'smtp']);

    $studentA = intMakeUser('student');
    $studentB = intMakeUser('student');
    intMakeUser('student', ['status' => 'inactive']);
    $admin = intMakeUser('admin');

    $campaign = EmailCampaign::create([
        'name' => 'Promo', 'subject' => 'Hi', 'body' => 'Hello!',
        'audience' => 'students', 'status' => 'draft',
    ]);

    $this->actingAs($admin)
        ->post('/admin/academy/marketing/campaigns/'.$campaign->id.'/send')
        ->assertRedirect();

    expect(CampaignTracking::query()->count())->toBe(2)
        ->and(CampaignTracking::query()->where('email', $studentA->email)->exists())->toBeTrue()
        ->and(CampaignTracking::query()->where('email', $studentB->email)->exists())->toBeTrue();
});

test('rendered campaign mail contains the open-tracking pixel', function () {
    $student = intMakeUser('student');
    $campaign = EmailCampaign::create([
        'name' => 'Promo', 'subject' => 'Hi', 'body' => 'Hello!',
        'audience' => 'students', 'status' => 'draft',
    ]);

    $html = (new CampaignMail($campaign, $student))->render();

    expect($html)->toContain('/t/o/')
        ->and(CampaignTracking::query()->where('email', $student->email)->exists())->toBeTrue();
});

// --- Re-report guard ---

test('re-reporting after a dismissed report returns a friendly error, not a 500', function () {
    $student = intMakeUser('student');
    $review = CourseReview::factory()->create(['is_approved' => true]);

    $this->actingAs($student)->post("/student/reviews/{$review->id}/report", ['reason' => 'Spam'])
        ->assertRedirect();

    ReviewReport::query()->first()->update(['status' => ReviewReport::STATUS_DISMISSED]);

    $this->actingAs($student)->post("/student/reviews/{$review->id}/report", ['reason' => 'Again'])
        ->assertSessionHasErrors('reason');

    expect(ReviewReport::query()->count())->toBe(1);
});

// --- Instructor share: setting is authoritative ---

test('instructor share defaults to 50 percent and follows the setting', function () {
    expect(AcademyAnalytics::instructorShare())->toBe(0.5);

    Setting::setValue('instructor_share_pct', 70, 'general');

    expect(AcademyAnalytics::instructorShare())->toBe(0.7);
});

test('earnings stats include order revenue and use the configured share', function () {
    $instructor = intMakeUser('instructor');
    $student = intMakeUser('student');
    // Fixed titles: courseEarnings orders by title, and faker titles
    // made the expected order a coin flip.
    $courseA = intMakeCourse($instructor, ['price' => 100000, 'title' => 'AAA Course']);
    $courseB = intMakeCourse($instructor, ['price' => 50000, 'title' => 'ZZZ Course']);

    intMakeOrderPayment($student, [$courseA->id => 100000, $courseB->id => 50000], 150000);
    Setting::setValue('instructor_share_pct', 70, 'general');

    // Revenue 150000 (order-attributed), share 70% = 105000.
    $this->actingAs($instructor)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableBalance', 105000)
            ->where('stats.totalRevenue', 150000)
            ->where('stats.totalShare', 105000)
            ->where('courseEarnings.0.revenue', 100000)
            ->where('courseEarnings.1.revenue', 50000));
});

// --- Admin Permissions page ---

test('admin can view the permissions page and sync role permissions', function () {
    $admin = intMakeUser('admin');
    $support = Role::findByName('support');

    $this->actingAs($admin)->get('/admin/permissions')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Permissions/Index')
            ->has('groups')
            ->has('roles'));

    $this->actingAs($admin)
        ->post("/admin/roles/{$support->id}/permissions", ['permissions' => ['tickets.view', 'admin.access']])
        ->assertRedirect();

    expect($support->fresh()->permissions->pluck('name')->all())
        ->toContain('tickets.view', 'admin.access');
});

test('admin role cannot lose the admin.access permission', function () {
    $admin = intMakeUser('admin');
    $adminRole = Role::findByName('admin');

    $this->actingAs($admin)
        ->post("/admin/roles/{$adminRole->id}/permissions", ['permissions' => ['courses.view']])
        ->assertSessionHasErrors('permissions');

    expect($adminRole->fresh()->hasPermissionTo('admin.access'))->toBeTrue();
});

test('non-admin users cannot open the permissions page', function () {
    $student = intMakeUser('student');

    $this->actingAs($student)->get('/admin/permissions')->assertForbidden();
});

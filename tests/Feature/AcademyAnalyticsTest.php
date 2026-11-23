<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CoursePayment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Support\AcademyAnalytics;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function aaMakeUser(string $role): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole($role);

    return $user;
}

function aaMakeCategory(string $name): CourseCategory
{
    return CourseCategory::query()->create([
        'name' => $name,
        'slug' => Str::slug($name).'-'.uniqid(),
        'is_active' => true,
        'position' => 1,
    ]);
}

function aaMakeCourse(User $instructor, CourseCategory $category, int $price): Course
{
    return Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Course '.uniqid(),
        'slug' => 'course-'.uniqid(),
        'price' => $price,
        'pricing_type' => 'paid',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 60,
        'published_at' => now(),
    ]);
}

/**
 * Two courses (60000 Ks in Web, 40000 Ks in Data), a 100000 Ks order
 * containing both, an approved 90000 Ks order payment (coupon discount
 * applied — split 54000 / 36000), a direct 10000 Ks approved payment on
 * course A, and a pending order payment that must be ignored.
 */
function aaSeedOrderRevenue(): array
{
    $instructor = aaMakeUser('instructor');
    $student = aaMakeUser('student');
    $web = aaMakeCategory('Web');
    $data = aaMakeCategory('Data');
    $courseA = aaMakeCourse($instructor, $web, 60000);
    $courseB = aaMakeCourse($instructor, $data, 40000);

    $order = Order::create(['student_id' => $student->id, 'total' => 100000, 'status' => 'paid']);
    OrderItem::create(['order_id' => $order->id, 'course_id' => $courseA->id, 'price' => 60000]);
    OrderItem::create(['order_id' => $order->id, 'course_id' => $courseB->id, 'price' => 40000]);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => null, 'order_id' => $order->id, 'amount' => 90000, 'method' => 'kbzpay', 'status' => 'approved']);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $courseA->id, 'order_id' => null, 'amount' => 10000, 'method' => 'wavepay', 'status' => 'approved']);

    $pendingOrder = Order::create(['student_id' => $student->id, 'total' => 50000, 'status' => 'pending']);
    OrderItem::create(['order_id' => $pendingOrder->id, 'course_id' => $courseA->id, 'price' => 50000]);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => null, 'order_id' => $pendingOrder->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'pending']);

    return [$courseA, $courseB];
}

test('topCourses includes each course share of order payments', function () {
    [$courseA, $courseB] = aaSeedOrderRevenue();

    $top = AcademyAnalytics::topCourses(null, 5);

    expect($top)->toHaveCount(2);
    // A: 10000 direct + 54000 order share; B: 36000 order share only.
    expect($top[0]['id'])->toBe($courseA->id)
        ->and($top[0]['revenue'])->toBe(64000.0)
        ->and($top[1]['id'])->toBe($courseB->id)
        ->and($top[1]['revenue'])->toBe(36000.0);
});

test('topCourses scoped to an instructor includes their order revenue', function () {
    [$courseA] = aaSeedOrderRevenue();

    $top = AcademyAnalytics::topCourses([$courseA->id], 5);

    expect($top)->toHaveCount(1)
        ->and($top[0]['revenue'])->toBe(64000.0);
});

test('categoryShare includes order revenue and order-only categories', function () {
    aaSeedOrderRevenue();

    $share = AcademyAnalytics::categoryShare();

    expect($share)->toHaveCount(2);
    $byName = collect($share)->keyBy('name');
    // Web: 10000 direct + 54000 order share; Data: 36000 order share only.
    expect($byName['Web']['amount'])->toBe(64000.0)
        ->and($byName['Web']['pct'])->toBe(64)
        ->and($byName['Data']['amount'])->toBe(36000.0)
        ->and($byName['Data']['pct'])->toBe(36);
});

test('monthlyRevenue includes order revenue for admin-wide views', function () {
    aaSeedOrderRevenue();

    $monthly = AcademyAnalytics::monthlyRevenue(6);

    // Current month: 10000 direct + 90000 order = 100000 Ks = 1.0 lakh.
    // The unscoped query has no course_id filter, so order payments are
    // in the base sum (and must not be added a second time).
    expect($monthly)->toHaveCount(6)
        ->and($monthly[5]['value'])->toBe(1.0);
});

test('admin reports topCourses and categoryShare include order revenue', function () {
    $admin = aaMakeUser('admin');
    aaSeedOrderRevenue();

    $this->actingAs($admin)->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->where('stats.totalRevenue', 100000)
            ->has('topCourses', 2)
            ->where('topCourses.0.revenue', 64000)
            ->where('topCourses.1.revenue', 36000)
            ->has('categoryShare', 2)
            ->where('categoryShare.0.name', 'Web')
            ->where('categoryShare.0.amount', 64000)
            ->where('categoryShare.1.name', 'Data')
            ->where('categoryShare.1.amount', 36000)
        );
});

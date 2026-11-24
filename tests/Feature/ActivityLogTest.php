<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CoursePayment;
use App\Models\Payout;
use App\Models\Refund;
use App\Models\SystemLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    // Demo accounts from UserSeeder are the realistic actors here
    // (admin@codexamm.test etc., all password `password`).
    $this->seed(UserSeeder::class);
});

/** A seeded demo account by email. */
function alUser(string $email): User
{
    return User::query()->where('email', $email)->firstOrFail();
}

function alCategory(): CourseCategory
{
    return CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);
}

function alCourse(User $instructor, array $overrides = []): Course
{
    return Course::query()->create(array_merge([
        'category_id' => alCategory()->id,
        'instructor_id' => $instructor->id,
        'title' => 'Course '.uniqid(),
        'slug' => 'course-'.uniqid(),
        'price' => 50000,
        'pricing_type' => 'paid',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 60,
        'published_at' => now(),
    ], $overrides));
}

function alPayment(User $student, ?Course $course = null, string $status = 'pending'): CoursePayment
{
    return CoursePayment::create([
        'student_id' => $student->id,
        'course_id' => $course?->id,
        'amount' => 50000,
        'method' => 'kbzpay',
        'status' => $status,
    ]);
}

function alCoursePayload(CourseCategory $category, array $overrides = []): array
{
    return array_merge([
        'category_id' => $category->id,
        'title' => 'My Course',
        'slug' => '',
        'short_description' => 'Short',
        'description' => 'Desc',
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 5,
    ], $overrides);
}

// --- Payments, refunds, enrollment ---

test('approving a payment logs the decision and the enrollment activation', function () {
    $admin = alUser('admin@codexamm.test');
    $instructor = alUser('instructor@codexamm.test');
    $student = alUser('student@codexamm.test');
    $course = alCourse($instructor);
    $payment = alPayment($student, $course);

    $this->actingAs($admin)->post(route('admin.academy.payments.approve', $payment))
        ->assertRedirect();

    $log = SystemLog::query()->where('event', 'payment.approved')->firstOrFail();
    expect($log->user_id)->toBe($admin->id)
        ->and($log->channel)->toBe('payments')
        ->and($log->message)->toContain($payment->displayCode())
        ->and($log->context['id'])->toBe($payment->id)
        ->and($log->context['subject_type'])->toBe('CoursePayment');

    // The approval activated the enrollment (observer).
    $enrollmentLog = SystemLog::query()->where('event', 'enrollment.activated')->firstOrFail();
    expect($enrollmentLog->user_id)->toBe($admin->id)
        ->and($enrollmentLog->message)->toContain($course->title);
});

test('rejecting and refunding a payment are logged', function () {
    $admin = alUser('admin@codexamm.test');
    $student = alUser('student@codexamm.test');
    $rejected = alPayment($student);
    $refunded = alPayment($student, null, 'approved');

    $this->actingAs($admin)->post(route('admin.academy.payments.reject', $rejected))->assertRedirect();
    $this->actingAs($admin)->post(route('admin.academy.payments.refund', $refunded))->assertRedirect();

    expect(SystemLog::query()->where('event', 'payment.rejected')->where('user_id', $admin->id)->exists())->toBeTrue();
    expect(SystemLog::query()->where('event', 'payment.refunded')->where('user_id', $admin->id)->exists())->toBeTrue();
});

test('refund requests and admin refund decisions are logged', function () {
    $admin = alUser('admin@codexamm.test');
    $student = alUser('student@codexamm.test');
    $instructor = alUser('instructor@codexamm.test');
    $course = alCourse($instructor);
    $payment = alPayment($student, $course, 'approved');

    $this->actingAs($student)->post(route('student.refunds.store'), [
        'course_payment_id' => $payment->id,
        'reason' => 'Changed my mind',
        'amount' => 50000,
    ])->assertRedirect();

    $refund = Refund::query()->where('course_payment_id', $payment->id)->firstOrFail();
    expect(SystemLog::query()->where('event', 'refund.requested')->where('user_id', $student->id)->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.academy.refunds.approve', $refund))->assertRedirect();

    expect(SystemLog::query()->where('event', 'refund.approved')->where('user_id', $admin->id)->exists())->toBeTrue();
    expect($payment->fresh()->status)->toBe('refunded');
});

test('enrolling in a free course logs the enrollment activation', function () {
    $instructor = alUser('instructor@codexamm.test');
    $student = alUser('student@codexamm.test');
    $course = alCourse($instructor, ['pricing_type' => 'free', 'price' => 0]);

    $this->actingAs($student)->post(route('student.courses.enroll', $course->slug))
        ->assertRedirect();

    $log = SystemLog::query()->where('event', 'enrollment.activated')->firstOrFail();
    expect($log->user_id)->toBe($student->id)
        ->and($log->message)->toContain($student->name)
        ->and($log->message)->toContain($course->title);
});

// --- Auth ---

test('login and logout are logged', function () {
    $admin = alUser('admin@codexamm.test');

    $this->post('/login', ['email' => 'admin@codexamm.test', 'password' => 'password'])
        ->assertRedirect();

    $login = SystemLog::query()->where('event', 'auth.login')->firstOrFail();
    expect($login->user_id)->toBe($admin->id)
        ->and($login->channel)->toBe('auth');

    $this->post(route('logout'))->assertRedirect();

    expect(SystemLog::query()->where('event', 'auth.logout')->where('user_id', $admin->id)->exists())->toBeTrue();
});

// --- Courses ---

test('course create, publish and delete are logged', function () {
    $instructor = alUser('instructor@codexamm.test');
    $category = alCategory();

    $this->actingAs($instructor)->post(route('instructor.courses.store'), alCoursePayload($category))
        ->assertRedirect();

    $course = Course::query()->where('title', 'My Course')->firstOrFail();
    expect(SystemLog::query()->where('event', 'course.created')->where('user_id', $instructor->id)->exists())->toBeTrue();

    $this->actingAs($instructor)->put(
        route('instructor.courses.update', $course),
        alCoursePayload($category, ['slug' => 'my-course', 'status' => 'published']),
    )->assertRedirect();

    $published = SystemLog::query()->where('event', 'course.published')->firstOrFail();
    expect($published->user_id)->toBe($instructor->id)
        ->and($published->context['id'])->toBe($course->id);

    // The instructor role has no courses.delete permission by default
    // (CoursePolicy), so grant it for this lifecycle check.
    $instructor->givePermissionTo('courses.delete');
    $this->actingAs($instructor)->delete(route('instructor.courses.destroy', $course))
        ->assertRedirect();

    expect(SystemLog::query()->where('event', 'course.deleted')->where('user_id', $instructor->id)->exists())->toBeTrue();
});

// --- Settings ---

test('saving settings logs the change', function () {
    $admin = alUser('admin@codexamm.test');

    $this->actingAs($admin)->put(route('admin.settings.update'), [
        'platform_name' => 'Codexa MM',
        'support_email' => 'support@codexamm.com',
        'instructor_share_pct' => 50,
        'refund_days' => 7,
    ])->assertRedirect();

    $log = SystemLog::query()->where('event', 'settings.updated')->firstOrFail();
    expect($log->user_id)->toBe($admin->id)
        ->and($log->channel)->toBe('settings');
});

// --- Coupons and payouts ---

test('coupon and payout decisions are logged', function () {
    $admin = alUser('admin@codexamm.test');
    $instructor = alUser('instructor@codexamm.test');

    $this->actingAs($admin)->post(route('admin.academy.coupons.store'), [
        'code' => 'LOGTEST10',
        'discount_type' => 'percent',
        'discount_value' => 10,
    ])->assertRedirect();

    $coupon = \App\Models\Coupon::query()->where('code', 'LOGTEST10')->firstOrFail();
    expect(SystemLog::query()->where('event', 'coupon.created')->where('user_id', $admin->id)->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.academy.coupons.toggle', $coupon))->assertRedirect();
    expect(SystemLog::query()->where('event', 'coupon.deactivated')->where('user_id', $admin->id)->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.academy.payouts.store'), [
        'instructor_id' => $instructor->id,
        'amount' => 25000,
        'method' => 'kbzpay',
    ])->assertRedirect();

    $payout = Payout::query()->where('instructor_id', $instructor->id)->firstOrFail();
    expect(SystemLog::query()->where('event', 'payout.created')->where('user_id', $admin->id)->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.academy.payouts.approve', $payout))->assertRedirect();
    expect(SystemLog::query()->where('event', 'payout.paid')->where('user_id', $admin->id)->exists())->toBeTrue();
});

// --- Users and staff ---

test('role updates and staff invites are logged', function () {
    $admin = alUser('admin@codexamm.test');
    $student = alUser('student@codexamm.test');

    $this->actingAs($admin)->post(route('admin.users.roles.update', $student), ['roles' => ['student', 'instructor']])
        ->assertRedirect();

    expect(SystemLog::query()->where('event', 'user.roles_updated')->where('user_id', $admin->id)->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.academy.staff.invite'), [
        'name' => 'New Staff',
        'email' => 'newstaff@codexamm.test',
        'role' => 'Support',
    ])->assertRedirect();

    $invited = User::query()->where('email', 'newstaff@codexamm.test')->firstOrFail();
    $log = SystemLog::query()->where('event', 'staff.invited')->firstOrFail();
    expect($log->user_id)->toBe($admin->id)
        ->and($log->context['id'])->toBe($invited->id);
});

// --- Activity Logs page ---

test('the activity logs page lists recorded entries', function () {
    $admin = alUser('admin@codexamm.test');
    $student = alUser('student@codexamm.test');
    // A Pro-plan payment (no course) keeps this request to a single entry.
    $payment = alPayment($student);

    $this->actingAs($admin)->post(route('admin.academy.payments.approve', $payment))->assertRedirect();

    $this->actingAs($admin)->get(route('admin.activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ActivityLogs/Index')
            ->has('logs', 1)
            ->where('logs.0.action', 'Approved payment '.$payment->displayCode().' (50,000 Ks)')
            ->where('logs.0.who', 'Admin User')
            ->where('logs.0.type', 'payment'));
});

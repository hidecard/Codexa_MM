<?php

// Enforcement + payouts + small gaps (Worker D): maintenance mode, suspended
// login, gateway toggles, landing CMS, order payout attribution, staff
// roles, announcement fields, settings export, certificate print view,
// student Q&A ask, coupon edit, cart, public review form.

use App\Models\Course;
use App\Models\CourseAnnouncement;
use App\Models\CoursePayment;
use App\Models\CourseQuestion;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function enfMakeUser(string $role, array $overrides = []): User
{
    $user = User::factory()->create(array_merge(['status' => 'active'], $overrides));
    $user->assignRole($role);

    return $user;
}

function enfMakeCourse(User $instructor, array $overrides = []): Course
{
    return Course::factory()->create(array_merge([
        'instructor_id' => $instructor->id,
        'status' => 'published',
        'published_at' => now(),
        'price' => 100000,
        'sale_price' => null,
    ], $overrides));
}

// --- Maintenance mode ---

test('maintenance mode blocks non-admin login but lets admins in', function () {
    Setting::setValue('feature_maintenance', true, 'features');

    $student = enfMakeUser('student');
    $admin = enfMakeUser('admin');

    $this->post('/login', ['email' => $student->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($admin);
});

test('maintenance mode redirects logged-in non-admins to the notice', function () {
    Setting::setValue('feature_maintenance', true, 'features');

    $student = enfMakeUser('student');
    $admin = enfMakeUser('admin');

    $this->actingAs($student)->get('/student/dashboard')
        ->assertRedirect(route('maintenance'));

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();

    $this->actingAs($student)->get('/maintenance')->assertOk();
});

test('maintenance mode off leaves login and portals untouched', function () {
    $student = enfMakeUser('student');

    $this->post('/login', ['email' => $student->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($student);
});

// --- Suspended users ---

test('a suspended user cannot log in', function () {
    $user = enfMakeUser('student', ['status' => 'suspended']);

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('an inactive user cannot log in', function () {
    $user = enfMakeUser('student', ['status' => 'inactive']);

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('wrong password still fails with the standard error', function () {
    $user = enfMakeUser('student');

    $this->post('/login', ['email' => $user->email, 'password' => 'not-the-password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

// --- Disabled payment gateways ---

test('checkout only offers enabled gateways', function () {
    Setting::setValue('gateway_wave', false, 'payments');
    Setting::setValue('gateway_bank', false, 'payments');

    $student = enfMakeUser('student');

    $this->actingAs($student)->get('/student/checkout')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Checkout/Index')
            ->where('gateways', [
                'kbzpay' => true,
                'wavepay' => false,
                'cbpay' => true,
                'bank' => false,
            ]));
});

test('all gateways are enabled by default at checkout', function () {
    $student = enfMakeUser('student');

    $this->actingAs($student)->get('/student/checkout')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('gateways', [
                'kbzpay' => true,
                'wavepay' => true,
                'cbpay' => true,
                'bank' => true,
            ]));
});

test('an order cannot be placed with a disabled gateway', function () {
    Setting::setValue('gateway_kbz', false, 'payments');

    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor);

    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$course->id], 'method' => 'kbzpay'])
        ->assertSessionHasErrors('method');

    expect(Order::query()->count())->toBe(0);

    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$course->id], 'method' => 'wavepay'])
        ->assertRedirect();

    expect(Order::query()->count())->toBe(1);
});

// --- Order-level payout attribution ---

function enfMakeOrderPayment(User $student, array $items, float $amount, string $status = 'approved'): CoursePayment
{
    $order = Order::create([
        'student_id' => $student->id,
        'total' => $amount,
        'status' => $status === 'approved' ? 'paid' : 'pending',
    ]);

    foreach ($items as $courseId => $price) {
        $order->items()->create(['course_id' => $courseId, 'price' => $price]);
    }

    return CoursePayment::create([
        'student_id' => $student->id,
        'course_id' => null,
        'order_id' => $order->id,
        'amount' => $amount,
        'method' => 'kbzpay',
        'status' => $status,
    ]);
}

test('order payments are attributed to instructors by item-price split', function () {
    $instructorA = enfMakeUser('instructor');
    $instructorB = enfMakeUser('instructor');
    $student = enfMakeUser('student');

    $courseA = enfMakeCourse($instructorA, ['price' => 100000]);
    $courseC = enfMakeCourse($instructorB, ['price' => 50000]);

    // One order: course A (100000) + course C (50000), paid 150000 in full.
    enfMakeOrderPayment($student, [$courseA->id => 100000, $courseC->id => 50000], 150000);

    // A: 100000 revenue -> 50% = 50000. B: 50000 revenue -> 50% = 25000.
    $this->actingAs($instructorA)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('availableBalance', 50000));

    $this->actingAs($instructorB)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('availableBalance', 25000));
});

test('coupon-discounted order payments split the discounted total', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');

    $courseA = enfMakeCourse($instructor, ['price' => 100000]);
    $courseB = enfMakeCourse($instructor, ['price' => 50000]);

    // Items total 150000 but the order paid 120000 after a coupon.
    enfMakeOrderPayment($student, [$courseA->id => 100000, $courseB->id => 50000], 120000);

    // Instructor owns both courses: 120000 revenue -> 50% = 60000.
    $this->actingAs($instructor)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('availableBalance', 60000));
});

test('pending order payments do not count toward payout balance', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor, ['price' => 100000]);

    enfMakeOrderPayment($student, [$course->id => 100000], 100000, 'pending');

    $this->actingAs($instructor)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('availableBalance', 0));
});

// --- Coupon edit ---

test('an admin can edit a coupon and the index exposes edit fields', function () {
    $admin = enfMakeUser('admin');
    $coupon = \App\Models\Coupon::create([
        'code' => 'SAVE10',
        'discount_type' => 'percent',
        'discount_value' => 10,
        'usage_limit' => 100,
        'is_active' => true,
    ]);

    $this->actingAs($admin)->get('/admin/academy/coupons')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('coupons.0.code', 'SAVE10')
            ->where('coupons.0.discount_type', 'percent')
            ->has('coupons.0.expires_at'));

    $this->actingAs($admin)
        ->put("/admin/academy/coupons/{$coupon->id}", [
            'code' => 'SAVE20',
            'discount_type' => 'percent',
            'discount_value' => 20,
            'usage_limit' => 50,
            'expires_at' => '2027-01-31',
            'is_active' => true,
        ])
        ->assertRedirect();

    $coupon->refresh();
    expect($coupon->code)->toBe('SAVE20')
        ->and((float) $coupon->discount_value)->toBe(20.0)
        ->and($coupon->usage_limit)->toBe(50)
        ->and($coupon->expires_at?->toDateString())->toBe('2027-01-31');
});

// --- Add to cart + public review form ---

test('a student can add a course to the cart', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor, ['pricing_type' => 'paid']);

    $this->actingAs($student)
        ->post('/student/cart', ['course_id' => $course->id])
        ->assertRedirect();

    expect(session('cart'))->toBe([$course->id]);

    // Adding again does not duplicate it.
    $this->actingAs($student)
        ->post('/student/cart', ['course_id' => $course->id])
        ->assertRedirect();

    expect(session('cart'))->toBe([$course->id]);
});

test('course detail exposes review props to enrolled students only', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $other = enfMakeUser('student');
    $course = enfMakeCourse($instructor, ['pricing_type' => 'paid']);

    Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    $this->actingAs($student)->get("/courses/{$course->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Courses/Show')
            ->where('canReview', true)
            ->where('myReview', null));

    $this->actingAs($other)->get("/courses/{$course->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canReview', false));
});

test('an enrolled student can submit and update one review per course', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor, ['pricing_type' => 'paid']);

    Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 4, 'comment' => 'Great course'])
        ->assertRedirect();

    expect(CourseReview::query()->count())->toBe(1);

    $this->actingAs($student)->get("/courses/{$course->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('myReview.rating', 4)
            ->where('myReview.comment', 'Great course')
            ->where('myReview.is_approved', false));

    // Resubmitting updates the same review instead of creating a second one.
    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 5, 'comment' => 'Even better'])
        ->assertRedirect();

    expect(CourseReview::query()->count())->toBe(1)
        ->and((int) CourseReview::query()->firstOrFail()->rating)->toBe(5);
});

test('a non-enrolled student cannot submit a review', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor, ['pricing_type' => 'paid']);

    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 5])
        ->assertSessionHasErrors('course_id');

    expect(CourseReview::query()->count())->toBe(0);
});

// --- Certificate print view ---

test('a student can open the print view for their own certificate', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $other = enfMakeUser('student');
    $course = enfMakeCourse($instructor);

    $enrollment = Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'completed',
    ]);

    $certificate = \App\Models\Certificate::create([
        'enrollment_id' => $enrollment->id,
        'certificate_number' => 'CERT-TEST-001',
        'issued_at' => now(),
    ]);
    \App\Models\CertificateVerification::create([
        'certificate_id' => $certificate->id,
        'verification_code' => 'VERIFY-TEST-001',
    ]);

    $this->actingAs($student)->get("/student/certificates/{$certificate->id}/print")
        ->assertOk()
        ->assertSee('CERT-TEST-001')
        ->assertSee($student->name)
        ->assertSee('window.print()');

    // Another student may not print someone else's certificate.
    $this->actingAs($other)->get("/student/certificates/{$certificate->id}/print")
        ->assertForbidden();
});

// --- Settings backup export ---

test('an admin can download a JSON backup of all settings', function () {
    Setting::setValue('platform_name', 'Codexa MM', 'general');
    Setting::setValue('gateway_kbz', false, 'payments');

    $admin = enfMakeUser('admin');

    $response = $this->actingAs($admin)->get('/admin/settings/export');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/json');

    $payload = json_decode($response->getContent(), true);
    expect($payload)->toHaveKey('settings');

    $byKey = collect($payload['settings'])->keyBy('key');
    expect($byKey['platform_name']['value'])->toBe('Codexa MM')
        ->and($byKey['gateway_kbz']['value'])->toBeFalse()
        ->and($byKey['gateway_kbz']['group'])->toBe('payments');
});

test('a non-admin cannot download the settings backup', function () {
    $student = enfMakeUser('student');

    $this->actingAs($student)->get('/admin/settings/export')->assertForbidden();
});

// --- Student Q&A ask in the lesson player ---

function enfMakeLesson(Course $course): \App\Models\Lesson
{
    $module = \App\Models\CourseModule::query()->create([
        'course_id' => $course->id,
        'title' => 'Module 1',
        'position' => 1,
    ]);

    return \App\Models\Lesson::query()->create([
        'module_id' => $module->id,
        'title' => 'Lesson 1',
        'content' => 'Hello',
        'duration' => 10,
        'type' => 'text',
        'is_free' => true,
        'position' => 1,
    ]);
}

test('an enrolled student can ask a question from the lesson player', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor);
    $lesson = enfMakeLesson($course);

    Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    $this->actingAs($student)
        ->post('/student/questions', [
            'course_id' => $course->id,
            'lesson_id' => $lesson->id,
            'question' => 'What does this line do?',
        ])
        ->assertRedirect();

    $question = CourseQuestion::query()->firstOrFail();
    expect($question->student_id)->toBe($student->id)
        ->and($question->lesson_id)->toBe($lesson->id)
        ->and($question->is_answered)->toBeFalse();

    // The lesson page shows the student's own question.
    $this->actingAs($student)->get("/student/courses/{$course->id}/lessons/{$lesson->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Course/Lesson')
            ->where('questions.0.question', 'What does this line do?')
            ->where('questions.0.is_answered', false));
});

test('a non-enrolled student cannot ask a question', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor);
    $lesson = enfMakeLesson($course);

    $this->actingAs($student)
        ->post('/student/questions', [
            'course_id' => $course->id,
            'lesson_id' => $lesson->id,
            'question' => 'Hello?',
        ])
        ->assertSessionHasErrors('course_id');

    expect(CourseQuestion::query()->count())->toBe(0);
});

// --- Staff roles / permission-based admin access ---

test('support staff can enter general admin areas but not admin-only ones', function () {
    $support = enfMakeUser('support');

    // General admin areas: dashboard, coupons, payments list.
    $this->actingAs($support)->get('/admin/dashboard')->assertOk();
    $this->actingAs($support)->get('/admin/academy/coupons')->assertOk();
    $this->actingAs($support)->get('/admin/academy/payments')->assertOk();
    $this->actingAs($support)->get('/admin/academy/payouts')->assertOk();

    // Admin-only: platform settings (+ export), staff, user management,
    // API keys, system status.
    $this->actingAs($support)->get('/admin/settings')->assertForbidden();
    $this->actingAs($support)->get('/admin/settings/export')->assertForbidden();
    $this->actingAs($support)->get('/admin/academy/staff')->assertForbidden();
    $this->actingAs($support)->get('/admin/users')->assertForbidden();
    $this->actingAs($support)->get('/admin/academy/integrations')->assertForbidden();
    $this->actingAs($support)->get('/admin/academy/system')->assertForbidden();

    // Admin-only: payout decisions.
    $payout = \App\Models\Payout::create([
        'instructor_id' => enfMakeUser('instructor')->id,
        'amount' => 10000,
        'method' => 'kbzpay',
        'status' => 'pending',
        'period' => now()->format('Y-m'),
    ]);
    $this->actingAs($support)->post("/admin/academy/payouts/{$payout->id}/approve")->assertForbidden();
});

test('finance staff can enter general admin areas but not admin-only ones', function () {
    $finance = enfMakeUser('finance');

    $this->actingAs($finance)->get('/admin/dashboard')->assertOk();
    $this->actingAs($finance)->get('/admin/academy/payments')->assertOk();
    $this->actingAs($finance)->get('/admin/settings')->assertForbidden();
    $this->actingAs($finance)->get('/admin/academy/staff')->assertForbidden();
});

test('staff roles are redirected to the admin dashboard', function () {
    $support = enfMakeUser('support');
    $finance = enfMakeUser('finance');

    $this->actingAs($support)->get('/dashboard')->assertRedirect(route('admin.dashboard'));
    $this->actingAs($finance)->get('/dashboard')->assertRedirect(route('admin.dashboard'));
});

test('students and instructors still cannot enter the admin panel', function () {
    $student = enfMakeUser('student');
    $instructor = enfMakeUser('instructor');

    $this->actingAs($student)->get('/admin/dashboard')->assertForbidden();
    $this->actingAs($student)->get('/admin/academy/coupons')->assertForbidden();
    $this->actingAs($instructor)->get('/admin/dashboard')->assertForbidden();
});

test('admins keep full access including admin-only areas', function () {
    $admin = enfMakeUser('admin');

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
    $this->actingAs($admin)->get('/admin/settings')->assertOk();
    $this->actingAs($admin)->get('/admin/academy/staff')->assertOk();
    $this->actingAs($admin)->get('/admin/users')->assertOk();
    $this->actingAs($admin)->get('/admin/academy/integrations')->assertOk();
    $this->actingAs($admin)->get('/admin/academy/system')->assertOk();
});

// --- Announcement type / audience / pin ---

test('an admin can create an announcement with type, audience and pin', function () {
    $admin = enfMakeUser('admin');
    $instructor = enfMakeUser('instructor');
    $course = enfMakeCourse($instructor);

    $this->actingAs($admin)
        ->post('/admin/academy/announcements', [
            'course_id' => $course->id,
            'title' => 'Live session tomorrow',
            'content' => 'Join us at 7pm.',
            'type' => 'live',
            'audience' => 'students',
            'is_pinned' => true,
            'publish' => true,
        ])
        ->assertRedirect();

    $announcement = CourseAnnouncement::query()->firstOrFail();
    expect($announcement->type)->toBe('live')
        ->and($announcement->audience)->toBe('students')
        ->and($announcement->is_pinned)->toBeTrue()
        ->and($announcement->published_at)->not->toBeNull();

    // Defaults apply when the fields are omitted.
    $this->actingAs($admin)
        ->post('/admin/academy/announcements', [
            'course_id' => $course->id,
            'title' => 'Plain notice',
            'content' => 'Hello.',
            'publish' => true,
        ])
        ->assertRedirect();

    $plain = CourseAnnouncement::query()->where('title', 'Plain notice')->firstOrFail();
    expect($plain->type)->toBe('general')
        ->and($plain->audience)->toBe('all')
        ->and($plain->is_pinned)->toBeFalse();
});

test('the student list respects audience and shows pinned first', function () {
    $instructor = enfMakeUser('instructor');
    $student = enfMakeUser('student');
    $course = enfMakeCourse($instructor);

    Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    CourseAnnouncement::create([
        'course_id' => $course->id,
        'title' => 'Old general notice',
        'content' => 'Old.',
        'type' => 'general',
        'audience' => 'all',
        'is_pinned' => false,
        'published_at' => now()->subDay(),
    ]);
    CourseAnnouncement::create([
        'course_id' => $course->id,
        'title' => 'Pinned promo',
        'content' => 'Pinned.',
        'type' => 'promo',
        'audience' => 'all',
        'is_pinned' => true,
        'published_at' => now()->subDays(2),
    ]);
    CourseAnnouncement::create([
        'course_id' => $course->id,
        'title' => 'Instructor-only note',
        'content' => 'For instructors.',
        'type' => 'general',
        'audience' => 'instructors',
        'is_pinned' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($student)->get('/student/announcements')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Announcements/Index')
            // Pinned first even though it is older; instructor-only hidden.
            ->where('announcements.0.title', 'Pinned promo')
            ->where('announcements.0.pinned', true)
            ->where('announcements.0.category', 'promo')
            ->where('announcements.1.title', 'Old general notice')
            ->has('announcements', 2));
});

// --- Landing page CMS ---

test('the landing page uses CMS content when set and falls back otherwise', function () {
    // No CMS values: props are null and the page falls back to hardcoded copy.
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->where('landing', ['promo' => null, 'heroTitle' => null, 'heroIntro' => null]));

    Setting::setValue('landing_promo', 'TEST PROMO', 'landing');
    Setting::setValue('landing_hero_title', 'Test hero title', 'landing');
    Setting::setValue('landing_hero_intro', 'Test hero intro.', 'landing');

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('landing', ['promo' => 'TEST PROMO', 'heroTitle' => 'Test hero title', 'heroIntro' => 'Test hero intro.']));
});

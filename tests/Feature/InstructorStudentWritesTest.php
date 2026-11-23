<?php

use App\Models\Coupon;
use App\Models\Course;
use App\Models\CourseAnnouncement;
use App\Models\CourseCategory;
use App\Models\CoursePayment;
use App\Models\CourseQuestion;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Refund;
use App\Models\StudentNote;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function w5MakeUser(string $role): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole($role);

    return $user;
}

function w5MakeCourse(User $instructor, array $overrides = []): Course
{
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);

    return Course::query()->create(array_merge([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Course '.uniqid(),
        'slug' => 'course-'.uniqid(),
        'price' => 50000,
        'sale_price' => null,
        'pricing_type' => 'paid',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 60,
        'published_at' => now(),
    ], $overrides));
}

function w5Enroll(User $student, Course $course, string $status = 'active'): Enrollment
{
    return Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => $status,
        'price_paid' => 0,
        'enrolled_at' => now(),
    ]);
}

// --- Instructor announcements ---

test('instructor can publish and draft announcements for their own courses', function () {
    $instructor = w5MakeUser('instructor');
    $course = w5MakeCourse($instructor);

    $this->actingAs($instructor)
        ->post('/instructor/announcements', ['course_id' => $course->id, 'title' => 'Live tonight', 'content' => 'See you at 7', 'publish' => true])
        ->assertRedirect();

    expect(CourseAnnouncement::query()->where('title', 'Live tonight')->firstOrFail()->published_at)->not->toBeNull();

    $this->actingAs($instructor)
        ->post('/instructor/announcements', ['course_id' => $course->id, 'title' => 'Draft one', 'content' => 'Not yet', 'publish' => false])
        ->assertRedirect();

    expect(CourseAnnouncement::query()->where('title', 'Draft one')->firstOrFail()->published_at)->toBeNull();

    $this->actingAs($instructor)->get('/instructor/announcements')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Announcements/Index')
            ->has('announcements', 2)
            ->has('courses', 1));
});

test('instructor cannot manage announcements for courses they do not teach', function () {
    $instructor = w5MakeUser('instructor');
    $other = w5MakeUser('instructor');
    $course = w5MakeCourse($other);

    $this->actingAs($instructor)
        ->post('/instructor/announcements', ['course_id' => $course->id, 'title' => 'Nope', 'content' => 'x'])
        ->assertForbidden();

    $announcement = CourseAnnouncement::create(['course_id' => $course->id, 'title' => 'Hi', 'content' => 'x', 'published_at' => now()]);

    $this->actingAs($instructor)->put("/instructor/announcements/{$announcement->id}", ['course_id' => $course->id, 'title' => 'Edited', 'content' => 'x'])->assertForbidden();
    $this->actingAs($instructor)->delete("/instructor/announcements/{$announcement->id}")->assertForbidden();
    $this->actingAs($instructor)->post("/instructor/announcements/{$announcement->id}/publish")->assertForbidden();

    expect(CourseAnnouncement::query()->count())->toBe(1);
});

test('instructor can update, publish, unpublish and delete own announcements', function () {
    $instructor = w5MakeUser('instructor');
    $course = w5MakeCourse($instructor);
    $announcement = CourseAnnouncement::create(['course_id' => $course->id, 'title' => 'Old', 'content' => 'x']);

    $this->actingAs($instructor)
        ->put("/instructor/announcements/{$announcement->id}", ['course_id' => $course->id, 'title' => 'New', 'content' => 'y'])
        ->assertRedirect();
    expect($announcement->fresh()->title)->toBe('New');

    $this->actingAs($instructor)->post("/instructor/announcements/{$announcement->id}/publish")->assertRedirect();
    expect($announcement->fresh()->published_at)->not->toBeNull();

    $this->actingAs($instructor)->post("/instructor/announcements/{$announcement->id}/unpublish")->assertRedirect();
    expect($announcement->fresh()->published_at)->toBeNull();

    $this->actingAs($instructor)->delete("/instructor/announcements/{$announcement->id}")->assertRedirect();
    expect(CourseAnnouncement::query()->count())->toBe(0);
});

// --- Instructor Q&A ---

test('instructor can answer questions on their own courses', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    $question = CourseQuestion::create(['course_id' => $course->id, 'student_id' => $student->id, 'question' => 'Why?']);

    $this->actingAs($instructor)->get('/instructor/qa')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/QA/Index')
            ->has('questions', 1)
            ->where('questions.0.q', 'Why?')
            ->where('questions.0.is_answered', false));

    $this->actingAs($instructor)
        ->post("/instructor/qa/{$question->id}/answer", ['answer' => 'Because.'])
        ->assertRedirect();

    $fresh = $question->fresh();
    expect($fresh->answer)->toBe('Because.')
        ->and($fresh->is_answered)->toBeTrue()
        ->and($fresh->answered_by)->toBe($instructor->id)
        ->and($fresh->answered_at)->not->toBeNull();
});

test('instructor cannot answer questions on courses they do not teach', function () {
    $instructor = w5MakeUser('instructor');
    $other = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($other);
    $question = CourseQuestion::create(['course_id' => $course->id, 'student_id' => $student->id, 'question' => 'Why?']);

    $this->actingAs($instructor)
        ->post("/instructor/qa/{$question->id}/answer", ['answer' => 'Nope.'])
        ->assertForbidden();

    expect($question->fresh()->is_answered)->toBeFalse();
});

// --- Instructor review replies ---

test('instructor can reply to reviews on their own courses', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    $review = CourseReview::create(['student_id' => $student->id, 'course_id' => $course->id, 'rating' => 5, 'comment' => 'Great!', 'is_approved' => true]);

    $this->actingAs($instructor)->get('/instructor/reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Reviews/Index')
            ->has('reviews', 1));

    $this->actingAs($instructor)
        ->post("/instructor/reviews/{$review->id}/reply", ['reply' => 'Thank you!'])
        ->assertRedirect();

    expect($review->fresh()->reply)->toBe('Thank you!');
});

test('instructor review list hides hidden reviews and reply is scoped to own courses', function () {
    $instructor = w5MakeUser('instructor');
    $other = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $student2 = w5MakeUser('student');
    $mine = w5MakeCourse($instructor);
    $theirs = w5MakeCourse($other);

    CourseReview::create(['student_id' => $student->id, 'course_id' => $mine->id, 'rating' => 4, 'comment' => 'Visible', 'is_approved' => true]);
    CourseReview::create(['student_id' => $student2->id, 'course_id' => $mine->id, 'rating' => 1, 'comment' => 'Hidden', 'is_approved' => true, 'is_hidden' => true]);
    $foreign = CourseReview::create(['student_id' => $student->id, 'course_id' => $theirs->id, 'rating' => 5, 'comment' => 'Other', 'is_approved' => true]);

    $this->actingAs($instructor)->get('/instructor/reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('reviews', 1));

    $this->actingAs($instructor)
        ->post("/instructor/reviews/{$foreign->id}/reply", ['reply' => 'Nope'])
        ->assertForbidden();
});

// --- Instructor profile ---

test('instructor can view and update their profile', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    w5Enroll($student, $course);
    CourseReview::create(['student_id' => $student->id, 'course_id' => $course->id, 'rating' => 5, 'comment' => 'Great!', 'is_approved' => true]);

    $this->actingAs($instructor)->get('/instructor/profile')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Profile')
            ->where('stats.courses', 1)
            ->where('stats.students', 1)
            ->has('courses', 1));

    $this->actingAs($instructor)
        ->put('/instructor/profile', ['name' => 'New Name', 'bio' => 'Hello', 'phone' => '09123456789', 'address' => 'Yangon'])
        ->assertRedirect();

    expect($instructor->fresh()->name)->toBe('New Name')
        ->and($instructor->fresh()->profile->bio)->toBe('Hello')
        ->and($instructor->fresh()->profile->phone)->toBe('09123456789')
        ->and($instructor->fresh()->profile->address)->toBe('Yangon');
});

// --- Student reviews ---

test('student can submit and resubmit a review for an enrolled course', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    w5Enroll($student, $course);

    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 5, 'comment' => 'Loved it'])
        ->assertRedirect();

    $review = CourseReview::query()->firstOrFail();
    expect($review->rating)->toBe(5)->and($review->is_approved)->toBeFalse();

    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 4, 'comment' => 'Changed my mind'])
        ->assertRedirect();

    expect(CourseReview::query()->count())->toBe(1)
        ->and(CourseReview::query()->firstOrFail()->rating)->toBe(4)
        ->and(CourseReview::query()->firstOrFail()->is_approved)->toBeFalse();

    $this->actingAs($student)->get('/student/reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Reviews/Index')
            ->has('reviews', 1)
            ->has('enrolledCourses', 1));
});

test('student cannot review a course they are not enrolled in', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);

    $this->actingAs($student)
        ->post('/student/reviews', ['course_id' => $course->id, 'rating' => 5, 'comment' => 'Nope'])
        ->assertSessionHasErrors('course_id');

    expect(CourseReview::query()->count())->toBe(0);
});

// --- Student notes ---

test('student can create, update and delete their own notes', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    w5Enroll($student, $course);

    $this->actingAs($student)
        ->post('/student/notes', ['course_id' => $course->id, 'title' => 'Flexbox', 'content' => 'gap beats margin'])
        ->assertRedirect();

    $note = StudentNote::query()->firstOrFail();
    expect($note->student_id)->toBe($student->id)->and($note->title)->toBe('Flexbox');

    $this->actingAs($student)->get('/student/notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Notes/Index')
            ->has('notes', 1)
            ->has('courses', 1));

    $this->actingAs($student)
        ->put("/student/notes/{$note->id}", ['course_id' => $course->id, 'title' => 'Grid', 'content' => 'two axes'])
        ->assertRedirect();
    expect($note->fresh()->title)->toBe('Grid');

    $this->actingAs($student)->delete("/student/notes/{$note->id}")->assertRedirect();
    expect(StudentNote::query()->count())->toBe(0);
});

test('student cannot touch another student notes', function () {
    $student = w5MakeUser('student');
    $other = w5MakeUser('student');
    $note = StudentNote::create(['student_id' => $other->id, 'title' => 'Mine', 'content' => 'secret']);

    $this->actingAs($student)->put("/student/notes/{$note->id}", ['title' => 'Hacked', 'content' => 'x'])->assertForbidden();
    $this->actingAs($student)->delete("/student/notes/{$note->id}")->assertForbidden();
    expect($note->fresh()->title)->toBe('Mine');

    $this->actingAs($student)->get('/student/notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('notes', 0));
});

// --- Student refund requests ---

test('student can request a refund for their own approved payment', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    $payment = CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);

    $this->actingAs($student)->get('/student/refunds')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Refunds/Index')
            ->has('refunds', 0)
            ->has('payments', 1));

    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $payment->id, 'reason' => 'မှားယွင်း ဝယ်ယူမိပါတယ်', 'detail' => 'Wrong course', 'amount' => 50000])
        ->assertRedirect();

    $refund = Refund::query()->firstOrFail();
    expect($refund->status)->toBe('pending')
        ->and((float) $refund->amount)->toBe(50000.0)
        ->and($refund->course_payment_id)->toBe($payment->id);

    // The payment no longer shows as refundable while the request is open.
    $this->actingAs($student)->get('/student/refunds')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('refunds', 1)->has('payments', 0));
});

test('refund requests enforce ownership, amount, payment status and duplicates', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $other = w5MakeUser('student');
    $course = w5MakeCourse($instructor);

    $foreign = CoursePayment::create(['student_id' => $other->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);
    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $foreign->id, 'reason' => 'x', 'amount' => 1000])
        ->assertForbidden();

    $pending = CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'pending']);
    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $pending->id, 'reason' => 'x', 'amount' => 1000])
        ->assertSessionHasErrors('course_payment_id');

    $approved = CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);
    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $approved->id, 'reason' => 'x', 'amount' => 60000])
        ->assertSessionHasErrors('amount');

    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $approved->id, 'reason' => 'x', 'amount' => 50000])
        ->assertRedirect();

    $this->actingAs($student)
        ->post('/student/refunds', ['course_payment_id' => $approved->id, 'reason' => 'again', 'amount' => 1000])
        ->assertSessionHasErrors('course_payment_id');

    expect(Refund::query()->count())->toBe(1);
});

// --- Cart, checkout and orders ---

test('student can manage the session cart', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);

    $this->actingAs($student)->get('/student/cart')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Student/Cart/Index')->has('courses', 0));

    $this->actingAs($student)
        ->post('/student/cart', ['course_id' => $course->id])
        ->assertRedirect();

    $this->actingAs($student)->get('/student/cart')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('courses', 1)->where('courses.0.id', $course->id));

    $this->actingAs($student)->delete("/student/cart/{$course->id}")->assertRedirect();

    $this->actingAs($student)->get('/student/cart')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('courses', 0));
});

test('coupon validation endpoint accepts usable coupons only', function () {
    $student = w5MakeUser('student');
    Coupon::create(['code' => 'CODEXA10', 'discount_type' => 'percent', 'discount_value' => 10, 'is_active' => true]);
    Coupon::create(['code' => 'DEAD', 'discount_type' => 'percent', 'discount_value' => 50, 'is_active' => false]);

    $this->actingAs($student)->getJson('/student/coupons/validate?code=codexa10')
        ->assertOk()
        ->assertJson(['valid' => true, 'discount_type' => 'percent', 'discount_value' => 10]);

    $this->actingAs($student)->getJson('/student/coupons/validate?code=DEAD')->assertOk()->assertJson(['valid' => false]);
    $this->actingAs($student)->getJson('/student/coupons/validate?code=NOPE')->assertOk()->assertJson(['valid' => false]);
});

test('checkout creates an order, items and a pending payment with coupon discount', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $courseA = w5MakeCourse($instructor, ['price' => 100000, 'sale_price' => 80000]);
    $courseB = w5MakeCourse($instructor, ['price' => 50000]);
    Coupon::create(['code' => 'CODEXA10', 'discount_type' => 'percent', 'discount_value' => 10, 'is_active' => true]);

    $this->actingAs($student)
        ->withSession(['cart' => [$courseA->id, $courseB->id]])
        ->get('/student/checkout')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Student/Checkout/Index')->has('courses', 2));

    $this->actingAs($student)
        ->post('/student/orders', [
            'course_ids' => [$courseA->id, $courseB->id],
            'coupon_code' => 'codexa10',
            'method' => 'bank',
            'reference' => 'TXN-123',
        ])
        ->assertRedirect();

    // Subtotal 80000 + 50000 = 130000, minus 10% = 117000.
    $order = Order::query()->firstOrFail();
    expect($order->status)->toBe('pending')
        ->and((float) $order->total)->toBe(117000.0)
        ->and($order->coupon_code)->toBe('CODEXA10')
        ->and($order->items()->count())->toBe(2);

    $payment = CoursePayment::query()->firstOrFail();
    expect($payment->status)->toBe('pending')
        ->and((float) $payment->amount)->toBe(117000.0)
        ->and($payment->method)->toBe('bank')
        ->and($payment->course_id)->toBeNull()
        ->and($payment->notes)->toBe('Order #'.$order->id);

    $this->actingAs($student)->get('/student/orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Orders/Index')
            ->has('orders', 1)
            ->where('orders.0.status', 'pending'));

    // A second order for the same course is blocked while the first is pending.
    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$courseA->id], 'method' => 'kbzpay'])
        ->assertSessionHasErrors('course_ids');
});

test('checkout rejects invalid coupons and already-enrolled courses', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $owned = w5MakeCourse($instructor);
    $fresh = w5MakeCourse($instructor);
    w5Enroll($student, $owned);

    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$fresh->id], 'coupon_code' => 'NOPE', 'method' => 'kbzpay'])
        ->assertSessionHasErrors('coupon_code');

    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$owned->id], 'method' => 'kbzpay'])
        ->assertSessionHasErrors('course_ids');

    // Mixed cart: the owned course is dropped, the fresh one orders fine.
    $this->actingAs($student)
        ->post('/student/orders', ['course_ids' => [$owned->id, $fresh->id], 'method' => 'kbzpay'])
        ->assertRedirect();

    expect(Order::query()->count())->toBe(1)
        ->and(Order::query()->firstOrFail()->items()->count())->toBe(1);
});

// --- Instructor payout requests ---

test('instructor can request a payout up to their available balance', function () {
    $instructor = w5MakeUser('instructor');
    $student = w5MakeUser('student');
    $course = w5MakeCourse($instructor);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 100000, 'method' => 'kbzpay', 'status' => 'approved']);

    // Available balance is 50% of approved payments: 50000.
    $this->actingAs($instructor)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Earnings/Index')
            ->where('availableBalance', 50000)
            ->where('pendingPayout', null));

    $this->actingAs($instructor)
        ->post('/instructor/payouts', ['amount' => 60000, 'method' => 'kbzpay'])
        ->assertSessionHasErrors('amount');

    $this->actingAs($instructor)
        ->post('/instructor/payouts', ['amount' => 30000, 'method' => 'kbzpay'])
        ->assertRedirect();

    $payout = Payout::query()->firstOrFail();
    expect($payout->status)->toBe('pending')
        ->and((float) $payout->amount)->toBe(30000.0)
        ->and($payout->instructor_id)->toBe($instructor->id);

    $this->actingAs($instructor)->get('/instructor/earnings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableBalance', 20000)
            ->where('pendingPayout.amount', 30000));
});

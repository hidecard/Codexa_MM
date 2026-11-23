<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CoursePayment;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\Faq;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonResource;
use App\Models\LiveSession;
use App\Models\Message;
use App\Models\SystemLog;
use App\Models\User;
use App\Models\Wishlist;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function rdMakeUser(string $role): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole($role);

    return $user;
}

function rdMakeCourse(User $instructor, array $overrides = []): Course
{
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);

    return Course::query()->create(array_merge([
        'category_id' => $category->id,
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

function rdEnroll(User $student, Course $course, string $status = 'active'): Enrollment
{
    return Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => $status,
        'price_paid' => 50000,
        'enrolled_at' => now(),
    ]);
}

function rdMakeLesson(Course $course): Lesson
{
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Module 1', 'position' => 1]);

    return Lesson::create([
        'module_id' => $module->id,
        'title' => 'Lesson 1',
        'content' => 'Content',
        'duration' => 10,
        'type' => 'video',
        'position' => 1,
    ]);
}

// --- Admin ---

test('admin dashboard shows real KPIs from CoursePayment and enrollments', function () {
    $admin = rdMakeUser('admin');
    $instructor = rdMakeUser('instructor');
    $student = rdMakeUser('student');
    $course = rdMakeCourse($instructor);
    rdEnroll($student, $course);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 30000, 'method' => 'wavepay', 'status' => 'pending']);

    $this->actingAs($admin)->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.totalStudents', 1)
            ->where('stats.totalCourses', 1)
            ->where('stats.monthRevenue', 50000)
            ->where('tasks.0.count', 1)
            ->has('monthlyRevenue', 6)
            ->has('topCourses', 1)
            ->where('topCourses.0.revenue', 50000));
});

test('admin reports show real revenue and enrollment aggregates', function () {
    $admin = rdMakeUser('admin');
    $instructor = rdMakeUser('instructor');
    $student = rdMakeUser('student');
    $course = rdMakeCourse($instructor);
    rdEnroll($student, $course);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);

    $this->actingAs($admin)->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->where('stats.totalRevenue', 50000)
            ->where('stats.totalEnrollments', 1)
            ->has('monthlyRevenue', 6)
            ->has('monthlyEnrollments', 6)
            ->has('paymentMix', 1)
            ->where('paymentMix.0.name', 'KBZPay'));
});

test('admin activity logs surface system_logs rows', function () {
    $admin = rdMakeUser('admin');
    SystemLog::create(['user_id' => $admin->id, 'level' => 'info', 'channel' => 'payments', 'event' => 'payment.approved', 'message' => 'Payment approved', 'context' => ['subject' => 'TXN-0001']]);

    $this->actingAs($admin)->get(route('admin.activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ActivityLogs/Index')
            ->has('logs', 1)
            ->where('logs.0.action', 'Payment approved')
            ->where('logs.0.type', 'payment'));
});

test('admin can list users and assign roles', function () {
    $admin = rdMakeUser('admin');
    $student = rdMakeUser('student');

    $this->actingAs($admin)->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 2));

    $this->actingAs($admin)->post(route('admin.users.roles.update', $student), ['roles' => ['student', 'instructor']])
        ->assertRedirect();

    expect($student->fresh()->hasRole('instructor'))->toBeTrue();
});

test('admin cannot remove their own admin role', function () {
    $admin = rdMakeUser('admin');

    $this->actingAs($admin)->post(route('admin.users.roles.update', $admin), ['roles' => ['student']])
        ->assertRedirect();

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

test('admin roles page lists roles with permissions', function () {
    $admin = rdMakeUser('admin');

    $this->actingAs($admin)->get(route('admin.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Roles/Index')
            ->where('roles', fn ($roles) => collect(['admin', 'instructor', 'student', 'client'])->diff(collect($roles)->pluck('name'))->isEmpty()));
});

// --- Student: learning paths ---

test('student paths show real paths with real course progress', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $course = rdMakeCourse($instructor);
    $lesson = rdMakeLesson($course);
    $enrollment = rdEnroll($student, $course);
    LessonProgress::create(['enrollment_id' => $enrollment->id, 'lesson_id' => $lesson->id, 'is_completed' => true, 'completed_at' => now()]);

    $path = LearningPath::create(['title' => 'Web Path', 'description' => 'Goal', 'is_published' => true, 'sort_order' => 1]);
    $path->courses()->attach($course->id, ['position' => 1]);

    $this->actingAs($student)->get(route('student.paths.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Paths/Index')
            ->has('paths', 1)
            ->where('paths.0.title', 'Web Path')
            ->where('paths.0.steps.0.progress', 100));

    $this->actingAs($student)->get(route('student.paths.show', $path))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Paths/Show')
            ->where('path.title', 'Web Path')
            ->where('path.steps.0.lessons', 1));
});

test('student can follow and unfollow a learning path', function () {
    $student = rdMakeUser('student');
    $path = LearningPath::create(['title' => 'Path', 'is_published' => true]);

    $this->actingAs($student)->post(route('student.paths.follow', $path))->assertRedirect();
    expect($path->fresh()->followers()->whereKey($student->id)->exists())->toBeTrue();

    $this->actingAs($student)->post(route('student.paths.follow', $path))->assertRedirect();
    expect($path->fresh()->followers()->whereKey($student->id)->exists())->toBeFalse();
});

// --- Student: resources ---

test('student resources show only resources of enrolled courses', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $enrolled = rdMakeCourse($instructor);
    $other = rdMakeCourse($instructor);
    rdEnroll($student, $enrolled);

    LessonResource::create(['lesson_id' => rdMakeLesson($enrolled)->id, 'file_path' => 'private/a.pdf', 'file_type' => 'application/pdf', 'original_name' => 'Enrolled notes.pdf', 'file_size' => 100]);
    LessonResource::create(['lesson_id' => rdMakeLesson($other)->id, 'file_path' => 'private/b.pdf', 'file_type' => 'application/pdf', 'original_name' => 'Other notes.pdf', 'file_size' => 100]);

    $this->actingAs($student)->get(route('student.resources.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Resources/Index')
            ->has('resources', 1)
            ->where('resources.0.title', 'Enrolled notes.pdf'));
});

// --- Student: messages ---

test('student can send messages and see threads with unread counts', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');

    $this->actingAs($student)->post(route('student.messages.store'), ['recipient_id' => $instructor->id, 'body' => 'Hello teacher'])
        ->assertRedirect();
    expect(Message::query()->where('body', 'Hello teacher')->exists())->toBeTrue();

    Message::create(['sender_id' => $instructor->id, 'recipient_id' => $student->id, 'body' => 'Hi there']);

    $this->actingAs($student)->get(route('student.messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Messages/Index')
            ->has('threads', 1)
            ->where('threads.0.unread', 1)
            ->has('threads.0.msgs', 2));

    $this->actingAs($student)->post(route('student.messages.read', $instructor))->assertRedirect();
    expect(Message::query()->where('sender_id', $instructor->id)->whereNull('read_at')->exists())->toBeFalse();
});

// --- Student: schedule ---

test('student schedule shows live sessions of enrolled courses this week', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $course = rdMakeCourse($instructor);
    rdEnroll($student, $course);

    LiveSession::create([
        'course_id' => $course->id,
        'instructor_id' => $instructor->id,
        'title' => 'Weekly Live',
        'scheduled_at' => now()->addDay(),
        'duration_minutes' => 60,
        'status' => 'scheduled',
    ]);

    $this->actingAs($student)->get(route('student.schedule.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Schedule/Index')
            ->has('weekDays', 7)
            ->has('liveThisWeek', 1)
            ->where('liveThisWeek.0.title', 'Weekly Live'));
});

// --- Student: progress ---

test('student progress derives from lesson progress and quiz attempts', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $course = rdMakeCourse($instructor);
    $lesson = rdMakeLesson($course);
    $enrollment = rdEnroll($student, $course);
    LessonProgress::create(['enrollment_id' => $enrollment->id, 'lesson_id' => $lesson->id, 'watch_time' => 600, 'is_completed' => true, 'completed_at' => now()]);

    $this->actingAs($student)->get(route('student.progress.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Progress/Index')
            ->has('courses', 1)
            ->where('courses.0.progress', 100)
            ->where('totalWatchMinutes', 10)
            ->has('weeklyActivity', 7));
});

// --- Student: help & payments & wishlist ---

test('student help shows only published FAQs', function () {
    $student = rdMakeUser('student');
    Faq::create(['question' => 'Published?', 'answer' => 'Yes', 'sort_order' => 1, 'is_published' => true]);
    Faq::create(['question' => 'Draft?', 'answer' => 'No', 'sort_order' => 2, 'is_published' => false]);

    $this->actingAs($student)->get(route('student.help.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Help/Index')
            ->has('faqs', 1)
            ->where('faqs.0.q', 'Published?'));
});

test('student payments show only the student own CoursePayment records', function () {
    $student = rdMakeUser('student');
    $other = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $course = rdMakeCourse($instructor);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);
    CoursePayment::create(['student_id' => $other->id, 'course_id' => $course->id, 'amount' => 50000, 'method' => 'kbzpay', 'status' => 'approved']);

    $this->actingAs($student)->get(route('student.payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Payments/Index')
            ->has('payments', 1)
            ->where('payments.0.status', 'approved'));
});

test('student wishlist add and remove round-trips', function () {
    $student = rdMakeUser('student');
    $instructor = rdMakeUser('instructor');
    $course = rdMakeCourse($instructor);

    $this->actingAs($student)->post(route('student.wishlist.store', $course))->assertRedirect();
    expect(Wishlist::query()->where('user_id', $student->id)->where('course_id', $course->id)->exists())->toBeTrue();

    $this->actingAs($student)->get(route('student.wishlist'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Wishlist')
            ->has('courses', 1));

    $this->actingAs($student)->delete(route('student.wishlist.destroy', $course))->assertRedirect();
    expect(Wishlist::query()->where('user_id', $student->id)->exists())->toBeFalse();
});

// --- Instructor ---

test('instructor dashboard shows own courses, students and 50% share', function () {
    $instructor = rdMakeUser('instructor');
    $student = rdMakeUser('student');
    $course = rdMakeCourse($instructor);
    rdEnroll($student, $course);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 100000, 'method' => 'kbzpay', 'status' => 'approved']);
    CourseReview::create(['student_id' => $student->id, 'course_id' => $course->id, 'rating' => 5, 'comment' => 'Great', 'is_approved' => true]);

    $this->actingAs($instructor)->get(route('instructor.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Dashboard')
            ->where('stats.courses', 1)
            ->where('stats.students', 1)
            ->where('stats.shareTotal', 50000)
            ->where('stats.avgRating', 5)
            ->has('recentReviews', 1));
});

test('instructor students list shows enrolled students of own courses only', function () {
    $instructor = rdMakeUser('instructor');
    $otherInstructor = rdMakeUser('instructor');
    $student = rdMakeUser('student');
    $mine = rdMakeCourse($instructor);
    $theirs = rdMakeCourse($otherInstructor);
    rdEnroll($student, $mine);
    rdEnroll($student, $theirs);

    $this->actingAs($instructor)->get(route('instructor.students.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Students/Index')
            ->has('students', 1)
            ->where('students.0.courseId', $mine->id));
});

test('instructor earnings show per-course revenue and monthly history', function () {
    $instructor = rdMakeUser('instructor');
    $student = rdMakeUser('student');
    $course = rdMakeCourse($instructor);
    rdEnroll($student, $course);
    CoursePayment::create(['student_id' => $student->id, 'course_id' => $course->id, 'amount' => 100000, 'method' => 'kbzpay', 'status' => 'approved']);

    $this->actingAs($instructor)->get(route('instructor.earnings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Earnings/Index')
            ->where('stats.totalRevenue', 100000)
            ->where('stats.totalShare', 50000)
            ->where('availableBalance', 50000)
            ->has('courseEarnings', 1)
            ->where('courseEarnings.0.share', 50000)
            ->has('monthlyHistory', 6));

    $this->actingAs($instructor)->get(route('instructor.earnings.show', $course))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Earnings/Show')
            ->where('course.revenue', 100000));
});

test('instructor cannot view earnings of a course they do not teach', function () {
    $instructor = rdMakeUser('instructor');
    $otherInstructor = rdMakeUser('instructor');
    $course = rdMakeCourse($otherInstructor);

    $this->actingAs($instructor)->get(route('instructor.earnings.show', $course))
        ->assertForbidden();
});

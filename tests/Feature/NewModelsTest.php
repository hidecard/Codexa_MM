<?php

use App\Models\Badge;
use App\Models\BadgeAward;
use App\Models\CommunityPost;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\InstructorApplication;
use App\Models\LessonProgress;
use App\Models\ReviewReport;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function newModelsAdmin(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('admin');

    return $user;
}

function newModelsStudent(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('student');

    return $user;
}

function newModelsEnroll(User $student, int $lessonsCompleted = 0): array
{
    [$course, $lesson1, $lesson2] = makePublishedCourse('nm-'.uniqid());
    $enrollment = Enrollment::query()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'price_paid' => 0,
        'enrolled_at' => now(),
    ]);
    $lessons = [$lesson1, $lesson2];
    for ($i = 0; $i < $lessonsCompleted && $i < count($lessons); $i++) {
        LessonProgress::create([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lessons[$i]->id,
            'is_completed' => true,
            'completed_at' => now(),
            'watch_time' => 60,
        ]);
    }

    return [$course, $enrollment, $lesson1, $lesson2];
}

// --- Instructor applications ---

test('guest cannot apply to teach and a student can submit one pending application', function () {
    $this->post('/teach/apply', ['expertise' => 'Python'])->assertRedirect('/login');

    $student = newModelsStudent();
    $this->actingAs($student)->post('/teach/apply', [
        'expertise' => 'Python',
        'experience' => 'အတွေ့အကြုံ 3–4 နှစ်',
        'bio' => 'I teach Python.',
        'portfolio_links' => ['https://example.com/me'],
    ])->assertRedirect();

    expect(InstructorApplication::query()->count())->toBe(1);
    $app = InstructorApplication::first();
    expect($app->status)->toBe('pending')->and($app->expertise)->toBe('Python');

    // A second application while one is pending is rejected.
    $this->actingAs($student)->post('/teach/apply', ['expertise' => 'React'])
        ->assertSessionHasErrors('application');
    expect(InstructorApplication::query()->count())->toBe(1);

    // The teach page surfaces the pending application.
    $this->actingAs($student)->get('/teach')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Teach')
            ->where('application.status', 'pending'));
});

test('admin approving an application assigns the instructor role; rejection allows re-applying', function () {
    $admin = newModelsAdmin();
    $student = newModelsStudent();
    $app = InstructorApplication::factory()->create(['user_id' => $student->id]);

    $this->actingAs($admin)->get('/admin/academy/instructors')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('applications', 1));

    $this->actingAs($admin)->post("/admin/academy/instructor-applications/{$app->id}/approve", ['admin_note' => 'Welcome!'])
        ->assertRedirect();

    expect($app->fresh()->status)->toBe('approved')
        ->and($student->fresh()->hasRole('instructor'))->toBeTrue();

    $other = newModelsStudent();
    $rejected = InstructorApplication::factory()->create(['user_id' => $other->id]);
    $this->actingAs($admin)->post("/admin/academy/instructor-applications/{$rejected->id}/reject", ['admin_note' => 'Not yet'])
        ->assertRedirect();
    expect($rejected->fresh()->status)->toBe('rejected')
        ->and($other->fresh()->hasRole('instructor'))->toBeFalse();

    // Rejected applicants may apply again.
    $this->actingAs($other)->post('/teach/apply', ['expertise' => 'Laravel'])->assertRedirect();
    expect(InstructorApplication::query()->where('user_id', $other->id)->count())->toBe(2);
});

// --- Community posts ---

test('student community CRUD works and ownership is enforced', function () {
    $student = newModelsStudent();
    $other = newModelsStudent();

    $this->actingAs($student)->post('/student/community', [
        'category' => 'React',
        'title' => 'useEffect question',
        'body' => 'When should I use it?',
    ])->assertRedirect();
    expect(CommunityPost::query()->count())->toBe(1);
    $post = CommunityPost::first();
    expect($post->status)->toBe('published');

    $this->actingAs($student)->get('/student/community')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Community/Index')
            ->has('posts', 1)
            ->where('posts.0.title', 'useEffect question'));

    $this->actingAs($student)->get("/student/community/{$post->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Student/Community/Show'));

    // Another student cannot edit or delete it.
    $this->actingAs($other)->put("/student/community/{$post->id}", ['category' => 'Web', 'title' => 'Hijacked'])->assertForbidden();
    $this->actingAs($other)->delete("/student/community/{$post->id}")->assertForbidden();

    $this->actingAs($student)->put("/student/community/{$post->id}", [
        'category' => 'Web',
        'title' => 'Edited title',
        'body' => 'Edited body',
    ])->assertRedirect();
    expect($post->fresh()->title)->toBe('Edited title')->and($post->fresh()->category)->toBe('Web');

    $this->actingAs($student)->delete("/student/community/{$post->id}")->assertRedirect();
    expect(CommunityPost::query()->count())->toBe(0);
});

test('hidden community posts are excluded from the list and moderatable by admin', function () {
    $admin = newModelsAdmin();
    $student = newModelsStudent();
    $other = newModelsStudent();
    $post = CommunityPost::factory()->create(['user_id' => $student->id, 'status' => 'hidden']);

    // Hidden posts do not appear in the public list.
    $this->actingAs($other)->get('/student/community')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('posts', 0));

    // ... and other students cannot open them, but the author can.
    $this->actingAs($other)->get("/student/community/{$post->id}")->assertNotFound();
    $this->actingAs($student)->get("/student/community/{$post->id}")->assertOk();

    $this->actingAs($admin)->get('/admin/academy/moderation')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('posts', 1));

    $this->actingAs($admin)->post("/admin/academy/moderation/posts/{$post->id}/unhide")->assertRedirect();
    expect($post->fresh()->status)->toBe('published');

    $this->actingAs($admin)->post("/admin/academy/moderation/posts/{$post->id}/hide")->assertRedirect();
    expect($post->fresh()->status)->toBe('hidden');

    $this->actingAs($admin)->delete("/admin/academy/moderation/posts/{$post->id}")->assertRedirect();
    expect(CommunityPost::query()->count())->toBe(0);
});

// --- Review reports ---

test('a student can report a review once, but not their own', function () {
    $student = newModelsStudent();
    $review = CourseReview::factory()->create(['is_approved' => true]);
    $own = CourseReview::factory()->create(['student_id' => $student->id, 'is_approved' => true]);

    $this->actingAs($student)->post("/student/reviews/{$review->id}/report", ['reason' => 'Spam'])
        ->assertRedirect();
    expect(ReviewReport::query()->count())->toBe(1);

    $this->actingAs($student)->post("/student/reviews/{$review->id}/report", ['reason' => 'Again'])
        ->assertSessionHasErrors('reason');
    expect(ReviewReport::query()->count())->toBe(1);

    $this->actingAs($student)->post("/student/reviews/{$own->id}/report", ['reason' => 'Mine'])
        ->assertSessionHasErrors('reason');
    expect(ReviewReport::query()->count())->toBe(1);
});

test('admin review queue shows reported reviews and resolve hides the review', function () {
    $admin = newModelsAdmin();
    $review = CourseReview::factory()->create(['is_approved' => true, 'is_hidden' => false]);
    $report = ReviewReport::factory()->create(['course_review_id' => $review->id]);

    $this->actingAs($admin)->get('/admin/academy/reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports', 1)
            ->where('reports.0.review_id', $review->id)
            ->where('reviews.0.status', 'reported'));

    $this->actingAs($admin)->post("/admin/academy/review-reports/{$report->id}/resolve")->assertRedirect();
    expect($report->fresh()->status)->toBe('resolved')
        ->and($review->fresh()->is_hidden)->toBeTrue();

    $review2 = CourseReview::factory()->create(['is_approved' => true]);
    $report2 = ReviewReport::factory()->create(['course_review_id' => $review2->id]);
    $this->actingAs($admin)->post("/admin/academy/review-reports/{$report2->id}/dismiss")->assertRedirect();
    expect($report2->fresh()->status)->toBe('dismissed')
        ->and($review2->fresh()->is_hidden)->toBeFalse();
});

// --- Badges & XP ---

test('completing lessons awards badges and XP on the achievements page', function () {
    $student = newModelsStudent();
    newModelsEnroll($student, 1);

    $this->actingAs($student)->get('/student/achievements')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Achievements/Index')
            ->where('totalXp', 20)
            ->has('achievements', 8)
            ->where('xpHistory.0.xp', 20));

    expect(Badge::query()->count())->toBe(8);
    $firstSteps = Badge::query()->where('name', 'First Steps')->first();
    expect(BadgeAward::query()->where('user_id', $student->id)->where('badge_id', $firstSteps->id)->exists())->toBeTrue();
    // 100 XP not reached yet.
    $hundred = Badge::query()->where('name', '100 XP')->first();
    expect(BadgeAward::query()->where('user_id', $student->id)->where('badge_id', $hundred->id)->exists())->toBeFalse();
});

test('five completed lessons earn the 100 XP badge and a completed course earns First Course', function () {
    $student = newModelsStudent();
    [$course, $enrollment, $lesson1, $lesson2] = newModelsEnroll($student, 2);

    // Complete 3 more lessons via additional modules/lessons on the course.
    $module = $course->modules()->first();
    for ($i = 3; $i <= 5; $i++) {
        $lesson = \App\Models\Lesson::query()->create([
            'module_id' => $module->id, 'title' => "Lesson {$i}", 'content' => 'x',
            'duration' => 5, 'type' => 'video', 'is_free' => false, 'position' => $i,
        ]);
        LessonProgress::create([
            'enrollment_id' => $enrollment->id, 'lesson_id' => $lesson->id,
            'is_completed' => true, 'completed_at' => now(), 'watch_time' => 30,
        ]);
    }
    $enrollment->update(['status' => 'completed', 'completed_at' => now()]);

    $this->actingAs($student)->get('/student/achievements')->assertOk();

    $awarded = BadgeAward::query()->where('user_id', $student->id)
        ->with('badge')->get()->pluck('badge.name')->all();
    expect($awarded)->toContain('First Steps', '100 XP', 'First Course');
    expect($awarded)->not->toContain('500 XP', '5 Courses');
});

test('the lesson-complete endpoint awards badges immediately', function () {
    $student = newModelsStudent();
    [$course, $enrollment, $lesson1] = newModelsEnroll($student, 0);

    $this->actingAs($student)->post("/student/courses/{$course->id}/lessons/{$lesson1->id}/complete")
        ->assertRedirect();

    $firstSteps = Badge::query()->where('name', 'First Steps')->first();
    expect($firstSteps)->not->toBeNull();
    expect(BadgeAward::query()->where('user_id', $student->id)->where('badge_id', $firstSteps->id)->exists())->toBeTrue();
});

test('leaderboard ranks students by period XP and includes the viewer', function () {
    $student = newModelsStudent();
    $other = newModelsStudent();
    newModelsEnroll($student, 1);
    newModelsEnroll($other, 2);

    $this->actingAs($student)->get('/student/leaderboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Leaderboard')
            ->has('week', 2)
            ->where('week.0.xp', 40)
            ->where('week.0.rank', 1)
            ->where('week.1.xp', 20)
            ->where('week.1.you', true)
            ->has('month', 2)
            ->has('xpRules'));
});

<?php

use App\Models\Course;
use App\Models\CourseAnnouncement;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CourseReview;
use App\Models\Lesson;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function adminContentAdmin(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('admin');

    return $user;
}

function adminContentInstructor(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('instructor');

    return $user;
}

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

// --- Reviews ---

test('admin can approve, hide, unhide, reply to and delete reviews', function () {
    $admin = adminContentAdmin();
    $review = CourseReview::factory()->create(['is_approved' => false, 'is_hidden' => false]);

    $this->actingAs($admin)->post("/admin/academy/reviews/{$review->id}/approve")->assertRedirect();
    expect($review->fresh()->is_approved)->toBeTrue();

    $this->actingAs($admin)->post("/admin/academy/reviews/{$review->id}/hide")->assertRedirect();
    expect($review->fresh()->is_hidden)->toBeTrue();

    $this->actingAs($admin)->post("/admin/academy/reviews/{$review->id}/unhide")->assertRedirect();
    expect($review->fresh()->is_hidden)->toBeFalse();

    $this->actingAs($admin)->post("/admin/academy/reviews/{$review->id}/reply", ['reply' => 'Thanks!'])->assertRedirect();
    expect($review->fresh()->reply)->toBe('Thanks!');

    $this->actingAs($admin)->delete("/admin/academy/reviews/{$review->id}")->assertRedirect();
    expect(CourseReview::query()->find($review->id))->toBeNull();
});

test('reviews index maps status, reply and real stats', function () {
    $admin = adminContentAdmin();
    CourseReview::factory()->create(['rating' => 5, 'is_approved' => true, 'reply' => 'Welcome!', 'created_at' => now()->subDay()]);
    CourseReview::factory()->create(['rating' => 3, 'is_approved' => false, 'created_at' => now()]);

    $this->actingAs($admin)->get('/admin/academy/reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Reviews/Index')
            ->has('reviews', 2)
            ->where('reviews.0.status', 'pending')
            ->where('reviews.1.status', 'approved')
            ->where('reviews.1.reply', 'Welcome!')
            ->where('stats.average', 4) // JSON serializes 4.0 as 4.
            ->where('stats.total', 2));
});

test('non-admin cannot moderate reviews', function () {
    $instructor = adminContentInstructor();
    $review = CourseReview::factory()->create(['is_approved' => false]);

    $this->actingAs($instructor)->post("/admin/academy/reviews/{$review->id}/approve")->assertForbidden();
    expect($review->fresh()->is_approved)->toBeFalse();
});

// --- Announcements ---

test('admin can create, publish, unpublish, update and delete course announcements', function () {
    $admin = adminContentAdmin();
    $course = Course::factory()->create();

    $this->actingAs($admin)->post('/admin/academy/announcements', [
        'course_id' => $course->id, 'title' => 'Live tonight', 'content' => 'Join us', 'publish' => true,
    ])->assertRedirect();
    $announcement = CourseAnnouncement::query()->where('title', 'Live tonight')->firstOrFail();
    expect($announcement->published_at)->not->toBeNull();

    $this->actingAs($admin)->post("/admin/academy/announcements/{$announcement->id}/unpublish")->assertRedirect();
    expect($announcement->fresh()->published_at)->toBeNull();

    $this->actingAs($admin)->post("/admin/academy/announcements/{$announcement->id}/publish")->assertRedirect();
    expect($announcement->fresh()->published_at)->not->toBeNull();

    $this->actingAs($admin)->put("/admin/academy/announcements/{$announcement->id}", [
        'course_id' => $course->id, 'title' => 'Live moved', 'content' => 'Tomorrow',
    ])->assertRedirect();
    expect($announcement->fresh()->title)->toBe('Live moved');

    $this->actingAs($admin)->delete("/admin/academy/announcements/{$announcement->id}")->assertRedirect();
    expect(CourseAnnouncement::query()->find($announcement->id))->toBeNull();
});

test('announcement create requires a course and stores drafts unpublished', function () {
    $admin = adminContentAdmin();
    $course = Course::factory()->create();

    $this->actingAs($admin)->post('/admin/academy/announcements', [
        'title' => 'No course', 'content' => 'x',
    ])->assertSessionHasErrors('course_id');

    $this->actingAs($admin)->post('/admin/academy/announcements', [
        'course_id' => $course->id, 'title' => 'Draft one', 'content' => 'Soon', 'publish' => false,
    ])->assertRedirect();
    $draft = CourseAnnouncement::query()->where('title', 'Draft one')->firstOrFail();
    expect($draft->published_at)->toBeNull();

    $this->actingAs($admin)->get('/admin/academy/announcements')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Announcements/Index')
            ->has('announcements', 1)
            ->where('announcements.0.draft', true)
            ->has('courses', 1));
});

// --- Categories ---

test('admin can manage categories with auto slugs and toggle', function () {
    $admin = adminContentAdmin();

    $this->actingAs($admin)->post('/admin/academy/categories', ['name' => 'Data Science'])->assertRedirect();
    $category = CourseCategory::query()->where('name', 'Data Science')->firstOrFail();
    expect($category->slug)->toBe('data-science')->and($category->is_active)->toBeTrue();

    $this->actingAs($admin)->post('/admin/academy/categories', ['name' => 'Data Science'])->assertRedirect();
    expect(CourseCategory::query()->where('slug', 'data-science-2')->exists())->toBeTrue();

    $this->actingAs($admin)->put("/admin/academy/categories/{$category->id}", ['name' => 'Data & AI'])->assertRedirect();
    expect($category->fresh()->name)->toBe('Data & AI');

    $this->actingAs($admin)->post("/admin/academy/categories/{$category->id}/toggle")->assertRedirect();
    expect($category->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->delete("/admin/academy/categories/{$category->id}")->assertRedirect();
    expect(CourseCategory::query()->find($category->id))->toBeNull();
});

test('category with courses cannot be deleted', function () {
    $admin = adminContentAdmin();
    $category = CourseCategory::factory()->create();
    Course::factory()->create(['category_id' => $category->id]);

    $this->actingAs($admin)->delete("/admin/academy/categories/{$category->id}")
        ->assertRedirect()
        ->assertSessionHasErrors('category');
    expect(CourseCategory::query()->find($category->id))->not->toBeNull();
});

// --- Instructors ---

test('admin can suspend and reactivate instructors', function () {
    $admin = adminContentAdmin();
    $instructor = adminContentInstructor();
    Course::factory()->create(['instructor_id' => $instructor->id]);

    $this->actingAs($admin)->get('/admin/academy/instructors')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Instructors/Index')
            ->has('instructors', 1)
            ->where('instructors.0.courses', 1)
            ->where('instructors.0.status', 'active'));

    $this->actingAs($admin)->post("/admin/academy/instructors/{$instructor->id}/suspend")->assertRedirect();
    expect($instructor->fresh()->status)->toBe('suspended');

    $this->actingAs($admin)->post("/admin/academy/instructors/{$instructor->id}/activate")->assertRedirect();
    expect($instructor->fresh()->status)->toBe('active');
});

test('suspending a non-instructor returns 404', function () {
    $admin = adminContentAdmin();
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);

    $this->actingAs($admin)->post("/admin/academy/instructors/{$student->id}/suspend")->assertNotFound();
});

// --- Tickets ---

test('admin can view a ticket thread, reply and change status', function () {
    $admin = adminContentAdmin();
    $student = User::factory()->create();
    $ticket = SupportTicket::query()->create(['client_id' => $student->id, 'subject' => 'Video broken', 'status' => 'open', 'priority' => 3]);
    SupportTicketMessage::query()->create(['ticket_id' => $ticket->id, 'user_id' => $student->id, 'message' => 'Lesson 3 will not play.']);

    $this->actingAs($admin)->get("/admin/academy/tickets/{$ticket->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Tickets/Index')
            ->has('tickets', 1)
            ->where('selectedTicket.subject', 'Video broken')
            ->where('selectedTicket.status', 'open')
            ->where('selectedTicket.priority', 'high')
            ->has('selectedTicket.messages', 1)
            ->where('selectedTicket.messages.0.message', 'Lesson 3 will not play.'));

    $this->actingAs($admin)->post("/admin/academy/tickets/{$ticket->id}/reply", [
        'message' => 'Looking into it.', 'is_internal' => true,
    ])->assertRedirect();
    $reply = SupportTicketMessage::query()->where('ticket_id', $ticket->id)->latest('id')->firstOrFail();
    expect($reply->message)->toBe('Looking into it.')
        ->and($reply->is_internal)->toBeTrue()
        ->and($reply->user_id)->toBe($admin->id)
        ->and($ticket->fresh()->status)->toBe('in_progress');

    $this->actingAs($admin)->post("/admin/academy/tickets/{$ticket->id}/status", ['status' => 'resolved'])->assertRedirect();
    expect($ticket->fresh()->status)->toBe('resolved');

    $this->actingAs($admin)->post("/admin/academy/tickets/{$ticket->id}/status", ['status' => 'bogus'])
        ->assertSessionHasErrors('status');
});

// --- Moderation ---

test('moderation lists only hidden or unapproved reviews', function () {
    $admin = adminContentAdmin();
    CourseReview::factory()->create(['is_approved' => true, 'is_hidden' => false, 'created_at' => now()->subDays(2)]);
    CourseReview::factory()->create(['is_approved' => false, 'is_hidden' => false, 'created_at' => now()->subDay()]);
    CourseReview::factory()->create(['is_approved' => true, 'is_hidden' => true, 'created_at' => now()]);

    $this->actingAs($admin)->get('/admin/academy/moderation')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Moderation/Index')
            ->has('reports', 2)
            ->where('reports.0.status', 'hidden')
            ->where('reports.1.status', 'pending'));
});

test('moderation approve, hide and remove act on the review', function () {
    $admin = adminContentAdmin();
    $review = CourseReview::factory()->create(['is_approved' => false, 'is_hidden' => false]);

    $this->actingAs($admin)->post("/admin/academy/moderation/{$review->id}/hide")->assertRedirect();
    expect($review->fresh()->is_hidden)->toBeTrue();

    $this->actingAs($admin)->post("/admin/academy/moderation/{$review->id}/approve")->assertRedirect();
    expect($review->fresh()->is_approved)->toBeTrue()->and($review->fresh()->is_hidden)->toBeFalse();

    $this->actingAs($admin)->delete("/admin/academy/moderation/{$review->id}")->assertRedirect();
    expect(CourseReview::query()->find($review->id))->toBeNull();
});

// --- Curriculum, modules, lessons ---

test('curriculum builder shows the selected course modules with lessons', function () {
    $admin = adminContentAdmin();
    $course = Course::factory()->create(['title' => 'Alpha Course']);
    $other = Course::factory()->create(['title' => 'Beta Course']);
    $module = CourseModule::factory()->create(['course_id' => $course->id, 'title' => 'Basics']);
    Lesson::factory()->create(['module_id' => $module->id, 'title' => 'Intro', 'video_url' => 'https://youtu.be/abc123']);
    CourseModule::factory()->create(['course_id' => $other->id, 'title' => 'Other module']);

    $this->actingAs($admin)->get("/admin/academy/curriculum?course={$course->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Curriculum/Index')
            ->has('courses', 2)
            ->where('courseId', $course->id)
            ->has('modules', 1)
            ->where('modules.0.title', 'Basics')
            ->has('modules.0.lessons', 1)
            ->where('modules.0.lessons.0.video', 'https://youtu.be/abc123'));
});

test('admin can manage modules and lessons including video urls', function () {
    $admin = adminContentAdmin();
    $course = Course::factory()->create();

    $this->actingAs($admin)->post('/admin/academy/modules', [
        'course_id' => $course->id, 'title' => 'New Module',
    ])->assertRedirect();
    $module = CourseModule::query()->where('title', 'New Module')->firstOrFail();
    expect($module->position)->toBe(1);

    $this->actingAs($admin)->put("/admin/academy/modules/{$module->id}", ['title' => 'Renamed Module'])->assertRedirect();
    expect($module->fresh()->title)->toBe('Renamed Module');

    $this->actingAs($admin)->post('/admin/academy/lessons', [
        'module_id' => $module->id, 'title' => 'New Lesson', 'type' => 'video',
        'duration' => 12, 'video_url' => 'https://youtu.be/xyz789', 'is_free' => true,
    ])->assertRedirect();
    $lesson = Lesson::query()->where('title', 'New Lesson')->firstOrFail();
    expect($lesson->video_url)->toBe('https://youtu.be/xyz789')->and($lesson->is_free)->toBeTrue();

    $this->actingAs($admin)->put("/admin/academy/lessons/{$lesson->id}", [
        'title' => 'New Lesson', 'type' => 'text', 'duration' => 10, 'video_url' => null,
    ])->assertRedirect();
    expect($lesson->fresh()->type)->toBe('text')->and($lesson->fresh()->video_url)->toBeNull();

    $this->actingAs($admin)->get('/admin/academy/modules')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Academy/Modules/Index')->has('modules', 1));
    $this->actingAs($admin)->get('/admin/academy/lessons')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Academy/Lessons/Index')->has('lessons', 1));

    $this->actingAs($admin)->delete("/admin/academy/lessons/{$lesson->id}")->assertRedirect();
    expect(Lesson::query()->find($lesson->id))->toBeNull();

    $this->actingAs($admin)->delete("/admin/academy/modules/{$module->id}")->assertRedirect();
    expect(CourseModule::query()->find($module->id))->toBeNull();
});

test('lesson store rejects bad module and bad type', function () {
    $admin = adminContentAdmin();

    $this->actingAs($admin)->post('/admin/academy/lessons', [
        'module_id' => 99999, 'title' => 'Orphan', 'type' => 'video',
    ])->assertSessionHasErrors('module_id');

    $module = CourseModule::factory()->create();
    $this->actingAs($admin)->post('/admin/academy/lessons', [
        'module_id' => $module->id, 'title' => 'Bad type', 'type' => 'live',
    ])->assertSessionHasErrors('type');
});

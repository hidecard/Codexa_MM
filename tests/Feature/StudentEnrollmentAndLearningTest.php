<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makePublishedCourse(string $slug = 'learn-laravel', string $pricing = 'free'): array
{
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.$slug, 'is_active' => true, 'position' => 1]);
    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $course = Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Learn Laravel',
        'slug' => $slug,
        'short_description' => 'Short',
        'description' => 'Desc',
        'price' => $pricing === 'free' ? 0 : 100000,
        'pricing_type' => $pricing,
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 5,
        'published_at' => now(),
    ]);
    $module = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Module 1', 'position' => 1]);
    $lesson1 = Lesson::query()->create(['module_id' => $module->id, 'title' => 'Intro', 'content' => 'Hello', 'duration' => 10, 'type' => 'video', 'is_free' => true, 'position' => 1, 'video_url' => 'private://video']);
    $lesson2 = Lesson::query()->create(['module_id' => $module->id, 'title' => 'Next', 'content' => 'More', 'duration' => 12, 'type' => 'video', 'is_free' => false, 'position' => 2, 'video_url' => 'private://video2']);

    return [$course, $lesson1, $lesson2];
}

test('a student can enroll in a free published course and duplicate enrollment is protected', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$course] = makePublishedCourse();
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');

    $this->actingAs($student)->post(route('student.courses.enroll', $course->slug))
        ->assertRedirect(route('student.courses.learn', $course->id));

    expect(Enrollment::query()->count())->toBe(1)
        ->and(Enrollment::first()->status)->toBe('active');

    $this->actingAs($student)->post(route('student.courses.enroll', $course->slug))
        ->assertRedirect(route('student.courses.learn', $course->id));

    expect(Enrollment::query()->count())->toBe(1);
});

test('student dashboard shows enrolled course progress and continue-learning', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$course, $lesson1] = makePublishedCourse('progress-course');
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');
    $enrollment = Enrollment::create(['student_id' => $student->id, 'course_id' => $course->id, 'status' => 'active', 'price_paid' => 0, 'enrolled_at' => now()]);
    LessonProgress::create(['enrollment_id' => $enrollment->id, 'lesson_id' => $lesson1->id, 'is_completed' => true, 'completed_at' => now(), 'watch_time' => 60]);

    $this->actingAs($student)->get(route('student.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
            ->where('stats.enrolled', 1)
            ->where('enrollments.0.progress', 50)
            ->where('enrollments.0.course.slug', 'progress-course')
            ->has('enrollments.0.continue_lesson'));
});

test('an enrolled student can view lessons and mark completion with durable progress', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$course, $lesson1, $lesson2] = makePublishedCourse('complete-course');
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');
    Enrollment::create(['student_id' => $student->id, 'course_id' => $course->id, 'status' => 'active', 'price_paid' => 0, 'enrolled_at' => now()]);

    $this->actingAs($student)->get(route('student.courses.learn', $course->id))->assertOk();
    $this->actingAs($student)->get(route('student.courses.lesson', [$course->id, $lesson1->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Student/Course/Lesson')->where('lesson.id', $lesson1->id));

    $this->actingAs($student)->post(route('student.courses.lesson.complete', [$course->id, $lesson1->id]), ['watch_time' => 120])
        ->assertRedirect();

    expect(LessonProgress::query()->where('lesson_id', $lesson1->id)->where('is_completed', true)->exists())->toBeTrue();
});

test('lesson access is forbidden without an active enrollment', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$course, $lesson1] = makePublishedCourse('forbidden-course');
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');

    $this->actingAs($student)->get(route('student.courses.lesson', [$course->id, $lesson1->id]))->assertForbidden();
});

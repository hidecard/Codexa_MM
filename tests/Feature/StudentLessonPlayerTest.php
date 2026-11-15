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
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('student lesson exposes authorized stream url and progress resume can be saved', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-video', 'is_active' => true, 'position' => 1]);
    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $course = Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Video Course',
        'slug' => 'video-course',
        'short_description' => 'Short',
        'description' => 'Desc',
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
        'published_at' => now(),
    ]);
    $module = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Module 1', 'position' => 1]);
    Storage::disk('local')->put('lessons/video.mp4', 'video');
    $lesson = Lesson::query()->create(['module_id' => $module->id, 'title' => 'Video', 'content' => 'Hello', 'duration' => 10, 'type' => 'video', 'is_free' => true, 'position' => 1, 'video_url' => 'lessons/video.mp4', 'meta' => ['captions' => [['src' => '/captions.vtt', 'label' => 'English', 'srclang' => 'en']]]]);
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');
    Enrollment::create(['student_id' => $student->id, 'course_id' => $course->id, 'status' => 'active', 'price_paid' => 0, 'enrolled_at' => now()]);

    $this->actingAs($student)->post(route('student.courses.lesson.progress', [$course->id, $lesson->id]), ['position' => 42, 'watch_time' => 42])->assertNoContent();
    expect((float) data_get(LessonProgress::first()->meta, 'position'))->toBe(42.0);

    $response = $this->actingAs($student)->get(route('student.courses.lesson', [$course->id, $lesson->id]))->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Student/Course/Lesson')
        ->where('lesson.resume_position', 42)
        ->has('lesson.stream_url')
        ->where('lesson.captions.0.label', 'English'));

    $streamUrl = $response->viewData('page')['props']['lesson']['stream_url'];
    $this->actingAs($student)->get($streamUrl)->assertOk();
    $this->actingAs($student)->get(route('student.courses.lesson.stream', [$course->id, $lesson->id]))->assertForbidden();
});

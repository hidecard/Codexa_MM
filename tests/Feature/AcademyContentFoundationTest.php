<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('seeded courses expose lesson curriculum, announcements, approved reviews, and co-instructors', function () {
    $this->seed();
    $course = Course::query()->where('slug', 'full-stack-web-development')->firstOrFail();

    expect($course->instructors()->count())->toBe(1);

    $this->get('/courses/'.$course->slug)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Courses/Show')
            ->has('course.modules', 3)
            ->has('course.modules.0.lessons', 1)
            ->where('course.modules.0.lessons.0.is_free', true)
            ->has('course.announcements', 1)
            ->has('course.reviews', 1)
            ->where('course.reviews.0.rating', 5)
            ->has('course.instructors', 1));
});

test('lesson and resource serialization never exposes private delivery paths', function () {
    $this->seed();
    $lesson = Lesson::query()->with('resources')->firstOrFail();
    $resource = LessonResource::query()->firstOrFail();

    expect($lesson->toArray())->not->toHaveKey('video_url')
        ->and($lesson->toArray())->not->toHaveKey('meta')
        ->and($resource->toArray())->not->toHaveKey('file_path');
});

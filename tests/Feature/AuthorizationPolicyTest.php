<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

function makeCourseFor(User $instructor): Course
{
    $category = CourseCategory::query()->create([
        'name' => 'Web',
        'slug' => 'web-' . uniqid(),
        'is_active' => true,
        'position' => 1,
    ]);

    return Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Test Course',
        'slug' => 'test-course-' . uniqid(),
        'status' => 'draft',
    ]);
}

test('portal gates allow only the matching role', function () {
    $this->seed();

    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');

    expect(Gate::forUser($admin)->allows('access-admin-portal'))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('access-student-portal'))->toBeFalse()
        ->and(Gate::forUser($student)->allows('access-student-portal'))->toBeTrue()
        ->and(Gate::forUser($student)->allows('access-admin-portal'))->toBeFalse();
});

test('course policy allows instructors to manage only their own courses', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $other = User::factory()->create(['status' => 'active']);
    $other->assignRole('instructor');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $own = makeCourseFor($instructor);
    $foreign = makeCourseFor($other);

    expect($instructor->can('update', $own))->toBeTrue()
        ->and($instructor->can('update', $foreign))->toBeFalse()
        ->and($instructor->can('delete', $foreign))->toBeFalse()
        ->and($admin->can('update', $foreign))->toBeTrue()
        ->and($admin->can('delete', $foreign))->toBeTrue();
});

test('course policy denies create and update to students', function () {
    $this->seed();

    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $course = makeCourseFor($instructor);

    expect($student->can('create', Course::class))->toBeFalse()
        ->and($student->can('update', $course))->toBeFalse();
});

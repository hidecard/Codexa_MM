<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function instructorUser(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('instructor');
    return $user;
}

function category(): CourseCategory
{
    return CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);
}

test('instructor can create and update own course and manage curriculum', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    $instructor = instructorUser();
    $cat = category();

    $this->actingAs($instructor)->post(route('instructor.courses.store'), [
        'category_id' => $cat->id,
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
    ])->assertRedirect();

    $course = Course::query()->where('title', 'My Course')->firstOrFail();
    expect($course->instructor_id)->toBe($instructor->id)->and($course->slug)->toBe('my-course');

    $this->actingAs($instructor)->put(route('instructor.courses.update', $course), [
        'category_id' => $cat->id,
        'title' => 'My Course Updated',
        'slug' => 'my-course',
        'short_description' => 'Short',
        'description' => 'Desc',
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 5,
    ])->assertRedirect();
    expect($course->fresh()->title)->toBe('My Course Updated');

    $this->actingAs($instructor)->post(route('instructor.courses.modules.store', $course), ['title' => 'Module 1', 'position' => 1])->assertRedirect();
    $module = CourseModule::query()->where('course_id', $course->id)->firstOrFail();
    $this->actingAs($instructor)->post(route('instructor.courses.modules.lessons.store', [$course, $module]), ['title' => 'Lesson 1', 'type' => 'video', 'duration' => 10, 'position' => 1])->assertRedirect();
    expect(Lesson::query()->where('module_id', $module->id)->count())->toBe(1);
});

test('instructor cannot update or delete courses they do not own or are not assigned to', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    $owner = instructorUser();
    $other = instructorUser();
    $cat = category();
    $course = Course::query()->create([
        'category_id' => $cat->id,
        'instructor_id' => $owner->id,
        'title' => 'Owner Course',
        'slug' => 'owner-course',
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
    ]);

    $this->actingAs($other)->put(route('instructor.courses.update', $course), [
        'category_id' => $cat->id,
        'title' => 'Hacked',
        'slug' => 'owner-course',
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
    ])->assertForbidden();

    $this->actingAs($other)->delete(route('instructor.courses.destroy', $course))->assertForbidden();
});

test('assigned co-instructor can update but not delete per permissions and policy', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    $owner = instructorUser();
    $assigned = instructorUser();
    $cat = category();
    $course = Course::query()->create([
        'category_id' => $cat->id,
        'instructor_id' => $owner->id,
        'title' => 'Shared',
        'slug' => 'shared-'.uniqid(),
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
    ]);
    $course->instructors()->attach($assigned->id);

    $this->actingAs($assigned)->put(route('instructor.courses.update', $course), [
        'category_id' => $cat->id,
        'title' => 'Shared Updated',
        'slug' => $course->slug,
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'draft',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
    ])->assertRedirect();
    expect($course->fresh()->title)->toBe('Shared Updated');

    $this->actingAs($assigned)->delete(route('instructor.courses.destroy', $course))->assertForbidden();
});

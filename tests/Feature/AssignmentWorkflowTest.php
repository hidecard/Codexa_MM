<?php

use App\Models\Assignment;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use App\Models\Submission;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupCourseWithInstructor(): array
{
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);
    $instructor = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $instructor->assignRole('instructor');
    $course = Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Course',
        'slug' => 'course-'.uniqid(),
        'price' => 0,
        'pricing_type' => 'free',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
        'published_at' => now(),
    ]);

    return [$instructor, $course];
}

test('instructor can create assignment and grade enrolled student submission with ownership enforced', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$instructor, $course] = setupCourseWithInstructor();
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');
    Enrollment::create(['student_id' => $student->id, 'course_id' => $course->id, 'status' => 'active', 'price_paid' => 0, 'enrolled_at' => now()]);

    $this->actingAs($instructor)->post(route('instructor.assignments.store'), [
        'course_id' => $course->id,
        'title' => 'Project',
        'instructions' => 'Build it',
        'max_score' => 100,
        'due_at' => now()->addDay()->toDateTimeString(),
        'allow_late_submission' => false,
    ])->assertRedirect();

    $assignment = Assignment::firstOrFail();
    $this->actingAs($student)->post(route('student.assignments.submit', $assignment), ['content' => 'My work'])->assertRedirect();
    $submission = Submission::firstOrFail();
    expect($submission->status)->toBe('submitted');

    $this->actingAs($instructor)->post(route('instructor.assignments.submissions.grade', [$assignment, $submission]), [
        'score' => 85,
        'feedback' => 'Good job',
        'status' => 'graded',
    ])->assertRedirect();

    expect($submission->fresh()->status)->toBe('graded')->and((float) $submission->fresh()->grade->score)->toBe(85.0);

    $otherInstructor = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $otherInstructor->assignRole('instructor');
    $this->actingAs($otherInstructor)->post(route('instructor.assignments.submissions.grade', [$assignment, $submission]), [
        'score' => 10,
        'feedback' => 'no',
        'status' => 'graded',
    ])->assertForbidden();
});

test('late submission is rejected when not allowed and student cannot submit after graded', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [, $course] = setupCourseWithInstructor();
    $student = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $student->assignRole('student');
    Enrollment::create(['student_id' => $student->id, 'course_id' => $course->id, 'status' => 'active', 'price_paid' => 0, 'enrolled_at' => now()]);
    $assignment = Assignment::create([
        'course_id' => $course->id,
        'title' => 'Due',
        'instructions' => 'x',
        'max_score' => 100,
        'due_at' => now()->subDay(),
        'allow_late_submission' => false,
    ]);

    $this->actingAs($student)->from(route('student.assignments.show', $assignment))
        ->post(route('student.assignments.submit', $assignment), ['content' => 'late'])
        ->assertRedirect(route('student.assignments.show', $assignment))
        ->assertSessionHasErrors('submission');
    expect(Submission::count())->toBe(0);

    $assignment->update(['allow_late_submission' => true, 'due_at' => now()->subDay()]);
    $this->actingAs($student)->post(route('student.assignments.submit', $assignment), ['content' => 'late ok'])->assertRedirect();
    $submission = Submission::firstOrFail();
    $submission->update(['status' => 'graded']);
    $this->actingAs($student)->from(route('student.assignments.show', $assignment))
        ->post(route('student.assignments.submit', $assignment), ['content' => 'change'])
        ->assertSessionHasErrors('submission');
});

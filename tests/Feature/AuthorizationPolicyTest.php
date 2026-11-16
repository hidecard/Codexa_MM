<?php

use App\Models\Assignment;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

function makeCourseFor(User $instructor): Course
{
    $category = CourseCategory::query()->create([
        'name' => 'Web',
        'slug' => 'web-'.uniqid(),
        'is_active' => true,
        'position' => 1,
    ]);

    return Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Test Course',
        'slug' => 'test-course-'.uniqid(),
        'status' => 'published',
    ]);
}

function makeAssignmentFor(Course $course): Assignment
{
    return Assignment::query()->create([
        'course_id' => $course->id,
        'title' => 'Test Assignment',
        'instructions' => 'Do this assignment',
        'max_score' => 100,
    ]);
}

function makeSubmissionFor(Assignment $assignment, User $student): Submission
{
    return Submission::query()->create([
        'assignment_id' => $assignment->id,
        'student_id' => $student->id,
        'content' => 'My submission',
        'status' => 'submitted',
        'submitted_at' => now(),
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
    $coInstructor = User::factory()->create(['status' => 'active']);
    $coInstructor->assignRole('instructor');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $own = makeCourseFor($instructor);
    $foreign = makeCourseFor($other);
    $foreign->instructors()->attach($coInstructor->id);

    expect($instructor->can('update', $own))->toBeTrue()
        ->and($instructor->can('update', $foreign))->toBeFalse()
        ->and($coInstructor->can('update', $foreign))->toBeTrue()
        ->and($coInstructor->can('delete', $foreign))->toBeFalse()
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

test('assignment policy allows students to view assignments for enrolled courses only', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $otherInstructor = User::factory()->create(['status' => 'active']);
    $otherInstructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $otherStudent = User::factory()->create(['status' => 'active']);
    $otherStudent->assignRole('student');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $course = makeCourseFor($instructor);
    $otherCourse = makeCourseFor($otherInstructor);
    $assignment = makeAssignmentFor($course);
    $otherAssignment = makeAssignmentFor($otherCourse);

    // Enroll student in course
    Enrollment::query()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    // Enroll otherStudent in otherCourse
    Enrollment::query()->create([
        'student_id' => $otherStudent->id,
        'course_id' => $otherCourse->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    // Student can view assignment in enrolled course
    expect($student->can('view', $assignment))->toBeTrue();
    // Student cannot view assignment in non-enrolled course
    expect($student->can('view', $otherAssignment))->toBeFalse();
    // Other student cannot view assignment in course they're not enrolled in
    expect($otherStudent->can('view', $assignment))->toBeFalse();
    // Instructor can view their own course assignment
    expect($instructor->can('view', $assignment))->toBeTrue();
    // Instructor cannot view other instructor's assignment
    expect($instructor->can('view', $otherAssignment))->toBeFalse();
    // Admin can view all
    expect($admin->can('view', $assignment))->toBeTrue()
        ->and($admin->can('view', $otherAssignment))->toBeTrue();
});

test('assignment policy allows instructors to create and update assignments for their courses only', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $otherInstructor = User::factory()->create(['status' => 'active']);
    $otherInstructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $course = makeCourseFor($instructor);
    $otherCourse = makeCourseFor($otherInstructor);

    // Instructor can create assignment for own course
    expect($instructor->can('create', Assignment::class))->toBeTrue();
    // Student cannot create
    expect($student->can('create', Assignment::class))->toBeFalse();
    // Admin can create
    expect($admin->can('create', Assignment::class))->toBeTrue();

    $assignment = makeAssignmentFor($course);
    $otherAssignment = makeAssignmentFor($otherCourse);

    // Instructor can update own assignment
    expect($instructor->can('update', $assignment))->toBeTrue();
    // Instructor cannot update other instructor's assignment
    expect($instructor->can('update', $otherAssignment))->toBeFalse();
    // Admin can update all
    expect($admin->can('update', $otherAssignment))->toBeTrue();
    // Student cannot update
    expect($student->can('update', $assignment))->toBeFalse();
});

test('submission policy allows students to view only their own submissions', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $otherStudent = User::factory()->create(['status' => 'active']);
    $otherStudent->assignRole('student');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $course = makeCourseFor($instructor);
    $assignment = makeAssignmentFor($course);
    $submission = makeSubmissionFor($assignment, $student);
    $otherSubmission = makeSubmissionFor($assignment, $otherStudent);

    // Student can view own submission
    expect($student->can('view', $submission))->toBeTrue();
    // Student cannot view other student's submission
    expect($student->can('view', $otherSubmission))->toBeFalse();
    // Instructor can view submissions for their course
    expect($instructor->can('view', $submission))->toBeTrue()
        ->and($instructor->can('view', $otherSubmission))->toBeTrue();
    // Admin can view all
    expect($admin->can('view', $submission))->toBeTrue()
        ->and($admin->can('view', $otherSubmission))->toBeTrue();
});

test('submission policy allows students to submit only their own submissions', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $otherStudent = User::factory()->create(['status' => 'active']);
    $otherStudent->assignRole('student');

    $course = makeCourseFor($instructor);
    $assignment = makeAssignmentFor($course);
    $submission = makeSubmissionFor($assignment, $student);
    $otherSubmission = makeSubmissionFor($assignment, $otherStudent);

    // Student can submit their own
    expect($student->can('submit', $submission))->toBeTrue();
    // Student cannot submit other student's
    expect($student->can('submit', $otherSubmission))->toBeFalse();
    // Instructor cannot submit
    expect($instructor->can('submit', $submission))->toBeFalse();
});

test('submission policy allows instructors to grade submissions for their courses only', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $otherInstructor = User::factory()->create(['status' => 'active']);
    $otherInstructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    $course = makeCourseFor($instructor);
    $otherCourse = makeCourseFor($otherInstructor);
    $assignment = makeAssignmentFor($course);
    $otherAssignment = makeAssignmentFor($otherCourse);
    $submission = makeSubmissionFor($assignment, $student);
    $otherSubmission = makeSubmissionFor($otherAssignment, $student);

    // Instructor can grade submissions for their course
    expect($instructor->can('grade', $submission))->toBeTrue();
    // Instructor cannot grade submissions for other instructor's course
    expect($instructor->can('grade', $otherSubmission))->toBeFalse();
    // Admin can grade all
    expect($admin->can('grade', $submission))->toBeTrue()
        ->and($admin->can('grade', $otherSubmission))->toBeTrue();
    // Student cannot grade
    expect($student->can('grade', $submission))->toBeFalse();
});

test('quiz policy scopes student attempts and instructor management to the course', function () {
    $this->seed();

    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');
    $otherInstructor = User::factory()->create(['status' => 'active']);
    $otherInstructor->assignRole('instructor');
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');
    $otherStudent = User::factory()->create(['status' => 'active']);
    $otherStudent->assignRole('student');

    $course = makeCourseFor($instructor);
    $otherCourse = makeCourseFor($otherInstructor);
    $quiz = Quiz::query()->create(['course_id' => $course->id, 'title' => 'Owned quiz', 'pass_mark' => 70]);
    $otherQuiz = Quiz::query()->create(['course_id' => $otherCourse->id, 'title' => 'Foreign quiz', 'pass_mark' => 70]);

    Enrollment::query()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    expect($student->can('attempt', $quiz))->toBeTrue()
        ->and($otherStudent->can('attempt', $quiz))->toBeFalse()
        ->and($instructor->can('update', $quiz))->toBeTrue()
        ->and($instructor->can('update', $otherQuiz))->toBeFalse()
        ->and($otherInstructor->can('view', $quiz))->toBeFalse();
});

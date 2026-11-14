<?php

use App\Http\Controllers\Instructor\AssignmentController as InstructorAssignmentController;
use App\Http\Controllers\Instructor\CourseController as InstructorCourseController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\CertificateController as StudentCertificateController;
use App\Http\Controllers\Student\CourseLearnController;
use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\NotificationController as StudentNotificationController;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/my-courses', function () {
        $enrollments = Enrollment::query()
            ->with(['course.category'])
            ->where('student_id', request()->user()->id)
            ->latest('enrolled_at')
            ->get()
            ->map(fn (Enrollment $e) => [
                'id' => $e->id,
                'status' => $e->status,
                'enrolled_at' => optional($e->enrolled_at)?->toDateString(),
                'course' => [
                    'id' => $e->course->id,
                    'title' => $e->course->title,
                    'slug' => $e->course->slug,
                    'category' => $e->course->category?->name,
                ],
            ])->values();

        return Inertia::render('Student/MyCourses', ['enrollments' => $enrollments]);
    })->name('my-courses');

    Route::post('/courses/{course:slug}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');

    Route::get('/courses/{course}/learn', [CourseLearnController::class, 'show'])->name('courses.learn');
    Route::get('/courses/{course}/lessons/{lesson}', [CourseLearnController::class, 'lesson'])->name('courses.lesson');
    Route::post('/courses/{course}/lessons/{lesson}/progress', [CourseLearnController::class, 'progress'])->name('courses.lesson.progress');
    Route::post('/courses/{course}/lessons/{lesson}/complete', [CourseLearnController::class, 'complete'])->name('courses.lesson.complete');
    Route::get('/courses/{course}/lessons/{lesson}/stream', [CourseLearnController::class, 'stream'])
        ->middleware('signed')
        ->name('courses.lesson.stream');

    Route::get('/assignments', [StudentAssignmentController::class, 'index'])->name('assignments.index');
    Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');

    Route::get('/submissions', function () {
        return redirect()->route('student.assignments.index');
    })->name('submissions.index');

    Route::get('/quizzes', function () {
        return Inertia::render('Student/Quizzes/Index');
    })->name('quizzes.index');

    Route::get('/certificates', [StudentCertificateController::class, 'index'])->name('certificates.index');

    Route::get('/notifications', [StudentNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [StudentNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [StudentNotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('/payments', function () {
        return Inertia::render('Student/Payments/Index');
    })->name('payments.index');

    Route::get('/wishlist', function () {
        return Inertia::render('Student/Wishlist');
    })->name('wishlist');

    Route::get('/reviews', function () {
        return Inertia::render('Student/Reviews/Index');
    })->name('reviews.index');

    Route::get('/profile', function () {
        return Inertia::render('Student/Profile');
    })->name('profile');
});

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Instructor/Dashboard');
    })->name('dashboard');

    Route::get('/courses', [InstructorCourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/create', [InstructorCourseController::class, 'create'])->name('courses.create');
    Route::post('/courses', [InstructorCourseController::class, 'store'])->name('courses.store');
    Route::get('/courses/{course}/edit', [InstructorCourseController::class, 'edit'])->name('courses.edit');
    Route::put('/courses/{course}', [InstructorCourseController::class, 'update'])->name('courses.update');
    Route::delete('/courses/{course}', [InstructorCourseController::class, 'destroy'])->name('courses.destroy');

    Route::post('/courses/{course}/modules', [InstructorCourseController::class, 'storeModule'])->name('courses.modules.store');
    Route::put('/courses/{course}/modules/{module}', [InstructorCourseController::class, 'updateModule'])->name('courses.modules.update');
    Route::delete('/courses/{course}/modules/{module}', [InstructorCourseController::class, 'destroyModule'])->name('courses.modules.destroy');
    Route::post('/courses/{course}/modules/{module}/lessons', [InstructorCourseController::class, 'storeLesson'])->name('courses.modules.lessons.store');
    Route::put('/courses/{course}/modules/{module}/lessons/{lesson}', [InstructorCourseController::class, 'updateLesson'])->name('courses.modules.lessons.update');
    Route::delete('/courses/{course}/modules/{module}/lessons/{lesson}', [InstructorCourseController::class, 'destroyLesson'])->name('courses.modules.lessons.destroy');

    Route::get('/curriculum', fn () => redirect()->route('instructor.courses.index'))->name('curriculum.index');
    Route::get('/lessons', fn () => redirect()->route('instructor.courses.index'))->name('lessons.index');
    Route::get('/resources', fn () => redirect()->route('instructor.courses.index'))->name('resources.index');

    Route::get('/students', function () {
        return Inertia::render('Instructor/Students/Index');
    })->name('students.index');

    Route::get('/assignments', [InstructorAssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments', [InstructorAssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/assignments/{assignment}', [InstructorAssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submissions/{submission}/grade', [InstructorAssignmentController::class, 'grade'])->name('assignments.submissions.grade');

    Route::get('/submissions', fn () => redirect()->route('instructor.assignments.index'))->name('submissions.index');
    Route::get('/grading', fn () => redirect()->route('instructor.assignments.index'))->name('grading.index');

    Route::get('/announcements', function () {
        return Inertia::render('Instructor/Announcements/Index');
    })->name('announcements.index');

    Route::get('/reviews', function () {
        return Inertia::render('Instructor/Reviews/Index');
    })->name('reviews.index');

    Route::get('/profile', function () {
        return Inertia::render('Instructor/Profile');
    })->name('profile');
});
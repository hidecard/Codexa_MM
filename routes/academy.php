<?php

use App\Http\Controllers\Instructor\AssignmentController as InstructorAssignmentController;
use App\Http\Controllers\Instructor\CourseController as InstructorCourseController;
use App\Http\Controllers\Instructor\DashboardController as InstructorDashboardController;
use App\Http\Controllers\Instructor\PayoutController as InstructorPayoutController;
use App\Http\Controllers\Instructor\StudentController as InstructorStudentController;
use App\Http\Controllers\Student\AchievementController as StudentAchievementController;
use App\Http\Controllers\Student\AnnouncementController;
use App\Http\Controllers\Student\LeaderboardController as StudentLeaderboardController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\CertificateController as StudentCertificateController;
use App\Http\Controllers\Student\CommunityPostController as StudentCommunityPostController;
use App\Http\Controllers\Student\CourseLearnController;
use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\HelpController as StudentHelpController;
use App\Http\Controllers\Student\LearningPathController as StudentLearningPathController;
use App\Http\Controllers\Student\MessageController as StudentMessageController;
use App\Http\Controllers\Student\MyCoursesController;
use App\Http\Controllers\Student\NotificationController as StudentNotificationController;
use App\Http\Controllers\Student\PaymentController as StudentPaymentController;
use App\Http\Controllers\Student\ProgressController as StudentProgressController;
use App\Http\Controllers\Student\QuizController;
use App\Http\Controllers\Student\ResourceController as StudentResourceController;
use App\Http\Controllers\Student\ProfileController;
use App\Http\Controllers\Student\ReviewController;
use App\Http\Controllers\Student\ScheduleController as StudentScheduleController;
use App\Http\Controllers\Student\SearchController;
use App\Http\Controllers\Student\SubmissionController;
use App\Http\Controllers\Student\WishlistController as StudentWishlistController;
use App\Models\Quiz;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/my-courses', [MyCoursesController::class, 'index'])->name('my-courses');

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

    Route::get('/submissions', [SubmissionController::class, 'index'])->name('submissions.index');

    Route::get('/quizzes', function () {
        $studentId = request()->user()->id;
        $quizzes = Quiz::query()
            ->with('course:id,title')
            ->withCount('questions')
            ->whereHas('course.enrollments', fn ($query) => $query
                ->where('student_id', $studentId)
                ->whereIn('status', ['active', 'completed']))
            ->latest()
            ->get()
            ->map(fn (Quiz $quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'pass_mark' => $quiz->pass_mark,
                'time_limit' => $quiz->time_limit,
                'questions_count' => $quiz->questions_count,
                'course' => $quiz->course ? [
                    'id' => $quiz->course->id,
                    'title' => $quiz->course->title,
                ] : null,
            ])->values();

        return Inertia::render('Student/Quizzes/Index', ['quizzes' => $quizzes]);
    })->name('quizzes.index');

    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::post('/quizzes/{quiz}/start', [QuizController::class, 'start'])->name('quizzes.start');
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');
    Route::get('/quizzes/{quiz}/results/{attempt}', [QuizController::class, 'results'])->name('quizzes.results');

    Route::get('/certificates', [StudentCertificateController::class, 'index'])->name('certificates.index');

    Route::get('/notifications', [StudentNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [StudentNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [StudentNotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('/payments', [StudentPaymentController::class, 'index'])->name('payments.index');

    Route::get('/wishlist', [StudentWishlistController::class, 'index'])->name('wishlist');
    Route::post('/wishlist/{course}', [StudentWishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{course}', [StudentWishlistController::class, 'destroy'])->name('wishlist.destroy');

    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');

    Route::get('/profile', [ProfileController::class])->name('profile');

    Route::get('/certificates/{certificate}', [StudentCertificateController::class, 'show'])->name('certificates.show');
    Route::get('/certificates/{certificate}/print', [StudentCertificateController::class, 'print'])->name('certificates.print');

    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');

    // Live classes, notes, cart, checkout, orders and refunds are served by
    // controller routes in routes/admin_ops.php and routes/academy_writes.php
    // (loaded before this file).
    Route::get('/community', [StudentCommunityPostController::class, 'index'])->name('community.index');
    Route::get('/community/{post}', [StudentCommunityPostController::class, 'show'])->name('community.show');
    Route::get('/leaderboard', [StudentLeaderboardController::class, 'index'])->name('leaderboard.index');
    Route::get('/paths', [StudentLearningPathController::class, 'index'])->name('paths.index');
    Route::get('/paths/{path}', [StudentLearningPathController::class, 'show'])->name('paths.show');
    Route::post('/paths/{path}/follow', [StudentLearningPathController::class, 'toggleFollow'])->name('paths.follow');
    Route::get('/resources', [StudentResourceController::class, 'index'])->name('resources.index');
    Route::get('/resources/{resource}/download', [StudentResourceController::class, 'download'])->name('resources.download');
    Route::get('/achievements', [StudentAchievementController::class, 'index'])->name('achievements.index');
    Route::get('/messages', [StudentMessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [StudentMessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/{user}/read', [StudentMessageController::class, 'markRead'])->name('messages.read');
    Route::get('/schedule', [StudentScheduleController::class, 'index'])->name('schedule.index');
    Route::get('/progress', [StudentProgressController::class, 'index'])->name('progress.index');
    Route::get('/help', [StudentHelpController::class, 'index'])->name('help.index');
    Route::get('/payment-methods', fn () => Inertia::render('Student/PaymentMethods/Index'))->name('payment-methods.index');
    Route::get('/membership', fn () => Inertia::render('Student/Membership/Index'))->name('membership.index');
    Route::get('/security', fn () => Inertia::render('Student/Security/Index'))->name('security.index');
    Route::get('/challenges', fn () => Inertia::render('Student/Challenges/Index'))->name('challenges.index');
    Route::get('/events', fn () => Inertia::render('Student/Events/Index'))->name('events.index');
    Route::get('/mentors', fn () => Inertia::render('Student/Mentors/Index'))->name('mentors.index');
    Route::get('/referrals', fn () => Inertia::render('Student/Referrals/Index'))->name('referrals.index');
    Route::get('/search', [SearchController::class])->name('search.index');
    Route::get('/study-groups', fn () => Inertia::render('Student/StudyGroups/Index'))->name('study-groups.index');
    Route::get('/gift-cards', fn () => Inertia::render('Student/GiftCards/Index'))->name('gift-cards.index');
    Route::get('/whats-new', fn () => Inertia::render('Student/WhatsNew/Index'))->name('whats-new.index');
    Route::get('/onboarding', fn () => Inertia::render('Student/Onboarding/Index'))->name('onboarding.index');
});

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', InstructorDashboardController::class)->name('dashboard');

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
    Route::post('/courses/{course}/modules/{module}/lessons/{lesson}/resources', [InstructorCourseController::class, 'storeLessonResource'])->name('courses.modules.lessons.resources.store');
    Route::delete('/courses/{course}/modules/{module}/lessons/{lesson}/resources/{resource}', [InstructorCourseController::class, 'destroyLessonResource'])->name('courses.modules.lessons.resources.destroy');

    Route::get('/curriculum', fn () => redirect()->route('instructor.courses.index'))->name('curriculum.index');
    Route::get('/lessons', fn () => redirect()->route('instructor.courses.index'))->name('lessons.index');
    Route::get('/resources', fn () => redirect()->route('instructor.courses.index'))->name('resources.index');

    Route::get('/students', [InstructorStudentController::class, 'index'])->name('students.index');

    Route::get('/assignments', [InstructorAssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments', [InstructorAssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/assignments/{assignment}', [InstructorAssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submissions/{submission}/grade', [InstructorAssignmentController::class, 'grade'])->name('assignments.submissions.grade');

    Route::get('/quizzes', [App\Http\Controllers\Instructor\QuizController::class, 'index'])->name('quizzes.index');
    Route::get('/quizzes/create', [App\Http\Controllers\Instructor\QuizController::class, 'create'])->name('quizzes.create');
    Route::post('/quizzes', [App\Http\Controllers\Instructor\QuizController::class, 'store'])->name('quizzes.store');
    Route::get('/quizzes/{quiz}', [App\Http\Controllers\Instructor\QuizController::class, 'show'])->name('quizzes.show');
    Route::put('/quizzes/{quiz}', [App\Http\Controllers\Instructor\QuizController::class, 'update'])->name('quizzes.update');
    Route::delete('/quizzes/{quiz}', [App\Http\Controllers\Instructor\QuizController::class, 'destroy'])->name('quizzes.destroy');
    Route::get('/quizzes/{quiz}/results', [App\Http\Controllers\Instructor\QuizController::class, 'results'])->name('quizzes.results');
    Route::get('/quizzes/{quiz}/attempts/{attempt}', [App\Http\Controllers\Instructor\QuizController::class, 'attemptDetail'])->name('quizzes.attempts.show');

    Route::get('/submissions', fn () => redirect()->route('instructor.assignments.index'))->name('submissions.index');
    Route::get('/grading', fn () => redirect()->route('instructor.assignments.index'))->name('grading.index');

    // Announcements, reviews, profile, earnings, Q&A and live-host are
    // served by controller routes in routes/academy_writes.php and
    // routes/admin_ops.php (loaded before this file).

    Route::get('/earnings/{course}', [InstructorPayoutController::class, 'show'])->name('earnings.show');
});

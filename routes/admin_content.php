<?php

// Admin Academy content & people writes: reviews, announcements,
// categories, instructors, tickets, moderation, curriculum. Loaded before
// routes/admin.php; the duplicate closure sample-data routes there were
// removed at integration.

use App\Http\Controllers\Admin\Academy\AnnouncementController as AcademyAnnouncementController;
use App\Http\Controllers\Admin\Academy\CategoryController as AcademyCategoryController;
use App\Http\Controllers\Admin\Academy\InstructorController as AcademyInstructorController;
use App\Http\Controllers\Admin\Academy\LessonController as AcademyLessonController;
use App\Http\Controllers\Admin\Academy\ModerationController as AcademyModerationController;
use App\Http\Controllers\Admin\Academy\ModuleController as AcademyModuleController;
use App\Http\Controllers\Admin\Academy\ReviewController as AcademyReviewController;
use App\Http\Controllers\Admin\Academy\TicketController as AcademyTicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('academy')->name('academy.')->group(function () {
        // Reviews
        Route::post('/reviews/{review}/approve', [AcademyReviewController::class, 'approve'])->name('reviews.approve');
        Route::post('/reviews/{review}/hide', [AcademyReviewController::class, 'hide'])->name('reviews.hide');
        Route::post('/reviews/{review}/unhide', [AcademyReviewController::class, 'unhide'])->name('reviews.unhide');
        Route::post('/reviews/{review}/reply', [AcademyReviewController::class, 'reply'])->name('reviews.reply');
        Route::delete('/reviews/{review}', [AcademyReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::post('/review-reports/{report}/resolve', [AcademyReviewController::class, 'resolveReport'])->name('review-reports.resolve');
        Route::post('/review-reports/{report}/dismiss', [AcademyReviewController::class, 'dismissReport'])->name('review-reports.dismiss');

        // Announcements (course-scoped: course_id is NOT NULL on the model)
        Route::post('/announcements', [AcademyAnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('/announcements/{announcement}', [AcademyAnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/announcements/{announcement}', [AcademyAnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::post('/announcements/{announcement}/publish', [AcademyAnnouncementController::class, 'publish'])->name('announcements.publish');
        Route::post('/announcements/{announcement}/unpublish', [AcademyAnnouncementController::class, 'unpublish'])->name('announcements.unpublish');

        // Categories
        Route::post('/categories', [AcademyCategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [AcademyCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [AcademyCategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('/categories/{category}/toggle', [AcademyCategoryController::class, 'toggle'])->name('categories.toggle');

        // Instructors (account activate/suspend) and instructor applications
        Route::post('/instructors/{instructor}/activate', [AcademyInstructorController::class, 'activate'])->name('instructors.activate');
        Route::post('/instructors/{instructor}/suspend', [AcademyInstructorController::class, 'suspend'])->name('instructors.suspend');
        Route::post('/instructor-applications/{application}/approve', [AcademyInstructorController::class, 'approveApplication'])->name('instructor-applications.approve');
        Route::post('/instructor-applications/{application}/reject', [AcademyInstructorController::class, 'rejectApplication'])->name('instructor-applications.reject');

        // Tickets
        Route::get('/tickets/{ticket}', [AcademyTicketController::class, 'show'])->name('tickets.show');
        Route::post('/tickets/{ticket}/reply', [AcademyTicketController::class, 'reply'])->name('tickets.reply');
        Route::post('/tickets/{ticket}/status', [AcademyTicketController::class, 'status'])->name('tickets.status');

        // Moderation (reported reviews + community posts).
        // The GET route overrides the sample-data closure in routes/admin.php.
        Route::get('/moderation', [AcademyModerationController::class, 'index'])->name('moderation.index');
        Route::post('/moderation/{review}/approve', [AcademyModerationController::class, 'approve'])->name('moderation.approve');
        Route::post('/moderation/{review}/hide', [AcademyModerationController::class, 'hide'])->name('moderation.hide');
        Route::delete('/moderation/{review}', [AcademyModerationController::class, 'destroy'])->name('moderation.destroy');
        Route::post('/moderation/posts/{post}/hide', [AcademyModerationController::class, 'hidePost'])->name('moderation.posts.hide');
        Route::post('/moderation/posts/{post}/unhide', [AcademyModerationController::class, 'unhidePost'])->name('moderation.posts.unhide');
        Route::delete('/moderation/posts/{post}', [AcademyModerationController::class, 'destroyPost'])->name('moderation.posts.destroy');
        Route::delete('/moderation/comments/{comment}', [AcademyModerationController::class, 'destroyComment'])->name('moderation.comments.destroy');

        // Curriculum builder (GET overrides the sample-data closure in admin.php)
        // plus module/lesson writes used by the builder.
        Route::get('/curriculum', [AcademyModuleController::class, 'curriculum'])->name('curriculum.index');
        Route::post('/modules', [AcademyModuleController::class, 'store'])->name('modules.store');
        Route::put('/modules/{module}', [AcademyModuleController::class, 'update'])->name('modules.update');
        Route::delete('/modules/{module}', [AcademyModuleController::class, 'destroy'])->name('modules.destroy');
        Route::post('/lessons', [AcademyLessonController::class, 'store'])->name('lessons.store');
        Route::put('/lessons/{lesson}', [AcademyLessonController::class, 'update'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [AcademyLessonController::class, 'destroy'])->name('lessons.destroy');
        Route::post('/lessons/{lesson}/resources', [AcademyLessonController::class, 'storeResource'])->name('lessons.resources.store');
        Route::delete('/lessons/{lesson}/resources/{resource}', [AcademyLessonController::class, 'destroyResource'])->name('lessons.resources.destroy');
    });
});

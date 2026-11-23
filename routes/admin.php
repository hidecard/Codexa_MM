<?php

use App\Http\Controllers\Admin\Academy\AnnouncementController as AcademyAnnouncementController;
use App\Http\Controllers\Admin\Academy\AssignmentController as AcademyAssignmentController;
use App\Http\Controllers\Admin\Academy\CategoryController as AcademyCategoryController;
use App\Http\Controllers\Admin\Academy\CertificateController as AcademyCertificateController;
use App\Http\Controllers\Admin\Academy\CourseController as AcademyCourseController;
use App\Http\Controllers\Admin\Academy\EnrollmentController as AcademyEnrollmentController;
use App\Http\Controllers\Admin\Academy\InstructorController as AcademyInstructorController;
use App\Http\Controllers\Admin\Academy\LessonController as AcademyLessonController;
use App\Http\Controllers\Admin\Academy\ModuleController as AcademyModuleController;
use App\Http\Controllers\Admin\Academy\QuizController as AcademyQuizController;
use App\Http\Controllers\Admin\Academy\RefundController as AcademyRefundController;
use App\Http\Controllers\Admin\Academy\ReviewController as AcademyReviewController;
use App\Http\Controllers\Admin\Academy\StudentController as AcademyStudentController;
use App\Http\Controllers\Admin\Academy\TicketController as AcademyTicketController;
use App\Http\Controllers\Admin\Solutions\ClientController;
use App\Http\Controllers\Admin\Solutions\InvoiceController;
use App\Http\Controllers\Admin\Solutions\LeadController;
use App\Http\Controllers\Admin\Solutions\ProjectController;
use App\Http\Controllers\Admin\Solutions\QuotationController;
use App\Http\Controllers\Admin\Solutions\ServiceCategoryController;
use App\Http\Controllers\Admin\Solutions\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    Route::get('/users', function () {
        return Inertia::render('Admin/Users/Index');
    })->name('users.index');

    Route::get('/roles', function () {
        return Inertia::render('Admin/Roles/Index');
    })->name('roles.index');

    Route::get('/permissions', function () {
        return Inertia::render('Admin/Permissions/Index');
    })->name('permissions.index');

    Route::prefix('academy')->name('academy.')->group(function () {
        Route::get('/courses', [AcademyCourseController::class, 'index'])->name('courses.index');
        Route::get('/categories', [AcademyCategoryController::class, 'index'])->name('categories.index');
        Route::get('/modules', [AcademyModuleController::class, 'index'])->name('modules.index');
        Route::get('/lessons', [AcademyLessonController::class, 'index'])->name('lessons.index');
        Route::get('/enrollments', [AcademyEnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('/students', [AcademyStudentController::class, 'index'])->name('students.index');
        Route::get('/instructors', [AcademyInstructorController::class, 'index'])->name('instructors.index');
        Route::get('/assignments', [AcademyAssignmentController::class, 'index'])->name('assignments.index');
        Route::get('/quizzes', [AcademyQuizController::class, 'index'])->name('quizzes.index');
        Route::get('/certificates', [AcademyCertificateController::class, 'index'])->name('certificates.index');
        Route::get('/reviews', [AcademyReviewController::class, 'index'])->name('reviews.index');
        Route::get('/announcements', [AcademyAnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('/refunds', [AcademyRefundController::class, 'index'])->name('refunds.index');
        Route::get('/tickets', [AcademyTicketController::class, 'index'])->name('tickets.index');

        Route::get('/payments', fn () => Inertia::render('Admin/Academy/Payments/Index'))->name('payments.index');
        Route::get('/live-classes', fn () => Inertia::render('Admin/Academy/Live/Index'))->name('live-classes.index');
        Route::get('/coupons', fn () => Inertia::render('Admin/Academy/Coupons/Index'))->name('coupons.index');
        Route::get('/payouts', fn () => Inertia::render('Admin/Academy/Payouts/Index'))->name('payouts.index');
        Route::get('/moderation', fn () => Inertia::render('Admin/Academy/Moderation/Index'))->name('moderation.index');
        Route::get('/cms', fn () => Inertia::render('Admin/Academy/Cms/Index'))->name('cms.index');
        Route::get('/gamification', fn () => Inertia::render('Admin/Academy/Gamification/Index'))->name('gamification.index');
        Route::get('/marketing', fn () => Inertia::render('Admin/Academy/Marketing/Index'))->name('marketing.index');
        Route::get('/system', fn () => Inertia::render('Admin/Academy/System/Index'))->name('system.index');
        Route::get('/import', fn () => Inertia::render('Admin/Academy/Import/Index'))->name('import.index');
        Route::get('/integrations', fn () => Inertia::render('Admin/Academy/Integrations/Index'))->name('integrations.index');
        Route::get('/cert-templates', fn () => Inertia::render('Admin/Academy/CertTemplate/Index'))->name('cert-templates.index');
        Route::get('/curriculum', fn () => Inertia::render('Admin/Academy/Curriculum/Index'))->name('curriculum.index');
        Route::get('/staff', fn () => Inertia::render('Admin/Academy/Staff/Index'))->name('staff.index');
    });

    Route::prefix('solutions')->name('solutions.')->group(function () {
        Route::prefix('services')->name('services.')->group(function () {
            Route::get('/', [ServiceController::class, 'index'])->name('index');
            Route::get('/create', [ServiceController::class, 'create'])->name('create');
            Route::post('/', [ServiceController::class, 'store'])->name('store');
            Route::get('/{service}/edit', [ServiceController::class, 'edit'])->name('edit');
            Route::put('/{service}', [ServiceController::class, 'update'])->name('update');
            Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');

            Route::prefix('categories')->name('categories.')->group(function () {
                Route::get('/', [ServiceCategoryController::class, 'index'])->name('index');
                Route::get('/create', [ServiceCategoryController::class, 'create'])->name('create');
                Route::post('/', [ServiceCategoryController::class, 'store'])->name('store');
                Route::get('/{category}/edit', [ServiceCategoryController::class, 'edit'])->name('edit');
                Route::put('/{category}', [ServiceCategoryController::class, 'update'])->name('update');
                Route::delete('/{category}', [ServiceCategoryController::class, 'destroy'])->name('destroy');
            });
        });

        Route::resource('leads', LeadController::class)->names('leads');

        Route::resource('clients', ClientController::class)->names('clients');

        Route::resource('projects', ProjectController::class)->names('projects');
        Route::post('/projects/{project}/transition', [ProjectController::class, 'transition'])->name('projects.transition');
        Route::post('/projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.store');
        Route::delete('/projects/{project}/members/{member}', [ProjectController::class, 'removeMember'])->name('projects.members.destroy');
    });

    Route::prefix('finance')->name('finance.')->group(function () {
        Route::resource('quotations', QuotationController::class)->names('quotations');
        Route::post('/quotations/{quotation}/items', [QuotationController::class, 'updateItems'])->name('quotations.items.update');

        Route::resource('invoices', InvoiceController::class)->names('invoices');
        Route::post('/invoices/{invoice}/items', [InvoiceController::class, 'updateItems'])->name('invoices.items.update');
        Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store');

        Route::get('/payments', function () {
            return Inertia::render('Admin/Finance/Payments/Index');
        })->name('payments.index');

        Route::get('/transactions', function () {
            return Inertia::render('Admin/Finance/Transactions/Index');
        })->name('transactions.index');
    });

    Route::prefix('content')->name('content.')->group(function () {
        Route::get('/pages', function () {
            return Inertia::render('Admin/Content/Pages/Index');
        })->name('pages.index');

        Route::get('/blog', function () {
            return Inertia::render('Admin/Content/Blog/Index');
        })->name('blog.index');

        Route::get('/portfolio', function () {
            return Inertia::render('Admin/Content/Portfolio/Index');
        })->name('portfolio.index');

        Route::get('/faq', function () {
            return Inertia::render('Admin/Content/Faq/Index');
        })->name('faq.index');
    });

    Route::get('/notifications', function () {
        return Inertia::render('Admin/Notifications/Index');
    })->name('notifications.index');

    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports/Index');
    })->name('reports.index');

    Route::get('/activity-logs', function () {
        return Inertia::render('Admin/ActivityLogs/Index');
    })->name('activity-logs.index');

    Route::get('/settings', function () {
        return Inertia::render('Admin/Settings/Index');
    })->name('settings.index');
});

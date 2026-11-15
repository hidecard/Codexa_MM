<?php

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
        Route::get('/courses', function () {
            return Inertia::render('Admin/Academy/Courses/Index');
        })->name('courses.index');

        Route::get('/categories', function () {
            return Inertia::render('Admin/Academy/Categories/Index');
        })->name('categories.index');

        Route::get('/modules', function () {
            return Inertia::render('Admin/Academy/Modules/Index');
        })->name('modules.index');

        Route::get('/lessons', function () {
            return Inertia::render('Admin/Academy/Lessons/Index');
        })->name('lessons.index');

        Route::get('/enrollments', function () {
            return Inertia::render('Admin/Academy/Enrollments/Index');
        })->name('enrollments.index');

        Route::get('/students', function () {
            return Inertia::render('Admin/Academy/Students/Index');
        })->name('students.index');

        Route::get('/instructors', function () {
            return Inertia::render('Admin/Academy/Instructors/Index');
        })->name('instructors.index');

        Route::get('/assignments', function () {
            return Inertia::render('Admin/Academy/Assignments/Index');
        })->name('assignments.index');

        Route::get('/quizzes', function () {
            return Inertia::render('Admin/Academy/Quizzes/Index');
        })->name('quizzes.index');

        Route::get('/certificates', function () {
            return Inertia::render('Admin/Academy/Certificates/Index');
        })->name('certificates.index');
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

<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'can:access-admin-portal'])->prefix('admin')->name('admin.')->group(function () {
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
        Route::get('/services', function () {
            return Inertia::render('Admin/Solutions/Services/Index');
        })->name('services.index');

        Route::get('/leads', function () {
            return Inertia::render('Admin/Solutions/Leads/Index');
        })->name('leads.index');

        Route::get('/clients', function () {
            return Inertia::render('Admin/Solutions/Clients/Index');
        })->name('clients.index');

        Route::get('/projects', function () {
            return Inertia::render('Admin/Solutions/Projects/Index');
        })->name('projects.index');

        Route::get('/milestones', function () {
            return Inertia::render('Admin/Solutions/Milestones/Index');
        })->name('milestones.index');

        Route::get('/tasks', function () {
            return Inertia::render('Admin/Solutions/Tasks/Index');
        })->name('tasks.index');
    });

    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/quotations', function () {
            return Inertia::render('Admin/Finance/Quotations/Index');
        })->name('quotations.index');

        Route::get('/invoices', function () {
            return Inertia::render('Admin/Finance/Invoices/Index');
        })->name('invoices.index');

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

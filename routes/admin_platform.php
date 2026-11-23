<?php

// Admin platform writes: platform settings, certificate templates,
// staff & roles, gamification, landing CMS. Loaded before routes/admin.php;
// the duplicate closure GET routes there were removed at integration, so
// these controller routes are the only registration for their URIs.

use App\Http\Controllers\Admin\Academy\CertTemplateController;
use App\Http\Controllers\Admin\Academy\CmsController;
use App\Http\Controllers\Admin\Academy\GamificationController;
use App\Http\Controllers\Admin\Academy\StaffController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    // Platform settings stay admin-only.
    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::get('/settings/export', [SettingController::class, 'export'])->name('settings.export');
    });

    Route::prefix('academy')->name('academy.')->group(function () {
        Route::get('/cert-templates', [CertTemplateController::class, 'index'])->name('cert-templates.index');
        Route::post('/cert-templates', [CertTemplateController::class, 'store'])->name('cert-templates.store');
        Route::put('/cert-templates/{certificateTemplate}', [CertTemplateController::class, 'update'])->name('cert-templates.update');
        Route::delete('/cert-templates/{certificateTemplate}', [CertTemplateController::class, 'destroy'])->name('cert-templates.destroy');
        Route::post('/cert-templates/{certificateTemplate}/set-default', [CertTemplateController::class, 'setDefault'])->name('cert-templates.set-default');

        // Staff management stays admin-only.
        Route::middleware('role:admin')->group(function () {
            Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
            Route::post('/staff/invite', [StaffController::class, 'invite'])->name('staff.invite');
            Route::put('/staff/{user}/role', [StaffController::class, 'changeRole'])->name('staff.role');
            Route::put('/staff/{user}/status', [StaffController::class, 'updateStatus'])->name('staff.status');
        });

        Route::get('/gamification', [GamificationController::class, 'index'])->name('gamification.index');
        Route::put('/gamification', [GamificationController::class, 'update'])->name('gamification.update');

        Route::get('/cms', [CmsController::class, 'index'])->name('cms.index');
        Route::put('/cms', [CmsController::class, 'update'])->name('cms.update');
    });
});

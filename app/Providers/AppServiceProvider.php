<?php

namespace App\Providers;

use App\Policies\PortalPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('access-admin-portal', [PortalPolicy::class, 'admin']);
        Gate::define('access-instructor-portal', [PortalPolicy::class, 'instructor']);
        Gate::define('access-student-portal', [PortalPolicy::class, 'student']);
        Gate::define('access-client-portal', [PortalPolicy::class, 'client']);
    }
}

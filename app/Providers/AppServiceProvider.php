<?php

namespace App\Providers;

use App\Models\Course;
use App\Policies\CoursePolicy;
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
        Gate::policy(Course::class, CoursePolicy::class);

        Gate::define('access-student-portal', fn ($user) => $user->hasRole('student'));
        Gate::define('access-instructor-portal', fn ($user) => $user->hasRole('instructor'));
        Gate::define('access-client-portal', fn ($user) => $user->hasRole('client'));
        Gate::define('access-admin-portal', fn ($user) => $user->hasRole('admin'));
    }
}


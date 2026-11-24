<?php

namespace App\Providers;

use App\Listeners\LogAuthActivity;
use App\Models\Assignment;
use App\Models\Client;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Quotation;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Submission;
use App\Models\SupportTicket;
use App\Policies\AssignmentPolicy;
use App\Policies\ClientPolicy;
use App\Policies\CoursePolicy;
use App\Policies\InvoicePolicy;
use App\Policies\LeadPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\QuizAttemptPolicy;
use App\Policies\QuizPolicy;
use App\Policies\QuotationPolicy;
use App\Policies\ServiceCategoryPolicy;
use App\Policies\ServicePolicy;
use App\Policies\SubmissionPolicy;
use App\Policies\SupportTicketPolicy;
use App\Observers\CourseObserver;
use App\Observers\EnrollmentObserver;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
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
        Gate::policy(Assignment::class, AssignmentPolicy::class);
        Gate::policy(Submission::class, SubmissionPolicy::class);
        Gate::policy(Quiz::class, QuizPolicy::class);
        Gate::policy(QuizAttempt::class, QuizAttemptPolicy::class);

        Gate::policy(ServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(Lead::class, LeadPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Quotation::class, QuotationPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(SupportTicket::class, SupportTicketPolicy::class);

        // Activity-log instrumentation: auth events and the course /
        // enrollment lifecycle write to system_logs (see App\Support\ActivityLog).
        Event::listen(Login::class, [LogAuthActivity::class, 'handleLogin']);
        Event::listen(Logout::class, [LogAuthActivity::class, 'handleLogout']);
        Course::observe(CourseObserver::class);
        Enrollment::observe(EnrollmentObserver::class);

        Gate::define('access-student-portal', fn ($user) => $user->hasRole('student'));
        Gate::define('access-instructor-portal', fn ($user) => $user->hasRole('instructor'));
        Gate::define('access-client-portal', fn ($user) => $user->hasRole('client'));
        Gate::define('access-admin-portal', fn ($user) => $user->hasRole('admin'));
    }
}

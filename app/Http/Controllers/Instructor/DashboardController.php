<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\CourseQuestion;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\LiveSession;
use App\Support\AcademyAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $courseIds = AcademyAnalytics::instructorCourseIds($user->id);

        $courses = Course::query()->whereIn('id', $courseIds)->get(['id', 'status']);
        $students = Enrollment::query()
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', ['active', 'completed'])
            ->distinct('student_id')
            ->count('student_id');
        $newStudents = Enrollment::query()
            ->whereIn('course_id', $courseIds)
            ->where('enrolled_at', '>=', now()->subDays(7))
            ->distinct('student_id')
            ->count('student_id');

        $revenue = (float) CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->sum('amount')
            + AcademyAnalytics::orderRevenueForCourses($courseIds);
        $shareTotal = round($revenue * AcademyAnalytics::instructorShare(), 2);

        $reviews = CourseReview::query()
            ->whereIn('course_id', $courseIds)
            ->where('is_approved', true);
        $avgRating = round((float) (clone $reviews)->avg('rating'), 1);
        $reviewsTotal = (clone $reviews)->count();

        $monthlyShare = array_map(function (array $month) {
            // monthlyRevenue is in lakhs of total revenue; share is the
            // instructor share from settings.
            return ['label' => $month['label'], 'value' => round($month['value'] * AcademyAnalytics::instructorShare(), 2)];
        }, AcademyAnalytics::monthlyRevenue(6, $courseIds));

        $recentReviews = CourseReview::query()
            ->with(['student:id,name', 'course:id,title'])
            ->whereIn('course_id', $courseIds)
            ->where('is_approved', true)
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn (CourseReview $review) => [
                'id' => $review->id,
                'name' => $review->student?->name ?? '—',
                'init' => $review->student ? AcademyAnalytics::initials($review->student->name) : '—',
                'col' => $review->student ? AcademyAnalytics::avatarColor($review->student->id) : '#64748b',
                'stars' => (int) $review->rating,
                'date' => optional($review->created_at)?->toDateString(),
                'course' => $review->course?->title ?? '—',
                'text' => $review->comment ?? '',
            ])->values();

        $unanswered = CourseQuestion::query()
            ->with(['student:id,name', 'lesson:id,title', 'course:id,title'])
            ->whereIn('course_id', $courseIds)
            ->where('is_answered', false)
            ->latest()
            ->limit(2)
            ->get()
            ->map(fn (CourseQuestion $q) => [
                'id' => $q->id,
                'q' => $q->question,
                'student' => $q->student?->name ?? '—',
                'lesson' => $q->lesson?->title ?? $q->course?->title ?? '—',
                'time' => optional($q->created_at)?->toDateString(),
            ])->values();

        $upcomingLive = LiveSession::query()
            ->where('instructor_id', $user->id)
            ->whereIn('status', [LiveSession::STATUS_SCHEDULED, LiveSession::STATUS_LIVE])
            ->where('scheduled_at', '>=', now()->subHours(2))
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get()
            ->map(fn (LiveSession $session) => [
                'title' => $session->title,
                'when' => LiveSession::myanmarWhen($session->scheduled_at),
                'time' => LiveSession::myanmarTimeRange($session->scheduled_at, $session->ends_at),
                'joined' => 0,
                'liveNow' => $session->status === LiveSession::STATUS_LIVE,
            ])->values();

        return Inertia::render('Instructor/Dashboard', [
            'stats' => [
                'courses' => $courses->count(),
                'publishedCourses' => $courses->where('status', 'published')->count(),
                'draftCourses' => $courses->where('status', 'draft')->count(),
                'students' => $students,
                'newStudents' => $newStudents,
                'shareTotal' => $shareTotal,
                'avgRating' => $avgRating,
                'reviewsTotal' => $reviewsTotal,
            ],
            'monthlyShare' => $monthlyShare,
            'recentReviews' => $recentReviews,
            'unansweredQuestions' => $unanswered,
            'unansweredCount' => CourseQuestion::query()->whereIn('course_id', $courseIds)->where('is_answered', false)->count(),
            'upcomingLive' => $upcomingLive,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Support\AcademyAnalytics;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(): Response
    {
        $from = now()->subMonths(5)->startOfMonth();

        $monthlyRevenue = AcademyAnalytics::monthlyRevenue(6);
        $totalRevenue = (float) CoursePayment::query()
            ->where('status', 'approved')
            ->where('created_at', '>=', $from)
            ->sum('amount');
        $prevRevenue = (float) CoursePayment::query()
            ->where('status', 'approved')
            ->whereBetween('created_at', [now()->subMonths(11)->startOfMonth(), now()->subMonths(6)->endOfMonth()])
            ->sum('amount');
        $revenueChange = $prevRevenue > 0 ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1) : null;

        $monthlyEnrollments = AcademyAnalytics::monthlyEnrollments(6);
        $totalEnroll = array_sum(array_column($monthlyEnrollments, 'value'));
        $prevEnroll = Enrollment::query()
            ->whereBetween('enrolled_at', [now()->subMonths(11)->startOfMonth(), now()->subMonths(6)->endOfMonth()])
            ->count();
        $enrollChange = $prevEnroll > 0 ? round((($totalEnroll - $prevEnroll) / $prevEnroll) * 100, 1) : null;

        $activeStudents = LessonProgress::query()
            ->where('updated_at', '>=', now()->subDays(30))
            ->distinct('enrollment_id')
            ->count('enrollment_id');
        $totalEnrolledStudents = Enrollment::query()->distinct('student_id')->count('student_id');

        $avgCompletion = $this->averageCompletion();

        // Funnel from real data only: page-view/cart steps do not exist yet,
        // so the funnel is enrollments → active → completed → certified.
        $completed = Enrollment::query()->where('status', 'completed')->count();
        $certified = Certificate::query()->count();
        $funnel = [
            ['label' => 'စာရင်းသွင်းသူ (စုစုပေါင်း)', 'value' => Enrollment::query()->count()],
            ['label' => 'တက်ကြွသော ကျောင်းသား (ရက် 30 အတွင်း)', 'value' => $activeStudents],
            ['label' => 'သင်တန်း ပြီးဆုံးသူ', 'value' => $completed],
            ['label' => 'လက်မှတ် ရရှိသူ', 'value' => $certified],
        ];

        return Inertia::render('Admin/Reports/Index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'revenueChange' => $revenueChange,
                'totalEnrollments' => $totalEnroll,
                'enrollChange' => $enrollChange,
                'activeStudents' => $activeStudents,
                'totalStudents' => $totalEnrolledStudents,
                'avgCompletion' => $avgCompletion,
            ],
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyEnrollments' => $monthlyEnrollments,
            'categoryShare' => AcademyAnalytics::categoryShare(),
            'paymentMix' => AcademyAnalytics::paymentMix(),
            'topCourses' => AcademyAnalytics::topCourses(null, 5),
            'funnel' => $funnel,
        ]);
    }

    /** Average lesson-completion % across active/completed enrollments. */
    private function averageCompletion(): int
    {
        $enrollments = Enrollment::query()
            ->whereIn('status', ['active', 'completed'])
            ->get(['id', 'course_id']);

        if ($enrollments->isEmpty()) {
            return 0;
        }

        $lessonCounts = \App\Models\Lesson::query()
            ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
            ->selectRaw('course_modules.course_id as course_id, COUNT(*) as total')
            ->groupBy('course_modules.course_id')
            ->pluck('total', 'course_id');

        $completedCounts = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollments->pluck('id'))
            ->where('is_completed', true)
            ->selectRaw('enrollment_id, COUNT(*) as total')
            ->groupBy('enrollment_id')
            ->pluck('total', 'enrollment_id');

        $sum = 0;
        foreach ($enrollments as $enrollment) {
            $total = (int) ($lessonCounts[$enrollment->course_id] ?? 0);
            $sum += $total > 0 ? ((int) ($completedCounts[$enrollment->id] ?? 0) / $total) * 100 : 0;
        }

        return (int) round($sum / $enrollments->count());
    }
}

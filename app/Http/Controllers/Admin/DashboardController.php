<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Submission;
use App\Models\SupportTicket;
use App\Models\User;
use App\Support\AcademyAnalytics;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $prevMonthStart = $now->copy()->subMonth()->startOfMonth();
        $prevMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $approved = CoursePayment::query()->where('status', 'approved');
        $monthRevenue = (float) (clone $approved)->where('created_at', '>=', $monthStart)->sum('amount');
        $prevRevenue = (float) (clone $approved)->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->sum('amount');
        $monthChange = $prevRevenue > 0 ? round((($monthRevenue - $prevRevenue) / $prevRevenue) * 100, 1) : null;

        $monthlyRevenue = AcademyAnalytics::monthlyRevenue(6);

        $totalStudents = User::role('student')->count();
        $newStudentsWeek = User::role('student')->where('created_at', '>=', $now->copy()->subDays(7))->count();

        $courseStats = Course::query()
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published, SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft, SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review")
            ->first();

        $avgCompletion = $this->averageCompletion();
        $activeToday = LessonProgress::query()
            ->where('updated_at', '>=', $now->copy()->startOfDay())
            ->distinct('enrollment_id')
            ->count('enrollment_id');

        $recentPayments = CoursePayment::query()
            ->with(['student:id,name', 'course:id,title'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (CoursePayment $p) => [
                'id' => $p->displayCode(),
                'n' => $p->student?->name ?? '—',
                'item' => $p->course?->title ?? ($p->order_id ? 'Order #'.$p->order_id : '—'),
                'method' => AcademyAnalytics::methodLabel($p->method),
                'amount' => (float) $p->amount,
                'date' => $this->myanmarDateTime($p->created_at),
                'status' => $p->status === 'approved' ? 'success' : ($p->status === 'pending' ? 'pending' : $p->status),
            ])->values();

        $pendingPayments = CoursePayment::query()->where('status', 'pending')->count();
        $reviewCourses = Course::query()->where('status', 'review')->get(['id', 'title']);
        $ungraded = Submission::query()->whereNotIn('status', ['graded', 'returned'])->count();
        $openTickets = SupportTicket::query()->whereIn('status', ['open', 'in_progress', 'waiting_client'])->count();

        $tasks = [
            [
                'title' => 'Bank transfer အတည်ပြုရန်',
                'desc' => 'စောင့်ဆိုင်းနေသော ပေးချေမှု '.$pendingPayments.' ခု',
                'count' => $pendingPayments,
                'href' => '/admin/academy/payments',
            ],
            [
                'title' => 'သင်တန်း review လုပ်ရန်',
                'desc' => $reviewCourses->isNotEmpty() ? $reviewCourses->pluck('title')->join(' · ') : 'Review လုပ်ရန် သင်တန်း မရှိပါ',
                'count' => $reviewCourses->count(),
                'href' => '/admin/academy/courses',
            ],
            [
                'title' => 'Assignment အမှတ်ပေးရန်',
                'desc' => 'စစ်ဆေးရန် စောင့်နေသော တင်သွင်းမှု '.$ungraded.' ခု',
                'count' => $ungraded,
                'href' => '/admin/academy/assignments',
            ],
            [
                'title' => 'Support ticket ဖြေကြားရန်',
                'desc' => 'မဖြေရသေးသော ticket '.$openTickets.' ခု ရှိပါတယ်',
                'count' => $openTickets,
                'href' => '/admin/academy/tickets',
            ],
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'monthRevenue' => $monthRevenue,
                'monthRevenueChange' => $monthChange,
                'totalStudents' => $totalStudents,
                'newStudentsWeek' => $newStudentsWeek,
                'totalCourses' => (int) ($courseStats->total ?? 0),
                'publishedCourses' => (int) ($courseStats->published ?? 0),
                'draftCourses' => (int) ($courseStats->draft ?? 0),
                'reviewCourses' => (int) ($courseStats->review ?? 0),
                'avgCompletion' => $avgCompletion,
                'activeToday' => $activeToday,
            ],
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyRevenueTotal' => (float) (clone $approved)->where('created_at', '>=', $now->copy()->subMonths(5)->startOfMonth())->sum('amount'),
            'topCourses' => AcademyAnalytics::topCourses(null, 5),
            'recentPayments' => $recentPayments,
            'paymentMix' => AcademyAnalytics::paymentMix(),
            'tasks' => $tasks,
            'liveToday' => null,
        ]);
    }

    /** Average lesson-completion % across active/completed enrollments. */
    private function averageCompletion(): int
    {
        $enrollments = Enrollment::query()
            ->with('course:id')
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

    private function myanmarDateTime($date): string
    {
        if (! $date) {
            return '—';
        }

        $months = [
            1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
            5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
            9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
        ];

        return ($months[(int) $date->format('n')] ?? '').' '.$date->format('d').' · '.$date->format('g:i');
    }
}

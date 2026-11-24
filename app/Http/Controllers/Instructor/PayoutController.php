<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Models\LiveSession;
use App\Models\Payout;
use App\Models\User;
use App\Support\AcademyAnalytics;
use App\Support\ActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = AcademyAnalytics::instructorCourseIds($user->id);

        $pending = Payout::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        $revenue = (float) CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->sum('amount')
            + AcademyAnalytics::orderRevenueForCourses($courseIds);
        $thisMonthShare = ((float) CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount')
            + AcademyAnalytics::orderRevenueForCourses($courseIds, now()->startOfMonth()))
            * AcademyAnalytics::instructorShare();
        $totalStudents = Enrollment::query()
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', ['active', 'completed'])
            ->distinct('student_id')
            ->count('student_id');

        return Inertia::render('Instructor/Earnings/Index', [
            'availableBalance' => $this->availableBalance($user),
            'pendingPayout' => $pending ? [
                'id' => $pending->id,
                'amount' => (float) $pending->amount,
                'method' => $pending->method,
                'period' => $pending->period,
                'created_at' => optional($pending->created_at)?->toDateString(),
            ] : null,
            'stats' => [
                'totalRevenue' => $revenue,
                'totalShare' => round($revenue * AcademyAnalytics::instructorShare(), 2),
                'thisMonthShare' => round($thisMonthShare, 2),
                'totalStudents' => $totalStudents,
                'coursesCount' => count($courseIds),
            ],
            'courseEarnings' => $this->courseEarnings($courseIds),
            'monthlyHistory' => $this->monthlyHistory($user, $courseIds),
            'payouts' => $this->payoutList($user),
        ]);
    }

    /** Per-course earnings detail. Only the course's own instructor may view it. */
    public function show(Request $request, Course $course): Response
    {
        $user = $request->user();
        $courseIds = AcademyAnalytics::instructorCourseIds($user->id);
        abort_unless(in_array($course->id, $courseIds, true), 403);

        $course->loadCount(['enrollments as students_count' => fn (Builder $q) => $q->whereIn('status', ['active', 'completed'])]);
        $course->loadAvg(['reviews as rating_avg' => fn (Builder $q) => $q->where('is_approved', true)], 'rating');

        return Inertia::render('Instructor/Earnings/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'price' => (float) $course->price,
                'students' => (int) $course->students_count,
                'rating' => round((float) ($course->rating_avg ?? 0), 1),
                'revenue' => (float) CoursePayment::query()->where('course_id', $course->id)->where('status', 'approved')->sum('amount')
                    + AcademyAnalytics::orderRevenueForCourses([$course->id]),
            ],
            'monthlyShare' => array_map(
                fn (array $month) => ['label' => $month['label'], 'value' => round($month['value'] * AcademyAnalytics::instructorShare(), 2)],
                AcademyAnalytics::monthlyRevenue(6, [$course->id])
            ),
            'courseEarnings' => $this->courseEarnings($courseIds),
            'payouts' => $this->payoutList($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $available = $this->availableBalance($user);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:'.$available],
            'method' => ['required', 'string', 'in:kbzpay,wavepay,cbpay,bank'],
        ]);

        $payout = Payout::create([
            'instructor_id' => $user->id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'status' => 'pending',
            'period' => now()->format('Y-m'),
        ]);

        ActivityLog::record('payout.requested', 'Requested payout of '.number_format((float) $validated['amount']).' Ks via '.$validated['method'], $payout);

        return back()->with('success', 'Payout တောင်းဆိုမှု ပို့ပြီးပါပြီ — Admin အတည်ပြုရန် စောင့်နေပါသည်');
    }

    /**
     * Instructor's withdrawable share: instructorShare() (the
     * `instructor_share_pct` setting, default 50%) of approved payments for
     * their courses — direct course payments plus order-level payments
     * attributed by item-price split — minus payouts already paid or pending.
     */
    private function availableBalance(User $user): float
    {
        $courseIds = AcademyAnalytics::instructorCourseIds($user->id);

        $direct = (float) CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->sum('amount');

        $earned = ($direct + AcademyAnalytics::orderRevenueForCourses($courseIds))
            * AcademyAnalytics::instructorShare();

        $claimed = (float) Payout::query()
            ->where('instructor_id', $user->id)
            ->whereIn('status', ['pending', 'paid'])
            ->sum('amount');

        return max(0, round($earned - $claimed, 2));
    }

    /** Revenue + instructor share per own course (incl. order attribution). */
    private function courseEarnings(array $courseIds): array
    {
        $revenue = CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->selectRaw('course_id, SUM(amount) as total')
            ->groupBy('course_id')
            ->pluck('total', 'course_id');

        $orderRevenue = AcademyAnalytics::orderRevenuePerCourse($courseIds);

        return Course::query()
            ->whereIn('id', $courseIds)
            ->withCount(['enrollments as students_count' => fn (Builder $q) => $q->whereIn('status', ['active', 'completed'])])
            ->orderBy('title')
            ->get()
            ->map(function (Course $course) use ($revenue, $orderRevenue) {
                $total = (float) ($revenue[$course->id] ?? 0) + (float) ($orderRevenue[$course->id] ?? 0);

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'price' => (float) $course->price,
                    'students' => (int) $course->students_count,
                    'revenue' => $total,
                    'share' => round($total * AcademyAnalytics::instructorShare(), 2),
                ];
            })->values()->all();
    }

    /** Last 6 months of sales/share; a month is 'paid' when a paid Payout covers its period. */
    private function monthlyHistory(User $user, array $courseIds): array
    {
        $from = now()->subMonths(5)->startOfMonth();

        $rows = CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->where('created_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as sales, SUM(amount) as total")
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $paidPeriods = Payout::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'paid')
            ->pluck('period')
            ->all();

        $orderMonthly = AcademyAnalytics::orderRevenueMonthly($courseIds, 6);

        return AcademyAnalytics::lastMonths(6)->map(function ($month) use ($rows, $paidPeriods, $orderMonthly) {
            $key = $month->format('Y-m');
            $row = $rows->get($key);
            $total = (float) ($row->total ?? 0) + (float) ($orderMonthly[$key]['total'] ?? 0);

            return [
                'label' => LiveSession::myanmarMonth((int) $month->format('n')).' '.$month->format('Y'),
                'sales' => (int) ($row->sales ?? 0) + (int) ($orderMonthly[$key]['sales'] ?? 0),
                'total' => $total,
                'share' => round($total * AcademyAnalytics::instructorShare(), 2),
                'status' => in_array($key, $paidPeriods, true) ? 'paid' : 'pending',
            ];
        })->values()->all();
    }

    private function payoutList(User $user): array
    {
        return Payout::query()
            ->where('instructor_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (Payout $payout) => [
                'id' => $payout->displayCode(),
                'amount' => (float) $payout->amount,
                'method' => AcademyAnalytics::methodLabel($payout->method),
                'date' => optional($payout->paid_at ?? $payout->created_at)?->toDateString(),
                'status' => $payout->status,
            ])->values()->all();
    }
}

<?php

namespace App\Support;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Models\LiveSession;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Shared read aggregates for the admin dashboard, admin reports and the
 * instructor dashboard/earnings pages. All money comes from CoursePayment
 * (status 'approved') — the invoice/project-based Payment model is never
 * used for academy analytics.
 *
 * Instructor revenue share: the `instructor_share_pct` platform setting is
 * authoritative (see instructorShare()); it defaults to 50% (assumed default
 * — recorded 2026-11-23, needs user confirmation). Order-level payments
 * (course_id null) are attributed to instructors by splitting the payment
 * across the order's items in proportion to each item's price — see
 * orderRevenueForCourses(). The same attribution feeds the admin
 * breakdowns (topCourses, categoryShare, monthlyRevenue), so admin
 * reports and instructor stats agree on course revenue.
 */
class AcademyAnalytics
{
    /** Default instructor share of approved course revenue (50%). */
    public const INSTRUCTOR_SHARE = 0.5;

    /**
     * Current instructor share as a fraction (0–1), read from the
     * `instructor_share_pct` setting with the 50% default as fallback.
     */
    public static function instructorShare(): float
    {
        $pct = (float) Setting::getValue('instructor_share_pct', 50);

        return max(0.0, min(1.0, $pct / 100));
    }

    public const METHOD_LABELS = [
        'kbzpay' => 'KBZPay',
        'wavepay' => 'WavePay',
        'cbpay' => 'CB Pay',
        'bank' => 'Bank Transfer',
    ];

    public const METHOD_COLORS = [
        'kbzpay' => '#0ea5a4',
        'wavepay' => '#f59e0b',
        'cbpay' => '#2563eb',
        'bank' => '#64748b',
    ];

    public const CATEGORY_COLORS = ['#0ea892', '#2563eb', '#7c3aed', '#ec4899', '#f59e0b', '#22c55e', '#38bdf8', '#f43f5e'];

    public const AVATAR_COLORS = ['#0ea892', '#ec4899', '#38bdf8', '#22c55e', '#6366f1', '#f59e0b', '#8b5cf6', '#ef4444'];

    public static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];

        if (count($parts) === 1) {
            return mb_strtoupper(mb_substr($parts[0], 0, 2));
        }

        return mb_strtoupper(mb_substr($parts[0], 0, 1).mb_substr(end($parts), 0, 1));
    }

    public static function avatarColor(int $id): string
    {
        return static::AVATAR_COLORS[$id % count(static::AVATAR_COLORS)];
    }

    public static function methodLabel(?string $method): string
    {
        return static::METHOD_LABELS[$method ?? ''] ?? ($method ? ucfirst($method) : '—');
    }

    /** Last N months (oldest first) as Carbon instances at month start. */
    public static function lastMonths(int $months = 6): Collection
    {
        return collect(range($months - 1, 0))->map(fn (int $ago) => now()->subMonths($ago)->startOfMonth());
    }

    /** Approved CoursePayment revenue per month, in lakhs (သိန်း, 100,000 Ks). */
    public static function monthlyRevenue(int $months = 6, ?array $courseIds = null): array
    {
        $from = now()->subMonths($months - 1)->startOfMonth();

        $sums = CoursePayment::query()
            ->where('status', 'approved')
            ->where('created_at', '>=', $from)
            ->when($courseIds !== null, fn (Builder $q) => $q->whereIn('course_id', $courseIds))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        // Course-scoped views also include attributed order revenue. The
        // unscoped base query above has no course_id filter, so it
        // already sums order-level payments; adding them again here
        // would double-count.
        $orderMonthly = $courseIds !== null ? static::orderRevenueMonthly($courseIds, $months) : [];

        return static::lastMonths($months)->map(function (Carbon $month) use ($sums, $orderMonthly) {
            $key = $month->format('Y-m');
            $total = (float) ($sums[$key] ?? 0) + (float) ($orderMonthly[$key]['total'] ?? 0);

            return [
                'label' => LiveSession::myanmarMonth((int) $month->format('n')),
                'value' => round($total / 100000, 2),
            ];
        })->values()->all();
    }

    /** New enrollments per month. */
    public static function monthlyEnrollments(int $months = 6): array
    {
        $from = now()->subMonths($months - 1)->startOfMonth();

        $counts = Enrollment::query()
            ->where('enrolled_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(enrolled_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        return static::lastMonths($months)->map(function (Carbon $month) use ($counts) {
            return [
                'label' => LiveSession::myanmarMonth((int) $month->format('n')),
                'value' => (int) ($counts[$month->format('Y-m')] ?? 0),
            ];
        })->values()->all();
    }

    /** Approved revenue split by payment method. */
    public static function paymentMix(?array $courseIds = null): array
    {
        $rows = CoursePayment::query()
            ->where('status', 'approved')
            ->when($courseIds !== null, fn (Builder $q) => $q->whereIn('course_id', $courseIds))
            ->selectRaw('method, SUM(amount) as total')
            ->groupBy('method')
            ->orderByDesc('total')
            ->get();

        $grand = (float) $rows->sum('total');

        return $rows->map(fn ($row) => [
            'name' => static::methodLabel($row->method),
            'pct' => $grand > 0 ? (int) round(((float) $row->total / $grand) * 100) : 0,
            'amount' => (float) $row->total,
            'col' => static::METHOD_COLORS[$row->method ?? ''] ?? '#8b5cf6',
        ])->values()->all();
    }

    /**
     * Approved revenue split by course category. Direct payments join
     * through their course; order-level payments (course_id null) are
     * attributed per course with orderRevenuePerCourse() and rolled up
     * to each course's category, so a category whose revenue came only
     * through orders still appears.
     */
    public static function categoryShare(): array
    {
        $rows = CoursePayment::query()
            ->where('course_payments.status', 'approved')
            ->whereNotNull('course_payments.course_id')
            ->join('courses', 'course_payments.course_id', '=', 'courses.id')
            ->join('course_categories', 'courses.category_id', '=', 'course_categories.id')
            ->selectRaw('course_categories.id as id, course_categories.name as name, SUM(course_payments.amount) as total')
            ->groupBy('course_categories.id', 'course_categories.name')
            ->get();

        // category_id => ['name' => ..., 'total' => ...]
        $totals = [];
        foreach ($rows as $row) {
            $totals[$row->id] = ['name' => $row->name, 'total' => (float) $row->total];
        }

        $courseCategories = Course::query()->pluck('category_id', 'id');
        $categoryNames = CourseCategory::query()->pluck('name', 'id');
        foreach (static::orderRevenuePerCourse($courseCategories->keys()->all()) as $courseId => $amount) {
            $categoryId = $courseCategories[$courseId] ?? null;
            if ($categoryId === null) {
                continue;
            }
            $totals[$categoryId] ??= ['name' => $categoryNames[$categoryId] ?? '—', 'total' => 0.0];
            $totals[$categoryId]['total'] += $amount;
        }

        $grand = (float) collect($totals)->sum('total');

        return collect($totals)
            ->sortByDesc('total')
            ->values()
            ->map(fn (array $row, int $i) => [
                'name' => $row['name'],
                'pct' => $grand > 0 ? (int) round(($row['total'] / $grand) * 100) : 0,
                'amount' => $row['total'],
                'col' => static::CATEGORY_COLORS[$i % count(static::CATEGORY_COLORS)],
            ])->all();
    }

    /**
     * Top courses by approved CoursePayment revenue, with enrollment
     * counts and average approved-review rating. Revenue is direct
     * payments plus each course's share of order-level payments
     * (orderRevenuePerCourse), so admin breakdowns match instructor
     * stats.
     */
    public static function topCourses(?array $courseIds = null, int $limit = 5): array
    {
        $revenue = CoursePayment::query()
            ->where('status', 'approved')
            ->whereNotNull('course_id')
            ->when($courseIds !== null, fn (Builder $q) => $q->whereIn('course_id', $courseIds))
            ->selectRaw('course_id, SUM(amount) as total')
            ->groupBy('course_id')
            ->pluck('total', 'course_id');

        $courses = Course::query()
            ->with('instructor:id,name')
            ->withCount(['enrollments as students_count' => fn (Builder $q) => $q->whereIn('status', ['active', 'completed'])])
            ->withAvg(['reviews as rating_avg' => fn (Builder $q) => $q->where('is_approved', true)], 'rating')
            ->when($courseIds !== null, fn (Builder $q) => $q->whereIn('id', $courseIds))
            ->get();

        $orderRevenue = static::orderRevenuePerCourse($courses->pluck('id')->all());

        return $courses
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'instructor' => $course->instructor?->name ?? '—',
                'students' => (int) $course->students_count,
                'rating' => round((float) ($course->rating_avg ?? 0), 1),
                'price' => (float) $course->price,
                'revenue' => (float) ($revenue[$course->id] ?? 0) + (float) ($orderRevenue[$course->id] ?? 0),
            ])
            ->sortByDesc('revenue')
            ->take($limit)
            ->values()
            ->all();
    }

    /** Course IDs an instructor teaches (owner or co-instructor). */
    public static function instructorCourseIds(int $instructorId): array
    {
        return Course::query()
            ->where(fn (Builder $q) => $q->where('instructor_id', $instructorId)
                ->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($instructorId)))
            ->pluck('id')
            ->all();
    }

    /**
     * Revenue from approved ORDER-level payments (course_id null) that
     * belongs to the given courses. Each order payment is split across its
     * items in proportion to item price, so a multi-course order pays every
     * instructor whose course is in it. Because the split uses the payment
     * amount (the order total after any coupon), discounts are shared
     * proportionally too.
     */
    public static function orderRevenueForCourses(array $courseIds, ?Carbon $from = null): float
    {
        if ($courseIds === []) {
            return 0.0;
        }

        $total = 0.0;

        $orderPayments = CoursePayment::query()
            ->where('status', 'approved')
            ->whereNull('course_id')
            ->whereNotNull('order_id')
            ->when($from !== null, fn (Builder $q) => $q->where('created_at', '>=', $from))
            ->with('order.items:id,order_id,course_id,price')
            ->get();

        foreach ($orderPayments as $payment) {
            $items = $payment->order?->items ?? collect();
            $itemsTotal = $items->sum(fn ($item) => (float) $item->price);

            if ($itemsTotal <= 0) {
                continue;
            }

            foreach ($items as $item) {
                if (in_array($item->course_id, $courseIds, true)) {
                    $total += (float) $payment->amount * ((float) $item->price / $itemsTotal);
                }
            }
        }

        return $total;
    }

    /** Order-attributed revenue per course (course_id => amount). */
    public static function orderRevenuePerCourse(array $courseIds): array
    {
        $perCourse = [];

        if ($courseIds === []) {
            return $perCourse;
        }

        $orderPayments = CoursePayment::query()
            ->where('status', 'approved')
            ->whereNull('course_id')
            ->whereNotNull('order_id')
            ->with('order.items:id,order_id,course_id,price')
            ->get();

        foreach ($orderPayments as $payment) {
            $items = $payment->order?->items ?? collect();
            $itemsTotal = $items->sum(fn ($item) => (float) $item->price);

            if ($itemsTotal <= 0) {
                continue;
            }

            foreach ($items as $item) {
                if (in_array($item->course_id, $courseIds, true)) {
                    $perCourse[$item->course_id] = ($perCourse[$item->course_id] ?? 0.0)
                        + (float) $payment->amount * ((float) $item->price / $itemsTotal);
                }
            }
        }

        return $perCourse;
    }

    /**
     * Order-attributed revenue per month ('Y-m' => ['total' => amount,
     * 'sales' => order-payment count]) for the last N months. A month's
     * sales count is the number of order payments containing at least one
     * of the given courses.
     */
    public static function orderRevenueMonthly(array $courseIds, int $months = 6): array
    {
        $monthly = [];

        if ($courseIds === []) {
            return $monthly;
        }

        $from = now()->subMonths($months - 1)->startOfMonth();

        $orderPayments = CoursePayment::query()
            ->where('status', 'approved')
            ->whereNull('course_id')
            ->whereNotNull('order_id')
            ->where('created_at', '>=', $from)
            ->with('order.items:id,order_id,course_id,price')
            ->get();

        foreach ($orderPayments as $payment) {
            $items = $payment->order?->items ?? collect();
            $itemsTotal = $items->sum(fn ($item) => (float) $item->price);

            if ($itemsTotal <= 0) {
                continue;
            }

            $attributed = 0.0;

            foreach ($items as $item) {
                if (in_array($item->course_id, $courseIds, true)) {
                    $attributed += (float) $payment->amount * ((float) $item->price / $itemsTotal);
                }
            }

            if ($attributed > 0) {
                $key = $payment->created_at->format('Y-m');
                $monthly[$key]['total'] = ($monthly[$key]['total'] ?? 0.0) + $attributed;
                $monthly[$key]['sales'] = ($monthly[$key]['sales'] ?? 0) + 1;
            }
        }

        return $monthly;
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use App\Support\AcademyAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $type = $request->query('type', 'all');

        $logs = SystemLog::query()
            ->with('user:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (SystemLog $log) => [
                'who' => $log->user?->name ?? 'System',
                'init' => $log->user ? AcademyAnalytics::initials($log->user->name) : 'SY',
                'col' => $log->user ? AcademyAnalytics::avatarColor($log->user->id) : '#64748b',
                'action' => $log->message,
                'target' => $this->targetLabel($log),
                'type' => $this->mapType($log),
                'time' => optional($log->created_at)?->toDateTimeString(),
            ])->values();

        if ($type !== 'all') {
            $logs = $logs->filter(fn (array $log) => $log['type'] === $type)->values();
        }

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filterType' => $type,
        ]);
    }

    /** Map a system_logs row onto the UI's four audit tabs. */
    private function mapType(SystemLog $log): string
    {
        $haystack = strtolower($log->channel.' '.$log->event.' '.$log->message);

        if (str_contains($haystack, 'payment') || str_contains($haystack, 'payout') || str_contains($haystack, 'refund') || str_contains($haystack, 'coupon')) {
            return 'payment';
        }
        if (str_contains($haystack, 'course') || str_contains($haystack, 'lesson') || str_contains($haystack, 'live') || str_contains($haystack, 'review')) {
            return 'course';
        }
        if (str_contains($haystack, 'user') || str_contains($haystack, 'staff') || str_contains($haystack, 'ticket') || str_contains($haystack, 'login')) {
            return 'user';
        }

        return 'system';
    }

    private function targetLabel(SystemLog $log): string
    {
        $context = $log->context ?? [];
        $parts = [];

        if (! empty($context['subject'])) {
            $parts[] = (string) $context['subject'];
        }
        if (! empty($context['id'])) {
            $parts[] = '#'.(string) $context['id'];
        }

        $parts[] = $log->channel.' · '.$log->event;

        if ($log->ip_address) {
            $parts[] = $log->ip_address;
        }

        return implode(' · ', $parts);
    }
}

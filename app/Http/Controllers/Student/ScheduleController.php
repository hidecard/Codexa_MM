<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\LiveSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    private const DAY_SHORT = [
        0 => 'တနင်္ဂနွေ', 1 => 'တနင်္လာ', 2 => 'အင်္ဂါ', 3 => 'ဗုဒ္ဓဟူး',
        4 => 'ကြာသပတေး', 5 => 'သောကြာ', 6 => 'စနေ',
    ];

    private const DAY_NAME = [
        0 => 'တနင်္ဂနွေနေ့', 1 => 'တနင်္လာနေ့', 2 => 'အင်္ဂါနေ့', 3 => 'ဗုဒ္ဓဟူးနေ့',
        4 => 'ကြာသပတေးနေ့', 5 => 'သောကြာနေ့', 6 => 'စနေနေ့',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();

        $courseIds = Enrollment::query()
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->pluck('course_id');

        $weekStart = now()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);

        $sessions = LiveSession::query()
            ->with(['course:id,title', 'instructor:id,name'])
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', [LiveSession::STATUS_SCHEDULED, LiveSession::STATUS_LIVE])
            ->whereBetween('scheduled_at', [$weekStart, $weekEnd])
            ->orderBy('scheduled_at')
            ->get();

        $assignments = Assignment::query()
            ->with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [$weekStart, $weekEnd])
            ->orderBy('due_at')
            ->get();

        $agendaByDate = [];
        foreach ($sessions as $session) {
            $key = $session->scheduled_at->toDateString();
            $agendaByDate[$key][] = [
                'sort' => $session->scheduled_at->toIso8601String(),
                'time' => LiveSession::myanmarTimeRange($session->scheduled_at, $session->ends_at),
                'title' => 'Live Class — '.$session->title,
                'sub' => 'ဆရာ '.($session->instructor?->name ?? '—').' · '.($session->course?->title ?? ''),
                'col' => '#ef4444',
                'href' => '/student/live-classes/'.$session->id,
                'btn' => 'အသေးစိတ်',
            ];
        }
        foreach ($assignments as $assignment) {
            $key = $assignment->due_at->toDateString();
            $agendaByDate[$key][] = [
                'sort' => $assignment->due_at->toIso8601String(),
                'time' => 'နောက်ဆုံးရက် · '.$this->timeLabel($assignment->due_at),
                'title' => $assignment->title,
                'sub' => ($assignment->course?->title ?? '').' · Assignment တင်သွင်းရန်',
                'col' => '#f59e0b',
                'href' => '/student/assignments/'.$assignment->id,
                'btn' => 'ဖွင့်ရန်',
            ];
        }
        foreach ($agendaByDate as $key => $items) {
            usort($items, fn ($a, $b) => strcmp($a['sort'], $b['sort']));
            $agendaByDate[$key] = array_map(fn ($item) => collect($item)->except('sort')->all(), $items);
        }

        $weekDays = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $agendaByDate) {
            $date = $weekStart->copy()->addDays($offset);
            $key = $date->toDateString();

            return [
                'short' => self::DAY_SHORT[(int) $date->format('w')],
                'name' => self::DAY_NAME[(int) $date->format('w')],
                'day' => (int) $date->format('j'),
                'month' => LiveSession::myanmarMonth((int) $date->format('n')),
                'date' => $key,
                'today' => $date->isToday(),
                'event' => ! empty($agendaByDate[$key]),
            ];
        })->values();

        $deadlines = Assignment::query()
            ->with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->whereNotNull('due_at')
            ->where('due_at', '>=', now())
            ->orderBy('due_at')
            ->limit(5)
            ->get()
            ->map(fn (Assignment $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'course' => $a->course?->title ?? '—',
                'due' => $this->dueLabel($a->due_at),
            ])->values();

        $liveThisWeek = $sessions->map(fn (LiveSession $s) => [
            'id' => $s->id,
            'title' => $s->title,
            'when' => LiveSession::myanmarWhen($s->scheduled_at).' · '.LiveSession::myanmarTimeRange($s->scheduled_at, $s->ends_at).' · '.($s->instructor?->name ?? '—'),
        ])->values();

        return Inertia::render('Student/Schedule/Index', [
            'weekDays' => $weekDays,
            'agendaByDate' => $agendaByDate,
            'deadlines' => $deadlines,
            'liveThisWeek' => $liveThisWeek,
        ]);
    }

    private function timeLabel(Carbon $date): string
    {
        $hour = (int) $date->format('G');
        $daypart = $hour < 12 ? 'မနက်' : ($hour < 16 ? 'နေ့လယ်' : ($hour < 20 ? 'ညနေ' : 'ည'));

        return $daypart.' '.$date->format('g:i');
    }

    private function dueLabel(Carbon $due): string
    {
        $time = $this->timeLabel($due);

        if ($due->isToday()) {
            return 'ယနေ့ · '.$time;
        }
        if ($due->isTomorrow()) {
            return 'မနက်ဖြန် · '.$time;
        }
        $days = now()->diffInDays($due);

        if ($days <= 7) {
            return 'နောက် '.$days.' ရက် · '.$time;
        }

        return LiveSession::myanmarMonth((int) $due->format('n')).' '.$due->format('d').' · '.$time;
    }
}

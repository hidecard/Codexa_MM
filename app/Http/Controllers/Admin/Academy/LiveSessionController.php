<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveSession;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LiveSessionController extends Controller
{
    // ---- Admin ----

    public function index(): Response
    {
        $sessions = LiveSession::query()
            ->with(['course:id,title', 'instructor:id,name'])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (LiveSession $s) => $s->toDisplayArray())
            ->values();

        return Inertia::render('Admin/Academy/Live/Index', [
            'sessions' => $sessions,
            'instructors' => User::role('instructor')->orderBy('name')->get(['id', 'name'])->values(),
            'courses' => Course::orderBy('title')->get(['id', 'title'])->values(),
            'stats' => [
                'total' => LiveSession::count(),
                'upcoming' => LiveSession::where('status', LiveSession::STATUS_SCHEDULED)->count(),
                'live' => LiveSession::where('status', LiveSession::STATUS_LIVE)->count(),
                'ended' => LiveSession::where('status', LiveSession::STATUS_ENDED)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        LiveSession::create($data);

        return back()->with('success', 'Live session စီစဉ်ပြီးပါပြီ။');
    }

    public function update(Request $request, LiveSession $liveSession): RedirectResponse
    {
        $data = $request->validate($this->rules());

        $liveSession->update($data);

        return back()->with('success', 'Live session ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroy(LiveSession $liveSession): RedirectResponse
    {
        $liveSession->delete();

        return back()->with('success', 'Live session ဖျက်ပြီးပါပြီ။');
    }

    public function start(LiveSession $liveSession): RedirectResponse
    {
        if ($liveSession->status !== LiveSession::STATUS_SCHEDULED) {
            return back()->withErrors(['status' => 'စီစဉ်ထားသော session ကိုသာ စတင်နိုင်ပါတယ်။']);
        }

        $liveSession->update(['status' => LiveSession::STATUS_LIVE]);

        return back()->with('success', 'Live session စတင်ပါပြီ။');
    }

    public function end(LiveSession $liveSession): RedirectResponse
    {
        if ($liveSession->status !== LiveSession::STATUS_LIVE) {
            return back()->withErrors(['status' => 'ထုတ်လွှင့်နေသော session ကိုသာ ပြီးဆုံးနိုင်ပါတယ်။']);
        }

        $liveSession->update(['status' => LiveSession::STATUS_ENDED]);

        return back()->with('success', 'Live session ပြီးဆုံးပါပြီ။');
    }

    public function cancel(LiveSession $liveSession): RedirectResponse
    {
        if (! in_array($liveSession->status, [LiveSession::STATUS_SCHEDULED, LiveSession::STATUS_LIVE], true)) {
            return back()->withErrors(['status' => 'ဤ session ကို ဖျက်သိမ်း၍ မရပါ။']);
        }

        $liveSession->update(['status' => LiveSession::STATUS_CANCELLED]);

        return back()->with('success', 'Live session ဖျက်သိမ်းပြီးပါပြီ။');
    }

    public function restore(LiveSession $liveSession): RedirectResponse
    {
        if ($liveSession->status !== LiveSession::STATUS_CANCELLED) {
            return back()->withErrors(['status' => 'ဖျက်သိမ်းထားသော session ကိုသာ ပြန်ဖွင့်နိုင်ပါတယ်။']);
        }

        $liveSession->update(['status' => LiveSession::STATUS_SCHEDULED]);

        return back()->with('success', 'Live session ပြန်ဖွင့်ပြီးပါပြီ။');
    }

    // ---- Instructor (own sessions only) ----

    public function instructorIndex(Request $request): Response
    {
        $sessions = LiveSession::query()
            ->with(['course:id,title', 'instructor:id,name'])
            ->where('instructor_id', $request->user()->id)
            ->whereIn('status', [LiveSession::STATUS_SCHEDULED, LiveSession::STATUS_LIVE])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (LiveSession $s) => $s->toDisplayArray())
            ->values();

        return Inertia::render('Instructor/LiveHost/Index', [
            'sessions' => $sessions,
        ]);
    }

    public function instructorStart(Request $request, LiveSession $liveSession): RedirectResponse
    {
        $this->authorizeOwnSession($request, $liveSession);

        return $this->start($liveSession);
    }

    public function instructorEnd(Request $request, LiveSession $liveSession): RedirectResponse
    {
        $this->authorizeOwnSession($request, $liveSession);

        return $this->end($liveSession);
    }

    // ---- Student (read-only) ----

    public function studentIndex(): Response
    {
        $upcoming = LiveSession::query()
            ->with(['course:id,title', 'instructor:id,name'])
            ->whereIn('status', [LiveSession::STATUS_SCHEDULED, LiveSession::STATUS_LIVE])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (LiveSession $s) => $s->toDisplayArray())
            ->values();

        // Ended sessions surface as recordings. No recording files or view
        // counts exist yet, so views are honestly 0.
        $recorded = LiveSession::query()
            ->with(['course:id,title', 'instructor:id,name'])
            ->where('status', LiveSession::STATUS_ENDED)
            ->orderByDesc('scheduled_at')
            ->get()
            ->map(fn (LiveSession $s) => [
                'title' => $s->title,
                'instructor' => $s->instructor?->name ?? '',
                'date' => $s->scheduled_at?->format('Y-m-d') ?? '',
                'dur' => $this->formatDuration($s->duration_minutes),
                'views' => 0,
                'course' => $s->course_id ?? 0,
            ])
            ->values();

        return Inertia::render('Student/LiveClasses/Index', [
            'upcoming' => $upcoming,
            'recorded' => $recorded,
        ]);
    }

    public function studentShow(LiveSession $liveSession): Response
    {
        if ($liveSession->status === LiveSession::STATUS_CANCELLED) {
            abort(404);
        }

        $liveSession->load(['course:id,title', 'instructor:id,name']);

        return Inertia::render('Student/LiveClasses/Show', [
            'live' => $liveSession->toDisplayArray(),
        ]);
    }

    private function authorizeOwnSession(Request $request, LiveSession $liveSession): void
    {
        if ($liveSession->instructor_id !== $request->user()->id) {
            abort(403, 'မိမိ၏ session ကိုသာ စီမံနိုင်ပါတယ်။');
        }
    }

    private function formatDuration(?int $minutes): string
    {
        if (! $minutes) {
            return '0:00';
        }

        return sprintf('%d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'course_id' => ['nullable', 'exists:courses,id'],
            'instructor_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'meeting_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['sometimes', Rule::in(LiveSession::STATUSES)],
            'max_participants' => ['nullable', 'integer', 'min:1'],
        ];
    }
}

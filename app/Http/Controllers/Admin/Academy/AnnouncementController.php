<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    private const TYPE_LABELS = [
        'general' => 'အထွေထွေ',
        'course' => 'သင်တန်း',
        'live' => 'Live Class',
        'promo' => 'ပရိုမိုးရှင်း',
        'system' => 'စနစ်',
    ];

    private const AUDIENCE_LABELS = [
        'all' => 'ကျောင်းသား အားလုံး',
        'students' => 'ကျောင်းသားများ',
        'instructors' => 'ဆရာများ',
    ];

    public function index(): Response
    {
        // CourseAnnouncement is per-course (course_id is NOT NULL), so admin
        // creates stay course-scoped until a platform-wide announcement model exists.
        $announcements = CourseAnnouncement::query()
            ->with(['course:id,title'])
            ->orderByDesc('is_pinned')
            ->latest('published_at')
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'course_id' => $a->course_id,
                'course_title' => $a->course?->title,
                'type' => $a->type,
                'type_label' => self::TYPE_LABELS[$a->type] ?? $a->type,
                'audience' => $a->audience,
                'audience_label' => self::AUDIENCE_LABELS[$a->audience] ?? $a->audience,
                'pinned' => (bool) $a->is_pinned,
                'date' => optional($a->published_at)?->toDateString() ?? optional($a->created_at)?->toDateString() ?? '',
                'draft' => $a->published_at === null,
            ])->values();

        return Inertia::render('Admin/Academy/Announcements/Index', [
            'announcements' => $announcements,
            'courses' => Course::query()->orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $validated['published_at'] = $request->boolean('publish') ? now() : null;
        CourseAnnouncement::query()->create($validated);

        return back()->with('success', $request->boolean('publish') ? 'Announcement published.' : 'Announcement saved as draft.');
    }

    public function update(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        if ($request->has('publish')) {
            $validated['published_at'] = $request->boolean('publish') ? ($announcement->published_at ?? now()) : null;
        }
        $announcement->update($validated);

        return back()->with('success', 'Announcement updated.');
    }

    public function destroy(CourseAnnouncement $announcement): RedirectResponse
    {
        $announcement->delete();

        return back()->with('success', 'Announcement deleted.');
    }

    public function publish(CourseAnnouncement $announcement): RedirectResponse
    {
        $announcement->update(['published_at' => now()]);

        return back()->with('success', 'Announcement published.');
    }

    public function unpublish(CourseAnnouncement $announcement): RedirectResponse
    {
        $announcement->update(['published_at' => null]);

        return back()->with('success', 'Announcement unpublished.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['sometimes', 'string', Rule::in(CourseAnnouncement::TYPES)],
            'audience' => ['sometimes', 'string', Rule::in(CourseAnnouncement::AUDIENCES)],
            'is_pinned' => ['sometimes', 'boolean'],
        ];
    }
}

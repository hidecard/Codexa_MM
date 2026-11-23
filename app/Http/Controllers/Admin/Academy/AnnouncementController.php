<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        // CourseAnnouncement is per-course (course_id is NOT NULL), so admin
        // creates stay course-scoped until a platform-wide announcement model exists.
        $announcements = CourseAnnouncement::query()
            ->with(['course:id,title'])
            ->latest('published_at')
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'course_id' => $a->course_id,
                'type' => 'သင်တန်း',
                'audience' => $a->course?->title ?? 'ကျောင်းသား အားလုံး',
                'pinned' => false,
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
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);
        $validated['published_at'] = $request->boolean('publish') ? now() : null;
        CourseAnnouncement::query()->create($validated);

        return back()->with('success', $request->boolean('publish') ? 'Announcement published.' : 'Announcement saved as draft.');
    }

    public function update(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);
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
}

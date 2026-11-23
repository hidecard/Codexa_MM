<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseAnnouncement;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = $this->taughtCourseIds($user);

        $announcements = CourseAnnouncement::query()
            ->with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->latest()
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'course_id' => $a->course_id,
                'courseTitle' => $a->course?->title,
                'is_published' => $a->published_at !== null && $a->published_at->lte(now()),
                'published_at' => optional($a->published_at)?->toDateTimeString(),
                'date' => optional($a->published_at ?? $a->created_at)?->toDateString(),
            ])->values();

        $courses = Course::query()
            ->whereIn('id', $courseIds)
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Instructor/Announcements/Index', [
            'announcements' => $announcements,
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'publish' => ['nullable', 'boolean'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        abort_unless($this->teaches($request->user(), $course), 403);

        CourseAnnouncement::create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'published_at' => ($validated['publish'] ?? false) ? now() : null,
        ]);

        return back()->with('success', 'ကြေညာချက် ထည့်ပြီးပါပြီ');
    }

    public function update(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        abort_unless($this->teaches($request->user(), $announcement->course), 403);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        abort_unless($this->teaches($request->user(), $course), 403);

        $announcement->update($validated);

        return back()->with('success', 'ကြေညာချက် ပြင်ဆင်ပြီးပါပြီ');
    }

    public function destroy(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        abort_unless($this->teaches($request->user(), $announcement->course), 403);

        $announcement->delete();

        return back()->with('success', 'ကြေညာချက် ဖျက်ပြီးပါပြီ');
    }

    public function publish(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        abort_unless($this->teaches($request->user(), $announcement->course), 403);

        $announcement->update(['published_at' => now()]);

        return back()->with('success', 'ကြေညာချက် ထုတ်ပြန်ပြီးပါပြီ');
    }

    public function unpublish(Request $request, CourseAnnouncement $announcement): RedirectResponse
    {
        abort_unless($this->teaches($request->user(), $announcement->course), 403);

        $announcement->update(['published_at' => null]);

        return back()->with('success', 'ကြေညာချက် ဖျက်သိမ်းပြီးပါပြီ (Draft)');
    }

    /** IDs of courses the instructor teaches (owner or co-instructor). */
    private function taughtCourseIds(User $user): array
    {
        return Course::query()
            ->where(fn (Builder $q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($user->id)))
            ->pluck('id')
            ->all();
    }

    private function teaches(User $user, ?Course $course): bool
    {
        if ($course === null) {
            return false;
        }

        return $course->instructor_id === $user->id
            || $course->instructors()->whereKey($user->id)->exists();
    }
}

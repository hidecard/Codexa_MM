<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseAnnouncement;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $courseIds = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->pluck('course_id');

        $announcements = CourseAnnouncement::query()
            ->with('course:id,title,slug')
            ->whereIn('course_id', $courseIds)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            // Audience: students see 'all' (default) and 'students';
            // 'instructors' announcements are instructor-only.
            ->whereIn('audience', ['all', 'students'])
            ->orderByDesc('is_pinned')
            ->latest('published_at')
            ->latest('created_at')
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'published_at' => optional($a->published_at ?? $a->created_at)?->toDateTimeString(),
                'category' => $a->type,
                'audience' => $a->audience,
                'pinned' => (bool) $a->is_pinned,
                'course' => $a->course ? [
                    'id' => $a->course->id,
                    'title' => $a->course->title,
                    'slug' => $a->course->slug,
                ] : null,
            ])->values();

        return Inertia::render('Student/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }
}

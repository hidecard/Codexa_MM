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
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->latest('published_at')
            ->latest('created_at')
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'published_at' => optional($a->published_at ?? $a->created_at)?->toDateTimeString(),
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

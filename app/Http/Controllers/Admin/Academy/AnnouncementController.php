<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseAnnouncement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        // CourseAnnouncement is per-course; the admin page lists them with the
        // course as the audience until a platform-wide announcement model exists.
        $announcements = CourseAnnouncement::query()
            ->with(['course:id,title'])
            ->latest('published_at')
            ->get()
            ->map(fn (CourseAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'type' => 'သင်တန်း',
                'audience' => $a->course?->title ?? 'ကျောင်းသား အားလုံး',
                'pinned' => false,
                'date' => optional($a->published_at)?->toDateString() ?? optional($a->created_at)?->toDateString() ?? '',
                'draft' => $a->published_at === null,
            ])->values();

        return Inertia::render('Admin/Academy/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }
}

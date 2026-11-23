<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function index(): Response
    {
        $lessons = Lesson::query()
            ->with(['module:id,course_id,title', 'module.course:id,title'])
            ->orderBy('module_id')
            ->orderBy('position')
            ->get()
            ->map(fn (Lesson $l) => [
                'id' => $l->id,
                'title' => $l->title,
                'course' => $l->module?->course?->title ?? '—',
                'module' => $l->module?->title ?? '—',
                'type' => $l->type,
                'duration' => $l->duration,
                'is_free' => (bool) $l->is_free,
            ])->values();

        return Inertia::render('Admin/Academy/Lessons/Index', [
            'lessons' => $lessons,
        ]);
    }
}

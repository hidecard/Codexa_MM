<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseModule;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(): Response
    {
        $modules = CourseModule::query()
            ->with(['course:id,title'])
            ->withCount('lessons')
            ->orderBy('course_id')
            ->orderBy('position')
            ->get()
            ->map(fn (CourseModule $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'course' => $m->course?->title ?? '—',
                'position' => $m->position,
                'lessons_count' => $m->lessons_count,
                'description' => $m->description,
            ])->values();

        return Inertia::render('Admin/Academy/Modules/Index', [
            'modules' => $modules,
        ]);
    }
}

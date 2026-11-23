<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningPathController extends Controller
{
    public function index(Request $request): Response
    {
        $paths = LearningPath::query()
            ->with(['courses:id,slug,title', 'followers:id'])
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        $progress = $this->courseProgress($request->user()->id, $paths->flatMap->courses->pluck('id')->unique()->all());

        return Inertia::render('Student/Paths/Index', [
            'paths' => $paths->map(fn (LearningPath $path) => $this->toArray($path, $progress, $request->user()->id))->values(),
        ]);
    }

    public function show(Request $request, LearningPath $path): Response
    {
        abort_unless($path->is_published, 404);

        $path->load(['courses', 'followers:id']);
        $progress = $this->courseProgress($request->user()->id, $path->courses->pluck('id')->all());

        $steps = $path->courses->map(function ($course) use ($progress) {
            $lessonCount = Lesson::query()
                ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
                ->where('course_modules.course_id', $course->id)
                ->count();

            return [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
                'progress' => $progress[$course->id] ?? 0,
                'lessons' => $lessonCount,
                'hours' => (int) ceil(($course->duration ?? 0) / 60),
            ];
        })->values();

        return Inertia::render('Student/Paths/Show', [
            'path' => [
                'id' => $path->id,
                'title' => $path->title,
                'goal' => $path->description ?? '',
                'grad' => $path->gradient,
                'glyph' => $path->glyph,
                'months' => $path->duration_label,
                'level' => $path->level,
                'joined' => $path->followers->contains('id', $request->user()->id),
                'steps' => $steps,
                'outcomes' => $path->outcomes ?? [],
            ],
        ]);
    }

    /** Follow/unfollow a path. */
    public function toggleFollow(Request $request, LearningPath $path): RedirectResponse
    {
        $user = $request->user();

        if ($path->followers()->whereKey($user->id)->exists()) {
            $path->followers()->detach($user->id);

            return back()->with('success', 'လမ်းကြောင်းကို လိုက်နာမှု ရပ်လိုက်ပါပြီ');
        }

        $path->followers()->attach($user->id);

        return back()->with('success', 'လမ်းကြောင်းကို လိုက်နာနေပါပြီ');
    }

    private function toArray(LearningPath $path, array $progress, int $userId): array
    {
        return [
            'id' => $path->id,
            'title' => $path->title,
            'goal' => $path->description ?? '',
            'grad' => $path->gradient,
            'glyph' => $path->glyph,
            'months' => $path->duration_label,
            'level' => $path->level,
            'joined' => $path->followers->contains('id', $userId),
            'steps' => $path->courses->map(fn ($course) => [
                'id' => $course->id,
                'title' => $course->title,
                'progress' => $progress[$course->id] ?? 0,
            ])->values(),
            'outcomes' => $path->outcomes ?? [],
        ];
    }

    /** Per-course lesson-completion % for the student (0 when not enrolled). */
    private function courseProgress(int $userId, array $courseIds): array
    {
        if (empty($courseIds)) {
            return [];
        }

        $enrollments = Enrollment::query()
            ->where('student_id', $userId)
            ->whereIn('course_id', $courseIds)
            ->get(['id', 'course_id']);

        if ($enrollments->isEmpty()) {
            return [];
        }

        $lessonCounts = Lesson::query()
            ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
            ->whereIn('course_modules.course_id', $courseIds)
            ->selectRaw('course_modules.course_id as course_id, COUNT(*) as total')
            ->groupBy('course_modules.course_id')
            ->pluck('total', 'course_id');

        $completedCounts = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollments->pluck('id'))
            ->where('is_completed', true)
            ->selectRaw('enrollment_id, COUNT(*) as total')
            ->groupBy('enrollment_id')
            ->pluck('total', 'enrollment_id');

        $progress = [];
        foreach ($enrollments as $enrollment) {
            $total = (int) ($lessonCounts[$enrollment->course_id] ?? 0);
            $progress[$enrollment->course_id] = $total > 0
                ? (int) round(((int) ($completedCounts[$enrollment->id] ?? 0) / $total) * 100)
                : 0;
        }

        return $progress;
    }
}

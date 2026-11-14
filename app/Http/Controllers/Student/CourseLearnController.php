<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseLearnController extends Controller
{
    public function show(Request $request, Course $course): Response
    {
        $enrollment = $this->enrollmentFor($request, $course);
        $course->load(['modules.lessons' => fn ($q) => $q->orderBy('position')]);
        $lessons = $course->modules->flatMap->lessons;
        $progressRows = LessonProgress::query()
            ->where('enrollment_id', $enrollment->id)
            ->get()
            ->keyBy('lesson_id');
        $completedIds = $progressRows->where('is_completed', true)->pluck('lesson_id')->all();
        $completed = count($completedIds);
        $total = $lessons->count();
        $nextLesson = $lessons->first(fn ($l) => ! in_array($l->id, $completedIds, true)) ?? $lessons->first();

        return Inertia::render('Student/Course/Learn', [
            'course' => $course->only(['id', 'title', 'slug', 'short_description']),
            'modules' => $course->modules->map(fn ($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'position' => $m->position,
                'lessons' => $m->lessons->map(fn ($l) => [
                    'id' => $l->id,
                    'title' => $l->title,
                    'duration' => $l->duration,
                    'type' => $l->type,
                    'is_free' => $l->is_free,
                    'is_completed' => in_array($l->id, $completedIds, true),
                    'resume_position' => (int) (data_get($progressRows->get($l->id)?->meta, 'position') ?? 0),
                ])->values(),
            ])->values(),
            'progress' => [
                'completed' => $completed,
                'total' => $total,
                'percent' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
            ],
            'nextLessonId' => $nextLesson?->id,
        ]);
    }

    public function lesson(Request $request, Course $course, Lesson $lesson): Response
    {
        $enrollment = $this->enrollmentFor($request, $course);
        abort_unless($lesson->module && $lesson->module->course_id === $course->id, 404);

        $lesson->load(['module', 'resources' => fn ($q) => $q->select(['id', 'lesson_id', 'original_name', 'file_type', 'file_size'])]);
        $course->load(['modules.lessons' => fn ($q) => $q->orderBy('position')->select(['id', 'module_id', 'title', 'position', 'duration', 'type', 'is_free'])]);
        $progressRows = LessonProgress::query()->where('enrollment_id', $enrollment->id)->get()->keyBy('lesson_id');
        $completedIds = $progressRows->where('is_completed', true)->pluck('lesson_id')->all();
        $currentProgress = $progressRows->get($lesson->id);

        $meta = $lesson->meta ?? [];
        $captions = collect($meta['captions'] ?? [])->filter(fn ($c) => is_array($c) && ! empty($c['src']))->values()->all();
        $hasVideo = $lesson->type === 'video' && ! empty($lesson->getRawOriginal('video_url'));
        $streamUrl = $hasVideo
            ? URL::temporarySignedRoute('student.courses.lesson.stream', now()->addMinutes(30), [
                'course' => $course->id,
                'lesson' => $lesson->id,
            ])
            : null;

        return Inertia::render('Student/Course/Lesson', [
            'course' => $course->only(['id', 'title', 'slug']),
            'modules' => $course->modules->map(fn ($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'lessons' => $m->lessons->map(fn ($l) => [
                    'id' => $l->id,
                    'title' => $l->title,
                    'duration' => $l->duration,
                    'is_completed' => in_array($l->id, $completedIds, true),
                ])->values(),
            ])->values(),
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'content' => $lesson->content,
                'duration' => $lesson->duration,
                'type' => $lesson->type,
                'is_completed' => in_array($lesson->id, $completedIds, true),
                'module' => ['id' => $lesson->module->id, 'title' => $lesson->module->title],
                'resources' => $lesson->resources->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->original_name,
                    'type' => $r->file_type,
                    'size' => $r->file_size,
                ])->values(),
                'stream_url' => $streamUrl,
                'captions' => $captions,
                'resume_position' => (int) (data_get($currentProgress?->meta, 'position') ?? $currentProgress?->watch_time ?? 0),
                'playback_speeds' => [0.75, 1, 1.25, 1.5, 1.75, 2],
            ],
        ]);
    }

    public function progress(Request $request, Course $course, Lesson $lesson)
    {
        $enrollment = $this->enrollmentFor($request, $course);
        abort_unless($lesson->module && $lesson->module->course_id === $course->id, 404);

        $validated = $request->validate([
            'position' => ['nullable', 'numeric', 'min:0'],
            'watch_time' => ['nullable', 'integer', 'min:0'],
        ]);

        $existing = LessonProgress::query()->firstWhere([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);
        $meta = $existing?->meta ?? [];
        $meta['position'] = (float) ($validated['position'] ?? data_get($meta, 'position', 0));

        LessonProgress::query()->updateOrCreate(
            ['enrollment_id' => $enrollment->id, 'lesson_id' => $lesson->id],
            [
                'watch_time' => max((int) ($existing?->watch_time ?? 0), (int) ($validated['watch_time'] ?? 0), (int) floor($meta['position'])),
                'meta' => $meta,
            ]
        );

        return response()->noContent();
    }

    public function complete(Request $request, Course $course, Lesson $lesson)
    {
        $enrollment = $this->enrollmentFor($request, $course);
        abort_unless($lesson->module && $lesson->module->course_id === $course->id, 404);

        $validated = $request->validate([
            'position' => ['nullable', 'numeric', 'min:0'],
            'watch_time' => ['nullable', 'integer', 'min:0'],
        ]);
        $existing = LessonProgress::query()->firstWhere([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);
        $meta = $existing?->meta ?? [];
        if (array_key_exists('position', $validated)) {
            $meta['position'] = (float) $validated['position'];
        }

        LessonProgress::query()->updateOrCreate(
            ['enrollment_id' => $enrollment->id, 'lesson_id' => $lesson->id],
            [
                'is_completed' => true,
                'completed_at' => now(),
                'watch_time' => max((int) ($existing?->watch_time ?? 0), (int) ($validated['watch_time'] ?? 0), (int) floor((float) ($meta['position'] ?? 0))),
                'meta' => $meta,
            ]
        );

        $this->recalculateCompletion($course, $enrollment);

        return back()->with('success', 'Lesson marked as complete.');
    }

    private function recalculateCompletion(Course $course, Enrollment $enrollment): void
    {
        app(\App\Services\CertificateService::class)->recalculateEnrollmentCompletion($enrollment);
    }

    public function stream(Request $request, Course $course, Lesson $lesson): StreamedResponse
    {
        $this->enrollmentFor($request, $course);
        abort_unless($lesson->module && $lesson->module->course_id === $course->id, 404);
        $path = $lesson->getRawOriginal('video_url');
        abort_unless(is_string($path) && $path !== '', 404);
        abort_unless(Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    private function enrollmentFor(Request $request, Course $course): Enrollment
    {
        $enrollment = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        abort_unless($enrollment, 403, 'You are not enrolled in this course.');

        return $enrollment;
    }
}

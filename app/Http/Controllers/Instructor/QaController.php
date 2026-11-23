<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseQuestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QaController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = Course::query()
            ->where(fn (Builder $q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($user->id)))
            ->pluck('id');

        $questions = CourseQuestion::query()
            ->with(['student:id,name', 'course:id,title', 'lesson:id,title'])
            ->whereIn('course_id', $courseIds)
            ->latest()
            ->get()
            ->map(fn (CourseQuestion $q) => [
                'id' => $q->id,
                'student' => $q->student?->name ?? 'ကျောင်းသား',
                'courseId' => $q->course_id,
                'courseTitle' => $q->course?->title ?? '',
                'lesson' => $q->lesson?->title ?? '',
                'q' => $q->question,
                'time' => optional($q->created_at)?->toDateString(),
                'answer' => $q->answer ?? '',
                'is_answered' => (bool) $q->is_answered,
            ])->values();

        return Inertia::render('Instructor/QA/Index', [
            'questions' => $questions,
        ]);
    }

    public function answer(Request $request, CourseQuestion $question): RedirectResponse
    {
        $validated = $request->validate([
            'answer' => ['required', 'string', 'max:5000'],
        ]);

        abort_unless($this->teaches($request->user(), $question->course), 403);

        $question->update([
            'answer' => $validated['answer'],
            'answered_by' => $request->user()->id,
            'answered_at' => now(),
            'is_answered' => true,
        ]);

        return back()->with('success', 'အဖြေ ပို့ပြီးပါပြီ');
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

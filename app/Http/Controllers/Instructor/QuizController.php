<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courses = Course::query()
            ->where(fn ($q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($user->id)))
            ->pluck('id');

        $quizzes = Quiz::query()
            ->with(['course:id,title'])
            ->withCount(['questions', 'attempts'])
            ->whereIn('course_id', $courses)
            ->latest()
            ->get()
            ->map(fn (Quiz $q) => [
                'id' => $q->id,
                'title' => $q->title,
                'pass_mark' => $q->pass_mark,
                'time_limit' => $q->time_limit,
                'questions_count' => $q->questions_count,
                'attempts_count' => $q->attempts_count,
                'course' => $q->course ? ['id' => $q->course->id, 'title' => $q->course->title] : null,
            ])->values();

        $courseOptions = Course::query()->whereIn('id', $courses)->get(['id', 'title']);

        return Inertia::render('Instructor/Quizzes/Index', [
            'quizzes' => $quizzes,
            'courses' => $courseOptions,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $courses = Course::query()
            ->where(fn ($q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($user->id)))
            ->get(['id', 'title']);

        return Inertia::render('Instructor/Quizzes/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pass_mark' => ['required', 'integer', 'min:0', 'max:100'],
            'time_limit' => ['nullable', 'integer', 'min:1', 'max:600'],
            'shuffle_questions' => ['boolean'],
            'show_correct_answers' => ['boolean'],
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $this->authorize('update', $course);

        Quiz::create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'pass_mark' => $validated['pass_mark'],
            'time_limit' => $validated['time_limit'] ?? null,
            'shuffle_questions' => (bool) ($validated['shuffle_questions'] ?? false),
            'show_correct_answers' => (bool) ($validated['show_correct_answers'] ?? false),
        ]);

        return back()->with('success', 'Quiz created.');
    }

    public function show(Request $request, Quiz $quiz): Response
    {
        $this->authorize('update', $quiz);

        $quiz->load([
            'course:id,title',
            'questions:id,quiz_id,question,type,points,position,explanation',
            'questions.options:id,question_id,option_text,is_correct,position',
        ]);

        return Inertia::render('Instructor/Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'pass_mark' => $quiz->pass_mark,
                'time_limit' => $quiz->time_limit,
                'shuffle_questions' => (bool) $quiz->shuffle_questions,
                'show_correct_answers' => (bool) $quiz->show_correct_answers,
                'course' => $quiz->course ? ['id' => $quiz->course->id, 'title' => $quiz->course->title] : null,
                'questions' => $quiz->questions->map(fn (QuizQuestion $q) => [
                    'id' => $q->id,
                    'question' => $q->question,
                    'type' => $q->type,
                    'points' => $q->points,
                    'position' => $q->position,
                    'explanation' => $q->explanation,
                    'options' => $q->options->map(fn ($o) => [
                        'id' => $o->id,
                        'text' => $o->option_text,
                        'is_correct' => (bool) $o->is_correct,
                        'position' => $o->position,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function update(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pass_mark' => ['required', 'integer', 'min:0', 'max:100'],
            'time_limit' => ['nullable', 'integer', 'min:1', 'max:600'],
            'shuffle_questions' => ['boolean'],
            'show_correct_answers' => ['boolean'],
        ]);

        $quiz->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'pass_mark' => $validated['pass_mark'],
            'time_limit' => $validated['time_limit'] ?? null,
            'shuffle_questions' => (bool) ($validated['shuffle_questions'] ?? false),
            'show_correct_answers' => (bool) ($validated['show_correct_answers'] ?? false),
        ]);

        return back()->with('success', 'Quiz updated.');
    }

    public function destroy(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return redirect()->route('instructor.quizzes.index')->with('success', 'Quiz deleted.');
    }

    public function results(Request $request, Quiz $quiz): Response
    {
        $this->authorize('viewResults', $quiz);

        $attempts = QuizAttempt::query()
            ->with(['student:id,name,email', 'answers'])
            ->where('quiz_id', $quiz->id)
            ->latest('completed_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Instructor/Quizzes/Results', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'pass_mark' => $quiz->pass_mark,
            ],
            'attempts' => $attempts->map(fn (QuizAttempt $a) => [
                'id' => $a->id,
                'student' => $a->student ? ['id' => $a->student->id, 'name' => $a->student->name, 'email' => $a->student->email] : null,
                'score' => (float) $a->score,
                'status' => $a->status,
                'started_at' => optional($a->started_at)->toDateTimeString(),
                'completed_at' => optional($a->completed_at)->toDateTimeString(),
                'answers_count' => $a->answers_count ?? 0,
            ])->values(),
        ]);
    }

    public function attemptDetail(Request $request, Quiz $quiz, QuizAttempt $attempt): Response
    {
        $this->authorize('viewResults', $quiz);
        abort_unless($attempt->quiz_id === $quiz->id, 404);

        $attempt->load([
            'student:id,name,email',
            'answers.question.options',
        ]);

        return Inertia::render('Instructor/Quizzes/AttemptDetail', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'pass_mark' => $quiz->pass_mark,
                'show_correct_answers' => (bool) $quiz->show_correct_answers,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'student' => $attempt->student ? ['id' => $attempt->student->id, 'name' => $attempt->student->name, 'email' => $attempt->student->email] : null,
                'score' => (float) $attempt->score,
                'status' => $attempt->status,
                'started_at' => optional($attempt->started_at)->toDateTimeString(),
                'completed_at' => optional($attempt->completed_at)->toDateTimeString(),
                'answers' => $attempt->answers->map(fn (QuizAnswer $a) => [
                    'question_id' => $a->question_id,
                    'question' => $a->question?->question,
                    'question_type' => $a->question?->type,
                    'points' => $a->question?->points,
                    'explanation' => $a->question?->explanation,
                    'answer' => $a->answer,
                    'is_correct' => $a->is_correct,
                    'correct_option' => $a->question?->options->firstWhere('is_correct', true)?->option_text,
                    'options' => $a->question?->options->map(fn ($o) => ['id' => $o->id, 'text' => $o->option_text, 'is_correct' => (bool) $o->is_correct])->values(),
                ])->values(),
            ],
        ]);
    }
}

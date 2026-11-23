<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\QuizQuestion;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(): Response
    {
        // The admin quiz page lists individual questions (prototype style).
        $questions = QuizQuestion::query()
            ->with(['quiz:id,title,course_id', 'quiz.course:id,title', 'options:id,question_id,option_text,is_correct,position'])
            ->latest()
            ->get()
            ->map(function (QuizQuestion $q) {
                $options = $q->options->sortBy('position')->values();

                return [
                    'id' => $q->id,
                    'course' => $q->quiz?->course?->title ?? $q->quiz?->title ?? '—',
                    'q' => $q->question,
                    'options' => $options->map(fn ($o) => $o->option_text)->values()->all(),
                    'correct' => max(0, $options->search(fn ($o) => (bool) $o->is_correct)),
                ];
            })->values();

        return Inertia::render('Admin/Academy/Quizzes/Index', [
            'questions' => $questions,
        ]);
    }
}

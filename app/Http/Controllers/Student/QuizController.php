<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Services\CertificateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function show(Request $request, Quiz $quiz): Response
    {
        $this->authorize('view', $quiz);

        $quiz->load([
            'course:id,title',
            'questions:id,quiz_id,question,type,points,position,explanation',
            'questions.options:id,question_id,option_text,position',
        ]);

        $attempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->first();

        return Inertia::render('Student/Quizzes/Show', [
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
                    'explanation' => $q->explanation,
                    'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'text' => $o->option_text])->values(),
                ])->values(),
            ],
            'activeAttempt' => $attempt ? [
                'id' => $attempt->id,
                'started_at' => optional($attempt->started_at)->toDateTimeString(),
            ] : null,
        ]);
    }

    public function start(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorize('attempt', $quiz);

        $enrollment = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $quiz->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->firstOrFail();

        $existingAttempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.quizzes.show', $quiz);
        }

        $attempt = QuizAttempt::query()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $request->user()->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return redirect()->route('student.quizzes.show', $quiz);
    }

    public function submit(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorize('attempt', $quiz);

        $attempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'integer', 'exists:quiz_questions,id'],
            'answers.*.answer' => ['required'],
        ]);

        $quiz->load('questions.options');
        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($validated['answers'] as $answerData) {
            $question = $quiz->questions->firstWhere('id', $answerData['question_id']);
            if (! $question) {
                continue;
            }

            $totalPoints += $question->points;

            $isCorrect = $this->evaluateAnswer($question, $answerData['answer']);
            $earnedPoints += $isCorrect ? $question->points : 0;

            QuizAnswer::query()->create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'answer' => $answerData['answer'],
                'is_correct' => $isCorrect,
            ]);
        }

        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;
        $passed = $score >= $quiz->pass_mark;

        $attempt->update([
            'score' => $score,
            'status' => $passed ? 'passed' : 'failed',
            'completed_at' => now(),
        ]);

        $enrollment = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $quiz->course_id)
            ->first();
        if ($enrollment) {
            app(CertificateService::class)->recalculateEnrollmentCompletion($enrollment);
        }

        return redirect()->route('student.quizzes.results', ['quiz' => $quiz, 'attempt' => $attempt]);
    }

    public function results(Request $request, Quiz $quiz, QuizAttempt $attempt): Response
    {
        $this->authorize('viewResults', $quiz);
        abort_unless($attempt->quiz_id === $quiz->id, 404);
        abort_unless($attempt->student_id === $request->user()->id, 403);

        $attempt->load([
            'answers.question.options',
        ]);

        return Inertia::render('Student/Quizzes/Results', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'pass_mark' => $quiz->pass_mark,
                'show_correct_answers' => (bool) $quiz->show_correct_answers,
            ],
            'attempt' => [
                'id' => $attempt->id,
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
                    'options' => $a->question?->options->map(fn ($o) => ['id' => $o->id, 'text' => $o->option_text, 'is_correct' => $quiz->show_correct_answers ? $o->is_correct : false])->values(),
                ])->values(),
            ],
        ]);
    }

    private function evaluateAnswer(QuizQuestion $question, mixed $answer): bool
    {
        switch ($question->type) {
            case 'single_choice':
            case 'true_false':
                $correctOption = $question->options->firstWhere('is_correct', true);

                return $correctOption && (string) $correctOption->id === (string) $answer;

            case 'multiple_choice':
                $correctOptions = $question->options->where('is_correct', true)->pluck('id')->map(fn ($id) => (string) $id)->sort()->values();
                $selectedOptions = collect(is_array($answer) ? $answer : [$answer])
                    ->map(fn ($id) => (string) $id)
                    ->sort()
                    ->values();

                return $correctOptions->count() === $selectedOptions->count() &&
                    $correctOptions->diff($selectedOptions)->isEmpty();

            case 'short_answer':
                $correctOption = $question->options->firstWhere('is_correct', true);
                if (! $correctOption) {
                    return false;
                }

                return strtolower(trim((string) $answer)) === strtolower(trim($correctOption->option_text));

            default:
                return false;
        }
    }
}

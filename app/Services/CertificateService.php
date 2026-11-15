<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Certificate;
use App\Models\CertificateVerification;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CertificateService
{
    public function issueForEnrollment(Enrollment $enrollment): ?Certificate
    {
        if ($enrollment->status !== 'completed') {
            return null;
        }

        return DB::transaction(function () use ($enrollment) {
            $existing = Certificate::query()
                ->where('enrollment_id', $enrollment->id)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $this->ensureVerification($existing);

                return $existing;
            }

            $certificate = Certificate::create([
                'enrollment_id' => $enrollment->id,
                'certificate_number' => $this->uniqueCertificateNumber(),
                'issued_at' => now(),
            ]);

            $this->ensureVerification($certificate);

            return $certificate;
        });
    }

    public function recalculateEnrollmentCompletion(Enrollment $enrollment): void
    {
        $courseId = $enrollment->course_id;
        $totalLessons = Lesson::query()->whereHas('module', fn ($q) => $q->where('course_id', $courseId))->count();
        $completedLessons = LessonProgress::query()->where('enrollment_id', $enrollment->id)->where('is_completed', true)->count();
        $lessonsDone = $totalLessons === 0 || $completedLessons >= $totalLessons;

        $requiredAssignmentIds = Assignment::query()->where('course_id', $courseId)->pluck('id');
        $assignmentsDone = true;
        if ($requiredAssignmentIds->isNotEmpty()) {
            $gradedCount = Submission::query()
                ->where('student_id', $enrollment->student_id)
                ->whereIn('assignment_id', $requiredAssignmentIds)
                ->whereIn('status', ['submitted', 'graded', 'returned'])
                ->distinct('assignment_id')
                ->count('assignment_id');
            $assignmentsDone = $gradedCount >= $requiredAssignmentIds->count();
        }

        $requiredQuizIds = Quiz::query()->where('course_id', $courseId)->pluck('id');
        $quizzesDone = true;
        if ($requiredQuizIds->isNotEmpty()) {
            $passedCount = QuizAttempt::query()
                ->where('student_id', $enrollment->student_id)
                ->whereIn('quiz_id', $requiredQuizIds)
                ->where('status', 'passed')
                ->distinct('quiz_id')
                ->count('quiz_id');
            $quizzesDone = $passedCount >= $requiredQuizIds->count();
        }

        $allDone = $lessonsDone && $assignmentsDone && $quizzesDone;
        if ($allDone && $enrollment->status !== 'completed') {
            $enrollment->forceFill(['status' => 'completed', 'completed_at' => now()])->save();
        }

        $enrollment->refresh();
        if ($enrollment->status === 'completed') {
            $this->issueForEnrollment($enrollment);
        }
    }

    private function ensureVerification(Certificate $certificate): CertificateVerification
    {
        return CertificateVerification::query()->firstOrCreate(
            ['certificate_id' => $certificate->id],
            ['verification_code' => $this->uniqueVerificationCode()]
        );
    }

    private function uniqueCertificateNumber(): string
    {
        do {
            $number = 'CDX-'.now()->format('Y').'-'.strtoupper(Str::random(8));
        } while (Certificate::query()->where('certificate_number', $number)->exists());

        return $number;
    }

    private function uniqueVerificationCode(): string
    {
        do {
            $code = strtoupper(Str::random(12));
        } while (CertificateVerification::query()->where('verification_code', $code)->exists());

        return $code;
    }
}

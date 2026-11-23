<?php

namespace App\Observers;

use App\Models\Enrollment;
use App\Support\ActivityLog;

/**
 * Logs enrollment changes to system_logs: creation (pending from
 * checkout, active from free enroll or payment approval) and every
 * status transition made through the model (activation, completion,
 * cancellation). Refund-driven revocations use a query-builder update
 * (CoursePayment::markRefunded), which fires no model events; those are
 * covered by the payment/refund entries logged at the decision point.
 */
class EnrollmentObserver
{
    public function created(Enrollment $enrollment): void
    {
        if ($enrollment->status === 'active') {
            ActivityLog::record('enrollment.activated', $this->message($enrollment, 'activated'), $enrollment, context: $this->context($enrollment));

            return;
        }

        ActivityLog::record('enrollment.created', $this->message($enrollment, 'created'), $enrollment, context: $this->context($enrollment));
    }

    public function updated(Enrollment $enrollment): void
    {
        if (! $enrollment->wasChanged('status')) {
            return;
        }

        $verb = match ($enrollment->status) {
            'active' => 'activated',
            'completed' => 'completed',
            'refunded' => 'refunded',
            'cancelled' => 'cancelled',
            default => $enrollment->status,
        };

        ActivityLog::record('enrollment.'.$verb, $this->message($enrollment, $verb), $enrollment, context: $this->context($enrollment));
    }

    private function message(Enrollment $enrollment, string $verb): string
    {
        $student = $enrollment->student?->name ?? 'Student #'.$enrollment->student_id;
        $course = $enrollment->course?->title ?? 'Course #'.$enrollment->course_id;

        return 'Enrollment '.$verb.': '.$student.' → '.$course;
    }

    /** @return array<string, mixed> */
    private function context(Enrollment $enrollment): array
    {
        return ['subject' => $enrollment->course?->title ?? 'Enrollment'];
    }
}

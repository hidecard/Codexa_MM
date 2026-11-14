<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function view(User $user, Submission $submission): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($submission->student_id === $user->id) {
            return true;
        }
        $submission->loadMissing('assignment.course');
        $course = $submission->assignment?->course;
        return $user->hasRole('instructor') && $course && ($course->instructor_id === $user->id || $course->instructors()->whereKey($user->id)->exists());
    }

    public function submit(User $user, Submission $submission): bool
    {
        return $user->hasRole('student') && $submission->student_id === $user->id;
    }

    public function grade(User $user, Submission $submission): bool
    {
        if (! $user->can('grades.manage')) {
            return false;
        }
        if ($user->hasRole('admin')) {
            return true;
        }
        $submission->loadMissing('assignment.course');
        $course = $submission->assignment?->course;
        return $user->hasRole('instructor') && $course && ($course->instructor_id === $user->id || $course->instructors()->whereKey($user->id)->exists());
    }
}

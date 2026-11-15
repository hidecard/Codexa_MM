<?php

namespace App\Policies;

use App\Models\QuizAttempt;
use App\Models\User;

class QuizAttemptPolicy
{
    public function view(User $user, QuizAttempt $attempt): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($attempt->student_id === $user->id) {
            return true;
        }

        $attempt->loadMissing('quiz.course');
        $course = $attempt->quiz?->course;

        return $user->hasRole('instructor') && $course && ($course->instructor_id === $user->id || $course->instructors()->whereKey($user->id)->exists());
    }

    public function create(User $user, QuizAttempt $attempt): bool
    {
        return $user->hasRole('student') && $attempt->student_id === $user->id;
    }

    public function submit(User $user, QuizAttempt $attempt): bool
    {
        return $user->hasRole('student') && $attempt->student_id === $user->id && $attempt->status === 'in_progress';
    }
}

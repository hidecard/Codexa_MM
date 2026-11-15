<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['student', 'instructor', 'admin']);
    }

    public function view(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('instructor')) {
            return $this->instructorOwnsCourse($user, $quiz);
        }

        if ($user->hasRole('student')) {
            return $user->enrollments()
                ->where('course_id', $quiz->course_id)
                ->whereIn('status', ['active', 'completed'])
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('assignments.manage') && $user->hasAnyRole(['instructor', 'admin']);
    }

    public function update(User $user, Quiz $quiz): bool
    {
        return $user->can('assignments.manage') && ($user->hasRole('admin') || $this->instructorOwnsCourse($user, $quiz));
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        return $this->update($user, $quiz);
    }

    public function attempt(User $user, Quiz $quiz): bool
    {
        if (! $user->hasRole('student')) {
            return false;
        }

        return $user->enrollments()
            ->where('course_id', $quiz->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();
    }

    public function viewResults(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('instructor')) {
            return $this->instructorOwnsCourse($user, $quiz);
        }

        if ($user->hasRole('student')) {
            return $user->enrollments()
                ->where('course_id', $quiz->course_id)
                ->whereIn('status', ['active', 'completed'])
                ->exists();
        }

        return false;
    }

    private function instructorOwnsCourse(User $user, Quiz $quiz): bool
    {
        $course = $quiz->relationLoaded('course') ? $quiz->course : $quiz->course()->first();
        if (! $course) {
            return false;
        }

        return $course->instructor_id === $user->id
            || $course->instructors()->whereKey($user->id)->exists();
    }
}

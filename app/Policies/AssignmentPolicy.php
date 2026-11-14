<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['student', 'instructor', 'admin']);
    }

    public function view(User $user, Assignment $assignment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('instructor')) {
            return $this->instructorOwnsCourse($user, $assignment);
        }

        if ($user->hasRole('student')) {
            return $user->enrollments()
                ->where('course_id', $assignment->course_id)
                ->whereIn('status', ['active', 'completed'])
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('assignments.manage') && $user->hasAnyRole(['instructor', 'admin']);
    }

    public function update(User $user, Assignment $assignment): bool
    {
        return $user->can('assignments.manage') && ($user->hasRole('admin') || $this->instructorOwnsCourse($user, $assignment));
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        return $this->update($user, $assignment);
    }

    private function instructorOwnsCourse(User $user, Assignment $assignment): bool
    {
        $course = $assignment->relationLoaded('course') ? $assignment->course : $assignment->course()->first();
        if (! $course) {
            return false;
        }
        return $course->instructor_id === $user->id
            || $course->instructors()->whereKey($user->id)->exists();
    }
}

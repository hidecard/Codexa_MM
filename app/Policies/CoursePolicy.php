<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('courses.view');
    }

    public function view(User $user, Course $course): bool
    {
        if ($user->can('courses.view')) {
            return true;
        }

        return $this->owns($user, $course);
    }

    public function create(User $user): bool
    {
        return $user->can('courses.create');
    }

    public function update(User $user, Course $course): bool
    {
        return $user->can('courses.update') && ($user->hasRole('admin') || $this->owns($user, $course));
    }

    public function delete(User $user, Course $course): bool
    {
        return $user->can('courses.delete') && ($user->hasRole('admin') || $this->owns($user, $course));
    }

    private function owns(User $user, Course $course): bool
    {
        return $course->instructor_id === $user->id
            || $course->instructors()->whereKey($user->id)->exists();
    }
}

<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('projects.view') || $user->can('projects.view-own');
    }

    public function view(User $user, Project $project): bool
    {
        if ($user->can('projects.view')) {
            return true;
        }

        if ($user->hasRole('client')) {
            return $project->client->user_id === $user->id;
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('projects.create');
    }

    public function update(User $user, Project $project): bool
    {
        if (($user->can('projects.update') || $user->can('projects.manage')) && $user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('client')) {
            return $project->client->user_id === $user->id;
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function transition(User $user, Project $project): bool
    {
        return $user->hasRole('admin') && ($user->can('projects.update') || $user->can('projects.manage'));
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->can('projects.delete') && $user->hasRole('admin');
    }
}

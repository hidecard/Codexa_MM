<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);
        $projects = Project::query()
            ->with(['client:id,company_name', 'members.user:id,name,email'])
            ->filter($request->only(['status', 'client_id', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Projects/Index', [
            'projects' => $projects,
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
            'filters' => $request->only(['status', 'client_id', 'search']),
            'statuses' => ['inquiry', 'reviewing', 'quoted', 'approved', 'planning', 'in_progress', 'testing', 'client_review', 'completed', 'cancelled', 'on_hold'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Admin/Solutions/Projects/Create', [
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
            'statuses' => ['inquiry', 'reviewing', 'quoted', 'approved', 'planning', 'in_progress', 'testing', 'client_review', 'completed', 'cancelled', 'on_hold'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Project::class);
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:inquiry,reviewing,quoted,approved,planning,in_progress,testing,client_review,completed,cancelled,on_hold'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'member_ids' => ['nullable', 'array'],
            'member_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = $validated['member_ids'] ?? [];
        unset($validated['member_ids']);

        $project = Project::create($validated);

        if (! empty($memberIds)) {
            foreach ($memberIds as $userId) {
                $project->members()->create(['user_id' => $userId, 'role' => 'member']);
            }
        }

        return redirect()->route('admin.solutions.projects.index')->with('success', 'Project created.');
    }

    public function show(Request $request, Project $project): Response
    {
        $this->authorize('view', $project);
        $project->load([
            'client.user:id,name,email',
            'members.user:id,name,email',
            'milestones.tasks.assignee:id,name,email',
            'documents.uploadedBy:id,name',
            'updates.user:id,name',
            'quotations',
            'invoices',
            'supportTickets',
        ]);

        return Inertia::render('Admin/Solutions/Projects/Show', [
            'project' => $project,
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
            'statuses' => ['inquiry', 'reviewing', 'quoted', 'approved', 'planning', 'in_progress', 'testing', 'client_review', 'completed', 'cancelled', 'on_hold'],
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:inquiry,reviewing,quoted,approved,planning,in_progress,testing,client_review,completed,cancelled,on_hold'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'budget' => ['nullable', 'numeric', 'min:0'],
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated.');
    }

    public function addMember(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['required', 'string', 'max:255'],
        ]);

        $project->members()->create($validated);

        return back()->with('success', 'Member added.');
    }

    public function removeMember(Request $request, Project $project, $memberId): RedirectResponse
    {
        $this->authorize('update', $project);
        $project->members()->where('id', $memberId)->delete();

        return back()->with('success', 'Member removed.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);
        $project->delete();

        return redirect()->route('admin.solutions.projects.index')->with('success', 'Project deleted.');
    }
}

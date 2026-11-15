<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUpdate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Projects/Index', [
                'projects' => collect(),
            ]);
        }

        $projects = $client->projects()
            ->with(['members.user:id,name,email', 'milestones.tasks.assignee:id,name,email'])
            ->filter($request->only(['status', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['status', 'search']),
            'statuses' => ['inquiry', 'reviewing', 'quoted', 'approved', 'planning', 'in_progress', 'testing', 'client_review', 'completed', 'cancelled', 'on_hold'],
        ]);
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

        return Inertia::render('Client/Projects/Show', [
            'project' => $project,
        ]);
    }

    public function addUpdate(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $validated['project_id'] = $project->id;
        $validated['user_id'] = $request->user()->id;
        ProjectUpdate::create($validated);

        return back()->with('success', 'Update added.');
    }
}

<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ProjectTask;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Tasks/Index', [
                'tasks' => collect(),
            ]);
        }

        $tasks = ProjectTask::query()
            ->whereHas('milestone.project', fn ($q) => $q->where('client_id', $client->id))
            ->with(['milestone:id,title,project_id', 'milestone.project:id,title', 'assignee:id,name,email'])
            ->filter($request->only(['status', 'priority', 'search']))
            ->orderBy('priority', 'desc')
            ->orderBy('due_date')
            ->paginate(20);

        return Inertia::render('Client/Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority', 'search']),
            'statuses' => ['todo', 'in_progress', 'review', 'completed', 'cancelled'],
            'priorities' => [1 => 'Low', 2 => 'Medium', 3 => 'High', 4 => 'Urgent'],
        ]);
    }
}

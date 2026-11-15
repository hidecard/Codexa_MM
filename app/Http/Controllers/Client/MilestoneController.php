<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ProjectMilestone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MilestoneController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Milestones/Index', [
                'milestones' => collect(),
            ]);
        }

        $milestones = ProjectMilestone::query()
            ->whereHas('project', fn ($q) => $q->where('client_id', $client->id))
            ->with(['project:id,title,client_id', 'tasks.assignee:id,name,email'])
            ->orderBy('start_date')
            ->paginate(20);

        return Inertia::render('Client/Milestones/Index', [
            'milestones' => $milestones,
        ]);
    }
}

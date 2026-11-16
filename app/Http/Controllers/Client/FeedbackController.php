<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientFeedback;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Feedback/Index', [
                'feedback' => collect(),
            ]);
        }

        $feedback = ClientFeedback::query()
            ->where('client_id', $client->id)
            ->whereHas('project', fn ($q) => $q->where('client_id', $client->id))
            ->with('project:id,title')
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Feedback/Index', [
            'feedback' => $feedback,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Feedback/Create', [
                'projects' => collect(),
            ]);
        }

        $projects = Project::query()
            ->where('client_id', $client->id)
            ->whereIn('status', ['completed', 'client_review'])
            ->get(['id', 'title']);

        return Inertia::render('Client/Feedback/Create', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return back()->with('error', 'Client profile not found.');
        }

        $validated = $request->validate([
            'project_id' => [
                'required',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->where('client_id', $client->id)),
            ],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
        ]);

        $validated['client_id'] = $client->id;
        ClientFeedback::create($validated);

        return redirect()->route('client.feedback.index')->with('success', 'Feedback submitted.');
    }
}

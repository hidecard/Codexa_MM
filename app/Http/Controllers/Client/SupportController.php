<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Support/Index', [
                'tickets' => collect(),
            ]);
        }

        $tickets = $client->supportTickets()
            ->with(['project:id,title', 'messages.user:id,name'])
            ->filter($request->only(['status', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Support/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'search']),
            'statuses' => ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'],
            'projects' => Project::query()->where('client_id', $client->id)->get(['id', 'title']),
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
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'priority' => ['nullable', 'integer', 'min:1', 'max:4'],
        ]);

        $validated['client_id'] = $user->id;
        $validated['status'] = 'open';
        $validated['priority'] = $validated['priority'] ?? 1;

        $ticket = SupportTicket::create($validated);

        SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        return redirect()->route('client.support.index')->with('success', 'Support ticket created.');
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        $this->authorize('view', $ticket);
        $ticket->load(['project:id,title', 'messages.user:id,name', 'client:id,name,email']);

        return Inertia::render('Client/Support/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function addMessage(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $this->authorize('update', $ticket);
        $validated = $request->validate([
            'message' => ['required', 'string'],
        ]);

        SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        return back()->with('success', 'Message sent.');
    }
}

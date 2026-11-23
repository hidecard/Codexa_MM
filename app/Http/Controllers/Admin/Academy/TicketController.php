<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        return Inertia::render('Admin/Academy/Tickets/Index', [
            'tickets' => $this->ticketRows(),
            'selectedTicket' => null,
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['client:id,name', 'messages.user:id,name']);
        $name = $ticket->client?->name ?? 'Unknown';
        $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

        return Inertia::render('Admin/Academy/Tickets/Index', [
            'tickets' => $this->ticketRows(),
            'selectedTicket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'student' => $name,
                'init' => $initials ?: '?',
                'col' => self::COLORS[$ticket->client_id % count(self::COLORS)],
                'date' => optional($ticket->created_at)?->toDateString() ?? '',
                'status' => $this->pageStatus($ticket->status),
                'priority' => $ticket->priority >= 3 ? 'high' : ($ticket->priority === 2 ? 'medium' : 'low'),
                'messages' => $ticket->messages->map(fn (SupportTicketMessage $m) => [
                    'id' => $m->id,
                    'author' => $m->user?->name ?? 'Unknown',
                    'is_admin' => (bool) $m->user?->hasRole('admin'),
                    'is_internal' => (bool) $m->is_internal,
                    'message' => $m->message,
                    'date' => optional($m->created_at)?->toDateString() ?? '',
                ])->values(),
            ],
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'is_internal' => ['boolean'],
        ]);
        SupportTicketMessage::query()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_internal' => (bool) ($validated['is_internal'] ?? false),
        ]);
        // Replying to a fresh ticket moves it into progress.
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Reply sent.');
    }

    public function status(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['open', 'in_progress', 'waiting_client', 'resolved', 'closed'])],
        ]);
        $ticket->update(['status' => $validated['status']]);

        return back()->with('success', 'Ticket status updated.');
    }

    private function ticketRows(): Collection
    {
        return SupportTicket::query()
            ->with(['client:id,name', 'messages' => fn ($q) => $q->orderBy('created_at')->limit(1)])
            ->latest()
            ->get()
            ->map(function (SupportTicket $t) {
                $name = $t->client?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $t->id,
                    'subject' => $t->subject,
                    'student' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$t->client_id % count(self::COLORS)],
                    'message' => $t->messages->first()?->message ?? $t->subject,
                    'date' => optional($t->created_at)?->toDateString() ?? '',
                    'status' => $this->pageStatus($t->status),
                    'priority' => $t->priority >= 3 ? 'high' : ($t->priority === 2 ? 'medium' : 'low'),
                ];
            })->values();
    }

    // The page only knows open / in_progress / resolved; waiting_client reads
    // as in progress and closed reads as resolved.
    private function pageStatus(string $status): string
    {
        return match ($status) {
            'open' => 'open',
            'resolved', 'closed' => 'resolved',
            default => 'in_progress',
        };
    }
}

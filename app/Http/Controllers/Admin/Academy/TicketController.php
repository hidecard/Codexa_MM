<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $tickets = SupportTicket::query()
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
                    'status' => match ($t->status) {
                        'open' => 'open',
                        'resolved', 'closed' => 'resolved',
                        default => 'in_progress',
                    },
                    'priority' => $t->priority >= 3 ? 'high' : ($t->priority === 2 ? 'medium' : 'low'),
                ];
            })->values();

        return Inertia::render('Admin/Academy/Tickets/Index', [
            'tickets' => $tickets,
        ]);
    }
}

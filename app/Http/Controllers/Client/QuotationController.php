<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Quotations/Index', [
                'quotations' => collect(),
            ]);
        }

        $quotations = $client->quotations()
            ->with('items')
            ->filter($request->only(['status', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'search']),
            'statuses' => ['draft', 'sent', 'approved', 'rejected', 'expired'],
        ]);
    }

    public function show(Request $request, Quotation $quotation): Response
    {
        $this->authorize('view', $quotation);
        $quotation->load(['items', 'project:id,title']);

        return Inertia::render('Client/Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    public function approve(Request $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('approve', $quotation);
        $quotation->update(['status' => 'approved']);

        return back()->with('success', 'Quotation approved.');
    }

    public function reject(Request $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('reject', $quotation);
        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $quotation->update([
            'status' => 'rejected',
            'notes' => ($quotation->notes ? $quotation->notes."\n\n" : '').'Rejection reason: '.($validated['rejection_reason'] ?? 'Not specified'),
        ]);

        return back()->with('success', 'Quotation rejected.');
    }
}

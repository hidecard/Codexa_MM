<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Invoices/Index', [
                'invoices' => collect(),
            ]);
        }

        $invoices = $client->invoices()
            ->with(['items', 'payments'])
            ->filter($request->only(['status', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'search']),
            'statuses' => ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
        ]);
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);
        $invoice->load(['items', 'payments', 'project:id,title', 'quotation:id,quotation_number']);

        return Inertia::render('Client/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }
}

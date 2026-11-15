<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Quotation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);
        $invoices = Invoice::query()
            ->with(['client:id,company_name,user_id', 'quotation:id,quotation_number'])
            ->filter($request->only(['status', 'client_id', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Invoices/Index', [
            'invoices' => $invoices,
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'filters' => $request->only(['status', 'client_id', 'search']),
            'statuses' => ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Invoice::class);

        return Inertia::render('Admin/Solutions/Invoices/Create', [
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'projects' => Project::query()->with('client:id,company_name')->get(['id', 'title', 'client_id']),
            'quotations' => Quotation::query()->where('status', 'approved')->with('client:id,company_name')->get(['id', 'quotation_number', 'client_id', 'total']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Invoice::class);
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'quotation_id' => ['nullable', 'integer', 'exists:quotations,id'],
            'invoice_number' => ['required', 'string', 'max:255', 'unique:invoices,invoice_number'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'status' => ['required', 'string', 'in:draft,sent,partial,paid,overdue,cancelled'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
            'items.*.position' => ['nullable', 'integer', 'min:0'],
        ]);

        $items = $validated['items'];
        unset($validated['items']);

        $invoice = Invoice::create($validated);

        foreach ($items as $index => $item) {
            $item['position'] = $item['position'] ?? $index;
            $invoice->items()->create($item);
        }

        return redirect()->route('admin.solutions.invoices.index')->with('success', 'Invoice created.');
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);
        $invoice->load(['client.user:id,name,email', 'project', 'quotation', 'items', 'payments']);

        return Inertia::render('Admin/Solutions/Invoices/Show', [
            'invoice' => $invoice,
            'statuses' => ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
        ]);
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'quotation_id' => ['nullable', 'integer', 'exists:quotations,id'],
            'invoice_number' => ['required', 'string', 'max:255', 'unique:invoices,invoice_number,'.$invoice->id],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'status' => ['required', 'string', 'in:draft,sent,partial,paid,overdue,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $invoice->update($validated);

        return back()->with('success', 'Invoice updated.');
    }

    public function updateItems(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer', 'exists:invoice_items,id'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
            'items.*.position' => ['nullable', 'integer', 'min:0'],
        ]);

        // Delete removed items
        $existingIds = $invoice->items()->pluck('id')->toArray();
        $submittedIds = collect($validated['items'])->pluck('id')->filter()->toArray();
        $invoice->items()->whereNotIn('id', $submittedIds)->delete();

        foreach ($validated['items'] as $index => $item) {
            if (isset($item['id'])) {
                $invoice->items()->where('id', $item['id'])->update([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                    'position' => $item['position'] ?? $index,
                ]);
            } else {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                    'position' => $item['position'] ?? $index,
                ]);
            }
        }

        // Recalculate totals
        $invoice->subtotal = $invoice->items()->sum('total');
        $invoice->tax_amount = $invoice->subtotal * 0.18; // Assuming 18% tax
        $invoice->total = $invoice->subtotal + $invoice->tax_amount;
        $invoice->save();

        return back()->with('success', 'Invoice items updated.');
    }

    public function recordPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $invoice->payments()->create([
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'status' => 'completed',
            'paid_at' => $validated['paid_at'] ?? now(),
        ]);

        // Update invoice paid amount and status
        $invoice->paid_amount += $validated['amount'];
        if ($invoice->paid_amount >= $invoice->total) {
            $invoice->status = 'paid';
        } elseif ($invoice->paid_amount > 0) {
            $invoice->status = 'partial';
        }
        $invoice->save();

        return back()->with('success', 'Payment recorded.');
    }

    public function destroy(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);
        $invoice->delete();

        return redirect()->route('admin.solutions.invoices.index')->with('success', 'Invoice deleted.');
    }
}

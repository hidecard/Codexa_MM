<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\Quotation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Quotation::class);
        $quotations = Quotation::query()
            ->with('client:id,company_name,user_id')
            ->filter($request->only(['status', 'client_id', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Quotations/Index', [
            'quotations' => $quotations,
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'filters' => $request->only(['status', 'client_id', 'search']),
            'statuses' => ['draft', 'sent', 'approved', 'rejected', 'expired'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Quotation::class);

        return Inertia::render('Admin/Solutions/Quotations/Create', [
            'clients' => Client::query()->where('status', 'active')->with('user:id,name,email')->get(['id', 'company_name', 'user_id']),
            'projects' => Project::query()->with('client:id,company_name')->get(['id', 'title', 'client_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Quotation::class);
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'quotation_number' => ['required', 'string', 'max:255', 'unique:quotations,quotation_number'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:draft,sent,approved,rejected,expired'],
            'valid_until' => ['nullable', 'date'],
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

        $quotation = Quotation::create($validated);

        foreach ($items as $index => $item) {
            $item['position'] = $item['position'] ?? $index;
            $quotation->items()->create($item);
        }

        return redirect()->route('admin.solutions.quotations.index')->with('success', 'Quotation created.');
    }

    public function show(Request $request, Quotation $quotation): Response
    {
        $this->authorize('view', $quotation);
        $quotation->load(['client.user:id,name,email', 'project', 'items']);

        return Inertia::render('Admin/Solutions/Quotations/Show', [
            'quotation' => $quotation,
            'statuses' => ['draft', 'sent', 'approved', 'rejected', 'expired'],
        ]);
    }

    public function update(Request $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('update', $quotation);
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'quotation_number' => ['required', 'string', 'max:255', 'unique:quotations,quotation_number,'.$quotation->id],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:draft,sent,approved,rejected,expired'],
            'valid_until' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $quotation->update($validated);

        return back()->with('success', 'Quotation updated.');
    }

    public function updateItems(Request $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('update', $quotation);
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer', 'exists:quotation_items,id'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
            'items.*.position' => ['nullable', 'integer', 'min:0'],
        ]);

        // Delete removed items
        $existingIds = $quotation->items()->pluck('id')->toArray();
        $submittedIds = collect($validated['items'])->pluck('id')->filter()->toArray();
        $quotation->items()->whereNotIn('id', $submittedIds)->delete();

        foreach ($validated['items'] as $index => $item) {
            if (isset($item['id'])) {
                $quotation->items()->where('id', $item['id'])->update([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                    'position' => $item['position'] ?? $index,
                ]);
            } else {
                $quotation->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                    'position' => $item['position'] ?? $index,
                ]);
            }
        }

        // Recalculate totals
        $quotation->subtotal = $quotation->items()->sum('total');
        $quotation->tax_amount = $quotation->subtotal * 0.18; // Assuming 18% tax
        $quotation->total = $quotation->subtotal + $quotation->tax_amount;
        $quotation->save();

        return back()->with('success', 'Quotation items updated.');
    }

    public function destroy(Request $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('delete', $quotation);
        $quotation->delete();

        return redirect()->route('admin.solutions.quotations.index')->with('success', 'Quotation deleted.');
    }
}

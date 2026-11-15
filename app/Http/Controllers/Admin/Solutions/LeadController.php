<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Lead::class);
        $leads = Lead::query()
            ->with('assignedTo:id,name,email')
            ->filter($request->only(['status', 'assigned_to', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Leads/Index', [
            'leads' => $leads,
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
            'filters' => $request->only(['status', 'assigned_to', 'search']),
            'statuses' => ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Lead::class);

        return Inertia::render('Admin/Solutions/Leads/Create', [
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Lead::class);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:new,contacted,qualified,proposal,negotiation,won,lost'],
            'notes' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        Lead::create($validated);

        return redirect()->route('admin.solutions.leads.index')->with('success', 'Lead created.');
    }

    public function show(Request $request, Lead $lead): Response
    {
        $this->authorize('view', $lead);
        $lead->load(['assignedTo:id,name,email', 'activities.user:id,name']);

        return Inertia::render('Admin/Solutions/Leads/Show', [
            'lead' => $lead,
            'users' => User::query()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))->get(['id', 'name', 'email']),
            'statuses' => ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
        ]);
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:new,contacted,qualified,proposal,negotiation,won,lost'],
            'notes' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $lead->update($validated);

        return back()->with('success', 'Lead updated.');
    }

    public function addActivity(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);
        $validated = $request->validate([
            'activity_type' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['lead_id'] = $lead->id;
        $validated['user_id'] = $request->user()->id;
        $lead->activities()->create($validated);

        return back()->with('success', 'Activity added.');
    }

    public function destroy(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('delete', $lead);
        $lead->delete();

        return redirect()->route('admin.solutions.leads.index')->with('success', 'Lead deleted.');
    }
}

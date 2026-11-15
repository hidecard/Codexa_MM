<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Client::class);
        $clients = Client::query()
            ->with('user:id,name,email')
            ->filter($request->only(['status', 'search']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Client::class);

        return Inertia::render('Admin/Solutions/Clients/Create', [
            'users' => User::query()->whereDoesntHave('client')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Client::class);
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id', 'unique:clients,user_id'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_address' => ['nullable', 'string'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        Client::create($validated);

        return redirect()->route('admin.solutions.clients.index')->with('success', 'Client created.');
    }

    public function show(Request $request, Client $client): Response
    {
        $this->authorize('view', $client);
        $client->load(['user:id,name,email', 'projects' => fn ($q) => $q->latest()->take(5), 'quotations' => fn ($q) => $q->latest()->take(5), 'invoices' => fn ($q) => $q->latest()->take(5)]);

        return Inertia::render('Admin/Solutions/Clients/Show', [
            'client' => $client,
        ]);
    }

    public function edit(Request $request, Client $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('Admin/Solutions/Clients/Edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_address' => ['nullable', 'string'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $client->update($validated);

        return back()->with('success', 'Client updated.');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);
        $client->delete();

        return redirect()->route('admin.solutions.clients.index')->with('success', 'Client deleted.');
    }
}

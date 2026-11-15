<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Service::class);
        $services = Service::query()
            ->with('category:id,name')
            ->filter($request->only(['status', 'category_id']))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Services/Index', [
            'services' => $services,
            'categories' => ServiceCategory::query()->where('is_active', true)->get(['id', 'name']),
            'filters' => $request->only(['status', 'category_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Service::class);

        return Inertia::render('Admin/Solutions/Services/Create', [
            'categories' => ServiceCategory::query()->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Service::class);
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:services,slug'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:255'],
            'features' => ['nullable', 'array'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        Service::create($validated);

        return redirect()->route('admin.solutions.services.index')->with('success', 'Service created.');
    }

    public function edit(Request $request, Service $service): Response
    {
        $this->authorize('update', $service);

        return Inertia::render('Admin/Solutions/Services/Edit', [
            'service' => $service,
            'categories' => ServiceCategory::query()->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $this->authorize('update', $service);
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:services,slug,'.$service->id],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:255'],
            'features' => ['nullable', 'array'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $service->update($validated);

        return back()->with('success', 'Service updated.');
    }

    public function destroy(Request $request, Service $service): RedirectResponse
    {
        $this->authorize('delete', $service);
        $service->delete();

        return redirect()->route('admin.solutions.services.index')->with('success', 'Service deleted.');
    }
}

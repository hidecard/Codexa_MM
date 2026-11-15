<?php

namespace App\Http\Controllers\Admin\Solutions;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ServiceCategory::class);
        $categories = ServiceCategory::query()
            ->withCount('services')
            ->orderBy('position')
            ->paginate(20);

        return Inertia::render('Admin/Solutions/Services/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ServiceCategory::class);

        return Inertia::render('Admin/Solutions/Services/Categories/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ServiceCategory::class);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:service_categories,slug'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        ServiceCategory::create($validated);

        return redirect()->route('admin.solutions.services.categories.index')->with('success', 'Category created.');
    }

    public function edit(Request $request, ServiceCategory $category): Response
    {
        $this->authorize('update', $category);

        return Inertia::render('Admin/Solutions/Services/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, ServiceCategory $category): RedirectResponse
    {
        $this->authorize('update', $category);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:service_categories,slug,'.$category->id],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Request $request, ServiceCategory $category): RedirectResponse
    {
        $this->authorize('delete', $category);
        $category->delete();

        return redirect()->route('admin.solutions.services.categories.index')->with('success', 'Category deleted.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $services = Service::query()
            ->public()
            ->with('category')
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($service) use ($search) {
                    $service->where('title', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%");
                });
            })
            ->when($request->integer('category'), fn ($query, int $category) => $query->where('category_id', $category))
            ->orderBy('id')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Services/Index', [
            'services' => $services,
            'categories' => ServiceCategory::query()->where('is_active', true)->orderBy('position')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $request->string('q')->trim()->value(),
                'category' => $request->integer('category') ?: null,
            ],
        ]);
    }

    public function show(Service $service): Response
    {
        abort_unless($service->status === 'active' && $service->category?->is_active, 404);
        $service->load('category');

        return Inertia::render('Public/Services/Show', ['service' => $service]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PortfolioProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPortfolioController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = PortfolioProject::query()
            ->published()
            ->with('images')
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%")
                        ->orWhere('client_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('position')
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Portfolio/Index', [
            'projects' => $projects,
            'filters' => ['q' => $request->string('q')->trim()->value()],
        ]);
    }

    public function show(PortfolioProject $project): Response
    {
        abort_unless($project->status === 'published' && $project->published_at, 404);
        $project->load('images');

        return Inertia::render('Public/Portfolio/Show', ['project' => $project]);
    }
}

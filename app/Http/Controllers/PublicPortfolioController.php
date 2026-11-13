<?php

namespace App\Http\Controllers;

use App\Models\PortfolioProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPortfolioController extends Controller
{
    public function index(): Response
    {
        $projects = PortfolioProject::query()
            ->published()
            ->with('images')
            ->orderBy('position')
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Portfolio/Index', ['projects' => $projects]);
    }

    public function show(PortfolioProject $project): Response
    {
        abort_unless($project->status === 'published' && $project->published_at, 404);
        $project->load('images');

        return Inertia::render('Public/Portfolio/Show', ['project' => $project]);
    }
}

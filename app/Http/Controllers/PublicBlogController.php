<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBlogController extends Controller
{
    public function index(Request $request): Response
    {
        $posts = BlogPost::query()
            ->published()
            ->with(['category', 'author:id,name'])
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->when($request->integer('category'), fn ($query, int $category) => $query->where('category_id', $category))
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Blog/Index', [
            'posts' => $posts,
            'categories' => BlogCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $request->string('q')->trim()->value(),
                'category' => $request->integer('category') ?: null,
            ],
        ]);
    }

    public function show(BlogPost $post): Response
    {
        abort_unless($post->status === 'published' && $post->published_at, 404);
        $post->load(['category', 'author:id,name']);

        return Inertia::render('Public/Blog/Show', ['post' => $post]);
    }
}

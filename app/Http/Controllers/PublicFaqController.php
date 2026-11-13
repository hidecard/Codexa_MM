<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicFaqController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $faqs = Faq::query()
            ->published()
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question', 'like', "%{$search}%")
                        ->orWhere('answer', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->trim()->value(), fn ($query, string $category) => $query->where('category', $category))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Public/Faq', [
            'faqs' => $faqs,
            'categories' => Faq::query()->published()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
            'filters' => [
                'q' => $request->string('q')->trim()->value(),
                'category' => $request->string('category')->trim()->value(),
            ],
        ]);
    }
}

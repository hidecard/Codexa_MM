<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    public function index(): Response
    {
        $faqs = Faq::published()
            ->get(['id', 'question', 'answer', 'category'])
            ->map(fn (Faq $faq) => [
                'q' => $faq->question,
                'a' => $faq->answer,
                'category' => $faq->category,
            ])->values();

        // The support form sends a real message to the support account.
        $support = User::role('admin')->orderBy('id')->first();

        return Inertia::render('Student/Help/Index', [
            'faqs' => $faqs,
            'supportId' => $support?->id,
        ]);
    }
}

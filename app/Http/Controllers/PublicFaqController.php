<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class PublicFaqController extends Controller
{
    public function __invoke(): Response
    {
        $faqs = Faq::query()->published()->get(['id', 'question', 'answer', 'category']);

        return Inertia::render('Public/Faq', ['faqs' => $faqs]);
    }
}

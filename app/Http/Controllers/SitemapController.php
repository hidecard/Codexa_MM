<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Course;
use App\Models\PortfolioProject;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = collect([
            ['loc' => route('home'), 'priority' => '1.0'],
            ['loc' => route('about'), 'priority' => '0.8'],
            ['loc' => route('courses.index'), 'priority' => '0.9'],
            ['loc' => route('services.index'), 'priority' => '0.9'],
            ['loc' => route('portfolio.index'), 'priority' => '0.8'],
            ['loc' => route('instructors.index'), 'priority' => '0.7'],
            ['loc' => route('blog.index'), 'priority' => '0.8'],
            ['loc' => route('contact'), 'priority' => '0.6'],
            ['loc' => route('faq'), 'priority' => '0.6'],
            ['loc' => route('privacy-policy'), 'priority' => '0.3'],
            ['loc' => route('terms'), 'priority' => '0.3'],
        ]);

        Course::query()->published()->pluck('slug')->each(fn (string $slug) => $urls->push(['loc' => route('courses.show', $slug), 'priority' => '0.7']));
        Service::query()->public()->pluck('slug')->each(fn (string $slug) => $urls->push(['loc' => route('services.show', $slug), 'priority' => '0.7']));
        PortfolioProject::query()->published()->pluck('slug')->each(fn (string $slug) => $urls->push(['loc' => route('portfolio.show', $slug), 'priority' => '0.6']));
        BlogPost::query()->published()->pluck('slug')->each(fn (string $slug) => $urls->push(['loc' => route('blog.show', $slug), 'priority' => '0.6']));

        $body = $urls->map(function (array $url): string {
            return '  <url><loc>'.e($url['loc'])."</loc><changefreq>weekly</changefreq><priority>{$url['priority']}</priority></url>";
        })->implode("\n");

        return response("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{$body}\n</urlset>", 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}

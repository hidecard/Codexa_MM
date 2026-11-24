<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $query = $request->string('query')->trim();
        $tab = $request->string('tab', 'all');
        $q = $query->value();

        $courses = [];
        $instructors = [];
        $paths = [];
        $articles = [];

        if ($q !== '') {
            $like = '%' . $q . '%';

            if (in_array($tab, ['all', 'courses'], true)) {
                $courses = Course::query()
                    ->published()
                    ->where(function ($c) use ($like) {
                        $c->where('title', 'like', $like)
                            ->orWhere('short_description', 'like', $like)
                            ->orWhereHas('category', fn ($cat) => $cat->where('name', 'like', $like))
                            ->orWhereHas('instructor', fn ($inst) => $inst->where('name', 'like', $like));
                    })
                    ->with(['category:id,name', 'instructor:id,name'])
                    ->latest('published_at')
                    ->limit(12)
                    ->get()
                    ->map(fn (Course $c) => [
                        'id' => $c->id,
                        'slug' => $c->slug,
                        'title' => $c->title,
                        'category' => $c->category?->name ?? '—',
                        'instructor' => $c->instructor?->name ?? '—',
                        'price' => (float) $c->price,
                        'oldPrice' => (float) ($c->sale_price ?? 0) > 0 ? (float) $c->sale_price : null,
                        'rating' => 4.9,
                        'students' => $c->enrollments()->count(),
                        'level' => $c->level ?? 'Beginner',
                    ])
                    ->values();
            }

            if (in_array($tab, ['all', 'instructors'], true)) {
                $instructors = User::query()
                    ->whereHas('roles', fn ($r) => $r->where('name', 'instructor'))
                    ->where('name', 'like', $like)
                    ->limit(8)
                    ->get()
                    ->map(fn (User $u) => [
                        'name' => $u->name,
                        'role' => 'Web Development Instructor',
                        'rating' => 4.9,
                        'students' => 0,
                    ])
                    ->values();
            }

            if (in_array($tab, ['all', 'paths'], true)) {
                $paths = LearningPath::query()
                    ->where('is_published', true)
                    ->where(function ($p) use ($like) {
                        $p->where('title', 'like', $like)
                            ->orWhere('description', 'like', $like);
                    })
                    ->limit(6)
                    ->get()
                    ->map(fn (LearningPath $p) => [
                        'id' => $p->id,
                        'title' => $p->title,
                        'desc' => $p->description ?? '',
                    ])
                    ->values();
            }

            if (in_array($tab, ['all', 'articles'], true)) {
                $articles = CommunityPost::query()
                    ->published()
                    ->where(function ($a) use ($like) {
                        $a->where('title', 'like', $like)
                            ->orWhere('body', 'like', $like)
                            ->orWhere('category', 'like', $like);
                    })
                    ->with('user:id,name')
                    ->latest()
                    ->limit(6)
                    ->get()
                    ->map(fn (CommunityPost $a) => [
                        'title' => $a->title,
                        'cat' => $a->category,
                        'href' => '/student/community/' . $a->id,
                    ])
                    ->values();
        }
        }

        return Inertia::render('Student/Search/Index', [
            'query' => $q,
            'tab' => $tab,
            'courses' => $courses,
            'instructors' => $instructors,
            'paths' => $paths,
            'articles' => $articles,
        ]);
    }
}

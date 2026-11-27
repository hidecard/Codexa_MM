<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\Setting;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class PublicHomeController extends Controller
{
    public function __invoke(): Response
    {
        $courses = Course::query()
            ->published()
            ->with(['category:id,name,slug', 'instructor:id,name'])
            ->latest('published_at')
            ->take(12)
            ->get();

        $categories = CourseCategory::query()
            ->where('is_active', true)
            ->withCount(['courses' => fn ($query) => $query->published()])
            ->orderBy('position')
            ->get(['id', 'name', 'slug']);

        // The role() scope throws when the role does not exist yet (fresh,
        // unseeded database), so only query instructors when the role exists.
        $hasInstructorRole = Role::query()->where('name', 'instructor')->where('guard_name', 'web')->exists();

        $instructors = $hasInstructorRole
            ? User::query()->role('instructor')->with('profile')->orderBy('name')->take(6)->get()
            : collect();

        $instructors->each(function (User $instructor) {
            $instructor->setAttribute(
                'courses_count',
                Course::query()
                    ->published()
                    ->where(fn ($q) => $q->where('instructor_id', $instructor->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($instructor->id)))
                    ->count(),
            );
        });

        $learningPaths = LearningPath::query()
            ->where('is_published', true)
            ->withCount(['courses' => fn ($q) => $q->published()])
            ->with('courses')
            ->orderBy('sort_order')
            ->take(4)
            ->get(['id', 'title', 'description', 'glyph', 'gradient', 'duration_label', 'level', 'outcomes'])
            ->map(function ($path) {
                return [
                    'id' => $path->id,
                    'title' => $path->title,
                    'goal' => $path->description,
                    'glyph' => $path->glyph,
                    'grad' => $path->gradient,
                    'months' => $path->duration_label,
                    'level' => $path->level,
                    'steps' => $path->courses->map(fn ($c) => $c->title)->toArray(),
                    'outcomes' => $path->outcomes ?? [],
                ];
            });

        return Inertia::render('Public/Home', [
            'courses' => $courses,
            'categories' => $categories,
            'instructors' => $instructors,
            'learningPaths' => $learningPaths,
            // Landing-page content from the admin CMS (keys landing_promo,
            // landing_hero_title, landing_hero_intro). Null when no CMS
            // value exists yet — the page falls back to its hardcoded copy.
            'landing' => [
                'promo' => Setting::getValue('landing_promo'),
                'heroTitle' => Setting::getValue('landing_hero_title'),
                'heroIntro' => Setting::getValue('landing_hero_intro'),
            ],
            'stats' => [
                'courses' => Course::query()->published()->count(),
                'students' => Enrollment::query()->distinct('student_id')->count('student_id'),
                'instructors' => $hasInstructorRole ? User::query()->role('instructor')->count() : 0,
                'rating' => round((float) CourseReview::query()->where('is_approved', true)->avg('rating'), 1) ?: null,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CommunityComment;
use App\Models\CommunityLike;
use App\Models\CommunityPost;
use App\Services\BadgeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommunityPostController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->string('category')->trim()->value();

        $posts = CommunityPost::query()
            ->published()
            ->with('user:id,name')
            ->withCount(['likes', 'comments'])
            ->withExists(['likes as liked' => fn ($q) => $q->where('user_id', $request->user()->id)])
            ->when(in_array($category, CommunityPost::CATEGORIES, true), fn ($q) => $q->where('category', $category))
            ->latest()
            ->get()
            ->map(fn (CommunityPost $p) => $this->mapPost($p, $request->user()->id))
            ->values();

        return Inertia::render('Student/Community/Index', [
            'posts' => $posts,
            'categories' => CommunityPost::CATEGORIES,
            'activeCategory' => in_array($category, CommunityPost::CATEGORIES, true) ? $category : 'All',
        ]);
    }

    public function show(Request $request, CommunityPost $post): Response
    {
        // Hidden posts are visible only to their author.
        abort_unless(
            $post->status === CommunityPost::STATUS_PUBLISHED || $post->user_id === $request->user()->id,
            404,
        );

        $post->load('user:id,name')->loadCount(['likes', 'comments'])->loadExists([
            'likes as liked' => fn ($q) => $q->where('user_id', $request->user()->id),
        ]);

        $comments = CommunityComment::query()
            ->with('user:id,name')
            ->where('community_post_id', $post->id)
            ->oldest()
            ->get()
            ->map(fn (CommunityComment $c) => $this->mapComment($c, $request->user()->id))
            ->values();

        return Inertia::render('Student/Community/Show', [
            'post' => $this->mapPost($post, $request->user()->id),
            'comments' => $comments,
            'categories' => CommunityPost::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', Rule::in(CommunityPost::CATEGORIES)],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:5000'],
        ]);

        CommunityPost::create([
            'user_id' => $request->user()->id,
            'category' => $validated['category'],
            'title' => $validated['title'],
            'body' => $validated['body'] ?? null,
            'status' => CommunityPost::STATUS_PUBLISHED,
        ]);

        return back()->with('success', 'ပို့စ် တင်ပြီးပါပြီ');
    }

    public function update(Request $request, CommunityPost $post): RedirectResponse
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'category' => ['required', 'string', Rule::in(CommunityPost::CATEGORIES)],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:5000'],
        ]);

        $post->update($validated);

        return back()->with('success', 'ပို့စ် ပြင်ဆင်ပြီးပါပြီ');
    }

    public function destroy(Request $request, CommunityPost $post): RedirectResponse
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        $post->delete();

        return redirect()->route('student.community.index')->with('success', 'ပို့စ် ဖျက်ပြီးပါပြီ');
    }

    // One like per user per post (unique index); toggles on repeat calls.
    public function toggleLike(Request $request, CommunityPost $post): RedirectResponse
    {
        abort_unless(
            $post->status === CommunityPost::STATUS_PUBLISHED || $post->user_id === $request->user()->id,
            404,
        );

        $existing = CommunityLike::query()
            ->where('community_post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            CommunityLike::create([
                'user_id' => $request->user()->id,
                'community_post_id' => $post->id,
            ]);
        }

        return back();
    }

    private function mapPost(CommunityPost $p, int $viewerId): array
    {
        $name = $p->user?->name ?? 'Unknown';

        return [
            'id' => $p->id,
            'name' => $name,
            'init' => BadgeService::initials($name),
            'col' => BadgeService::colorFor($p->user_id),
            'time' => $p->created_at ? self::relativeDay($p->created_at) : '',
            'cat' => $p->category,
            'title' => $p->title,
            'body' => $p->body ?? '',
            'likes' => (int) ($p->likes_count ?? $p->likes()->count()),
            'comments' => (int) ($p->comments_count ?? $p->comments()->count()),
            'liked' => (bool) ($p->liked ?? $p->likes()->where('user_id', $viewerId)->exists()),
            'saved' => false,
            'mine' => $p->user_id === $viewerId,
            'status' => $p->status,
        ];
    }

    private function mapComment(CommunityComment $c, int $viewerId): array
    {
        $name = $c->user?->name ?? 'Unknown';

        return [
            'id' => $c->id,
            'name' => $name,
            'init' => BadgeService::initials($name),
            'col' => BadgeService::colorFor($c->user_id),
            'time' => $c->created_at ? self::relativeDay($c->created_at) : '',
            'body' => $c->body,
            'mine' => $c->user_id === $viewerId,
        ];
    }

    private static function relativeDay(Carbon $date): string
    {
        if ($date->isToday()) {
            return 'ယနေ့';
        }
        if ($date->isYesterday()) {
            return 'မနေ့က';
        }
        if ($date->diffInDays(now()) < 7) {
            return 'လွန်ခဲ့သော '.$date->diffInDays(now()).' ရက်';
        }

        return $date->toDateString();
    }
}

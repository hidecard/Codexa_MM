<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CommunityComment;
use App\Models\CommunityPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommunityCommentController extends Controller
{
    public function store(Request $request, CommunityPost $post): RedirectResponse
    {
        abort_unless(
            $post->status === CommunityPost::STATUS_PUBLISHED || $post->user_id === $request->user()->id,
            404,
        );

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        CommunityComment::create([
            'user_id' => $request->user()->id,
            'community_post_id' => $post->id,
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'မှတ်ချက် ရေးပြီးပါပြီ');
    }

    public function update(Request $request, CommunityComment $comment): RedirectResponse
    {
        abort_unless($comment->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $comment->update($validated);

        return back()->with('success', 'မှတ်ချက် ပြင်ဆင်ပြီးပါပြီ');
    }

    public function destroy(Request $request, CommunityComment $comment): RedirectResponse
    {
        abort_unless($comment->user_id === $request->user()->id, 403);

        $comment->delete();

        return back()->with('success', 'မှတ်ချက် ဖျက်ပြီးပါပြီ');
    }
}

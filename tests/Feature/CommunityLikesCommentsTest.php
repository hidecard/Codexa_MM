<?php

use App\Models\CommunityComment;
use App\Models\CommunityLike;
use App\Models\CommunityPost;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function communityLikesAdmin(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('admin');

    return $user;
}

function communityLikesStudent(): User
{
    $user = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $user->assignRole('student');

    return $user;
}

test('liking a post toggles it and counts show in list and detail props', function () {
    $student = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => communityLikesStudent()->id]);

    // Like it: count 1, liked true for the liker.
    $this->actingAs($student)->post("/student/community/{$post->id}/like")->assertRedirect();
    expect(CommunityLike::query()->count())->toBe(1);

    $this->actingAs($student)->get('/student/community')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('posts', 1)
            ->where('posts.0.likes', 1)
            ->where('posts.0.liked', true));

    $this->actingAs($student)->get("/student/community/{$post->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('post.likes', 1)
            ->where('post.liked', true));

    // Like again: toggles off.
    $this->actingAs($student)->post("/student/community/{$post->id}/like")->assertRedirect();
    expect(CommunityLike::query()->count())->toBe(0);

    $this->actingAs($student)->get("/student/community/{$post->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('post.likes', 0)
            ->where('post.liked', false));
});

test('each user can like a post only once', function () {
    $alice = communityLikesStudent();
    $bob = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => communityLikesStudent()->id]);

    $this->actingAs($alice)->post("/student/community/{$post->id}/like")->assertRedirect();
    $this->actingAs($bob)->post("/student/community/{$post->id}/like")->assertRedirect();
    expect(CommunityLike::query()->count())->toBe(2);

    // The unique index prevents a duplicate like row.
    expect(fn () => CommunityLike::create([
        'user_id' => $alice->id,
        'community_post_id' => $post->id,
    ]))->toThrow(QueryException::class);
    expect(CommunityLike::query()->count())->toBe(2);

    // The post author sees the count but is not a liker.
    $this->actingAs($post->user)->get("/student/community/{$post->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('post.likes', 2)
            ->where('post.liked', false));
});

test('comments can be created and listed on the post page', function () {
    $student = communityLikesStudent();
    $other = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => $student->id]);

    $this->actingAs($other)->post("/student/community/{$post->id}/comments", [
        'body' => 'Great explanation, thanks!',
    ])->assertRedirect();
    $this->actingAs($student)->post("/student/community/{$post->id}/comments", [
        'body' => 'Glad it helped.',
    ])->assertRedirect();
    expect(CommunityComment::query()->count())->toBe(2);

    $this->actingAs($student)->get("/student/community/{$post->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('post.comments', 2)
            ->has('comments', 2)
            ->where('comments.0.body', 'Great explanation, thanks!')
            ->where('comments.0.mine', false)
            ->where('comments.1.body', 'Glad it helped.')
            ->where('comments.1.mine', true));

    $this->actingAs($student)->get('/student/community')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('posts.0.comments', 2));

    // Empty comments are rejected.
    $this->actingAs($other)->post("/student/community/{$post->id}/comments", ['body' => ''])
        ->assertSessionHasErrors('body');
    expect(CommunityComment::query()->count())->toBe(2);
});

test('a comment author can edit and delete their own comment', function () {
    $student = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => communityLikesStudent()->id]);
    $comment = CommunityComment::factory()->create([
        'user_id' => $student->id,
        'community_post_id' => $post->id,
        'body' => 'Original body',
    ]);

    $this->actingAs($student)->put("/student/community/comments/{$comment->id}", [
        'body' => 'Edited body',
    ])->assertRedirect();
    expect($comment->fresh()->body)->toBe('Edited body');

    $this->actingAs($student)->delete("/student/community/comments/{$comment->id}")->assertRedirect();
    expect(CommunityComment::query()->count())->toBe(0);
});

test('non-owners cannot edit or delete another student comment', function () {
    $author = communityLikesStudent();
    $other = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => $author->id]);
    $comment = CommunityComment::factory()->create([
        'user_id' => $author->id,
        'community_post_id' => $post->id,
        'body' => 'Author body',
    ]);

    $this->actingAs($other)->put("/student/community/comments/{$comment->id}", ['body' => 'Hijacked'])
        ->assertForbidden();
    expect($comment->fresh()->body)->toBe('Author body');

    $this->actingAs($other)->delete("/student/community/comments/{$comment->id}")->assertForbidden();
    expect(CommunityComment::query()->count())->toBe(1);
});

test('an admin can delete any community comment via moderation', function () {
    $admin = communityLikesAdmin();
    $student = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => $student->id]);
    $comment = CommunityComment::factory()->create([
        'user_id' => $student->id,
        'community_post_id' => $post->id,
    ]);

    $this->actingAs($admin)->delete("/admin/academy/moderation/comments/{$comment->id}")
        ->assertRedirect();
    expect(CommunityComment::query()->count())->toBe(0);
});

test('likes and comments on a hidden post are limited to the author', function () {
    $author = communityLikesStudent();
    $other = communityLikesStudent();
    $post = CommunityPost::factory()->create(['user_id' => $author->id, 'status' => 'hidden']);

    $this->actingAs($other)->post("/student/community/{$post->id}/like")->assertNotFound();
    $this->actingAs($other)->post("/student/community/{$post->id}/comments", ['body' => 'Hello'])
        ->assertNotFound();
    expect(CommunityLike::query()->count())->toBe(0)
        ->and(CommunityComment::query()->count())->toBe(0);

    // The author can still interact with their own hidden post.
    $this->actingAs($author)->post("/student/community/{$post->id}/like")->assertRedirect();
    $this->actingAs($author)->post("/student/community/{$post->id}/comments", ['body' => 'Note to self'])
        ->assertRedirect();
    expect(CommunityLike::query()->count())->toBe(1)
        ->and(CommunityComment::query()->count())->toBe(1);
});

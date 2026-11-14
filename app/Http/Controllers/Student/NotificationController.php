<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = StudentNotification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20)
            ->through(fn (StudentNotification $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'is_read' => (bool) $n->is_read,
                'read_at' => optional($n->read_at)?->toDateTimeString(),
                'created_at' => optional($n->created_at)?->toDateTimeString(),
            ]);

        return Inertia::render('Student/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, StudentNotification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        if (! $notification->is_read) {
            $notification->forceFill(['is_read' => true, 'read_at' => now()])->save();
        }

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        StudentNotification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return back();
    }
}

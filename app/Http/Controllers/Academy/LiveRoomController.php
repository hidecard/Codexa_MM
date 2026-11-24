<?php

namespace App\Http\Controllers\Academy;

use App\Http\Controllers\Controller;
use App\Models\LiveAttendance;
use App\Models\LiveChatMessage;
use App\Models\LiveRaiseHand;
use App\Models\LiveSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LiveRoomController extends Controller
{
    /** Palette for attendee avatars, picked deterministically by user id. */
    private const AVATAR_COLORS = [
        '#0ea892', '#ec4899', '#f59e0b', '#6366f1',
        '#38bdf8', '#22c55e', '#ef4444', '#a855f7',
    ];

    private const MAX_CHAT_MESSAGES = 50;

    /**
     * Full room state for polling: present attendees, recent chat,
     * pending raised hands, and the current user's join/hand state.
     */
    public function state(Request $request, LiveSession $liveSession): JsonResponse
    {
        $this->authorizeRoomAccess($request, $liveSession);

        return response()->json($this->roomState($request, $liveSession));
    }

    /**
     * Record attendance for the current user. Requires a live session and
     * respects max_participants; re-joining re-opens the same row.
     */
    public function join(Request $request, LiveSession $liveSession): JsonResponse
    {
        if ($liveSession->status !== LiveSession::STATUS_LIVE) {
            return response()->json([
                'message' => 'Session live ဖြစ်နေမှ ဝင်ရောက်နိုင်ပါတယ်။',
            ], 422);
        }

        $user = $request->user();
        $open = LiveAttendance::openFor($liveSession->id, $user->id);

        if (! $open && $liveSession->max_participants !== null) {
            $present = LiveAttendance::query()
                ->where('live_session_id', $liveSession->id)
                ->whereNull('left_at')
                ->count();

            if ($present >= $liveSession->max_participants) {
                return response()->json([
                    'message' => 'အတန်း ပြည့်သွားပါပြီ — ပါဝင်သူ အရေအတွက် ကန့်သတ်ချက် ပြည့်နေပါတယ်။',
                ], 422);
            }
        }

        $attendance = LiveAttendance::updateOrCreate(
            ['live_session_id' => $liveSession->id, 'user_id' => $user->id],
            ['joined_at' => now(), 'left_at' => null],
        );

        return response()->json([
            'joined' => true,
            'attendance' => $attendance->toDisplayArray(),
        ]);
    }

    /**
     * Close the current user's open attendance row, if any.
     */
    public function leave(Request $request, LiveSession $liveSession): JsonResponse
    {
        $attendance = LiveAttendance::openFor($liveSession->id, $request->user()->id);

        if ($attendance) {
            $attendance->update(['left_at' => now()]);
        }

        return response()->json(['joined' => false]);
    }

    /**
     * Post a chat message to the room. Students and the session host only.
     */
    public function postChat(Request $request, LiveSession $liveSession): JsonResponse
    {
        $this->authorizeRoomAccess($request, $liveSession);

        if ($liveSession->status !== LiveSession::STATUS_LIVE) {
            return response()->json([
                'message' => 'Session live ဖြစ်နေမှ chat ပို့နိုင်ပါတယ်။',
            ], 422);
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $message = LiveChatMessage::create([
            'live_session_id' => $liveSession->id,
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ]);

        $message->load('user:id,name');

        return response()->json([
            'message' => $this->chatShape($message, $liveSession, $request->user()->id),
        ], 201);
    }

    /**
     * Raise the current user's hand (re-raising re-activates the row).
     */
    public function raiseHand(Request $request, LiveSession $liveSession): JsonResponse
    {
        if ($liveSession->status !== LiveSession::STATUS_LIVE) {
            return response()->json([
                'message' => 'Session live ဖြစ်နေမှ လက်ထောင်နိုင်ပါတယ်။',
            ], 422);
        }

        LiveRaiseHand::raise($liveSession->id, $request->user()->id);

        return response()->json(['raised' => true]);
    }

    /**
     * Lower the current user's hand.
     */
    public function lowerHand(Request $request, LiveSession $liveSession): JsonResponse
    {
        LiveRaiseHand::lower($liveSession->id, $request->user()->id);

        return response()->json(['raised' => false]);
    }

    /**
     * Host lowers a specific student's raised hand.
     */
    public function lowerHandForHost(Request $request, LiveSession $liveSession, LiveRaiseHand $raiseHand): JsonResponse
    {
        $this->authorizeOwnSession($request, $liveSession);

        if ($raiseHand->live_session_id !== $liveSession->id) {
            abort(404);
        }

        $raiseHand->update(['status' => LiveRaiseHand::STATUS_LOWERED]);

        return response()->json(['lowered' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    private function roomState(Request $request, LiveSession $liveSession): array
    {
        $userId = $request->user()->id;

        $raisedUserIds = LiveRaiseHand::query()
            ->where('live_session_id', $liveSession->id)
            ->where('status', LiveRaiseHand::STATUS_PENDING)
            ->pluck('user_id')
            ->all();

        $attendees = LiveAttendance::query()
            ->with('user:id,name')
            ->where('live_session_id', $liveSession->id)
            ->whereNull('left_at')
            ->orderBy('joined_at')
            ->get()
            ->map(fn (LiveAttendance $a) => [
                'user_id' => $a->user_id,
                'name' => $a->user?->name ?? '',
                'initials' => self::initials($a->user?->name ?? ''),
                'color' => self::AVATAR_COLORS[$a->user_id % count(self::AVATAR_COLORS)],
                'hand_raised' => in_array($a->user_id, $raisedUserIds, true),
                'joined_at' => $a->joined_at?->toIso8601String(),
            ])
            ->values();

        $chat = LiveChatMessage::query()
            ->with('user:id,name')
            ->where('live_session_id', $liveSession->id)
            ->orderByDesc('created_at')
            ->limit(self::MAX_CHAT_MESSAGES)
            ->get()
            ->reverse()
            ->values()
            ->map(fn (LiveChatMessage $m) => $this->chatShape($m, $liveSession, $userId));

        $raisedHands = LiveRaiseHand::query()
            ->with('user:id,name')
            ->where('live_session_id', $liveSession->id)
            ->where('status', LiveRaiseHand::STATUS_PENDING)
            ->orderBy('updated_at')
            ->get()
            ->map(fn (LiveRaiseHand $h) => $h->toDisplayArray())
            ->values();

        return [
            'attendees' => $attendees,
            'chat' => $chat,
            'raised_hands' => $raisedHands,
            'attendance_count' => $attendees->count(),
            'joined' => LiveAttendance::openFor($liveSession->id, $userId) !== null,
            'my_hand_raised' => in_array($userId, $raisedUserIds, true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chatShape(LiveChatMessage $message, LiveSession $liveSession, int $currentUserId): array
    {
        return array_merge($message->toDisplayArray(), [
            'is_host' => $message->user_id === $liveSession->instructor_id,
            'is_mine' => $message->user_id === $currentUserId,
        ]);
    }

    private function authorizeRoomAccess(Request $request, LiveSession $liveSession): void
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return;
        }

        if ($user->hasRole('student')) {
            return;
        }

        $this->authorizeOwnSession($request, $liveSession);
    }

    private function authorizeOwnSession(Request $request, LiveSession $liveSession): void
    {
        if ($liveSession->instructor_id !== $request->user()->id) {
            abort(403, 'မိမိ၏ session ကိုသာ စီမံနိုင်ပါတယ်။');
        }
    }

    private static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];

        if ($parts === []) {
            return '?';
        }

        $first = Str::substr($parts[0], 0, 1);
        $second = count($parts) > 1 ? Str::substr($parts[count($parts) - 1], 0, 1) : '';

        return Str::upper($first.$second);
    }
}

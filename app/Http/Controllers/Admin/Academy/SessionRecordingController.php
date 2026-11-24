<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Models\SessionRecording;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SessionRecordingController extends Controller
{
    /**
     * Admin: attach a URL-based recording to a session. No upload backend —
     * the video lives on YouTube/Zoom/etc. and only the URL is stored.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        SessionRecording::create($data);

        return back()->with('success', 'မှတ်တမ်း ထည့်ပြီးပါပြီ။');
    }

    public function update(Request $request, SessionRecording $recording): RedirectResponse
    {
        $data = $request->validate($this->rules());

        $recording->update($data);

        return back()->with('success', 'မှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroy(SessionRecording $recording): RedirectResponse
    {
        $recording->delete();

        return back()->with('success', 'မှတ်တမ်း ဖျက်ပြီးပါပြီ။');
    }

    /**
     * Student: count one view when a recording is opened. Called
     * fire-and-forget from the link click; no authz beyond the student
     * role because recordings are visible to all students.
     */
    public function incrementViews(LiveSession $liveSession, SessionRecording $recording): JsonResponse
    {
        if ($recording->live_session_id !== $liveSession->id) {
            abort(404);
        }

        $recording->increment('views');

        return response()->json(['views' => $recording->fresh()->views]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'live_session_id' => ['required', 'exists:live_sessions,id'],
            'title' => ['required', 'string', 'max:255'],
            'video_url' => ['required', 'url', 'max:2048'],
            'duration' => ['nullable', 'string', 'max:32'],
        ];
    }
}

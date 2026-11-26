<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Message;
use App\Models\User;
use App\Support\AcademyAnalytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $messages = Message::query()
            ->where(fn ($q) => $q->where('sender_id', $user->id)->orWhere('recipient_id', $user->id))
            ->with(['sender:id,name', 'recipient:id,name'])
            ->orderBy('created_at')
            ->get();

        $otherIds = $messages
            ->map(fn (Message $m) => $m->sender_id === $user->id ? $m->recipient_id : $m->sender_id)
            ->unique()
            ->values();

        $others = User::query()->whereIn('id', $otherIds)->with('roles:id,name')->get()->keyBy('id');

        $threads = $messages
            ->groupBy(fn (Message $m) => $m->sender_id === $user->id ? $m->recipient_id : $m->sender_id)
            ->map(function ($group, int $otherId) use ($user, $others) {
                $other = $others->get($otherId);
                $last = $group->last();

                return [
                    'id' => $otherId,
                    'name' => $other?->name ?? '—',
                    'role' => $this->roleLabel($other),
                    'init' => $other ? AcademyAnalytics::initials($other->name) : '—',
                    'col' => $other ? AcademyAnalytics::avatarColor($other->id) : '#64748b',
                    'unread' => $group->where('recipient_id', $user->id)->whereNull('read_at')->count(),
                    'time' => $this->relativeLabel($last?->created_at),
                    'last_at' => $last?->created_at?->toIso8601String(),
                    'msgs' => $group->map(fn (Message $m) => [
                        'from' => $m->sender_id === $user->id ? 'me' : 'them',
                        'text' => $m->body,
                        'time' => $this->timeLabel($m->created_at),
                    ])->values(),
                ];
            })
            ->sortByDesc('last_at')
            ->map(fn (array $thread) => collect($thread)->except('last_at')->all())
            ->values();

        // People the student can start a conversation with: instructors of
        // their enrolled courses plus the support (admin) account.
        $courseIds = Enrollment::query()
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->pluck('course_id');

        $instructorIds = \App\Models\Course::query()
            ->whereIn('id', $courseIds)
            ->pluck('instructor_id')
            ->merge(\App\Models\Course::query()->whereIn('id', $courseIds)->with('instructors:id')->get()->flatMap->instructors->pluck('id'))
            ->unique()
            ->values();

        $support = User::role('admin')->orderBy('id')->first();

        $contactIds = $instructorIds->push($support?->id)->filter()->unique()->values();
        $contacts = User::query()->whereIn('id', $contactIds)->with('roles:id,name')->orderBy('name')->get()
            ->map(fn (User $contact) => [
                'id' => $contact->id,
                'name' => $contact->name,
                'role' => $this->roleLabel($contact),
                'init' => AcademyAnalytics::initials($contact->name),
                'col' => AcademyAnalytics::avatarColor($contact->id),
                'hasThread' => $otherIds->contains($contact->id),
            ])->values();

        return Inertia::render('Student/Messages/Index', [
            'threads' => $threads,
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id', 'not_in:'.$request->user()->id],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        Message::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $validated['recipient_id'],
            'body' => $validated['body'],
        ]);

        return back();
    }

    /** Mark all messages from one sender as read. */
    public function markRead(Request $request, User $user): RedirectResponse
    {
        Message::query()
            ->where('sender_id', $user->id)
            ->where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }

    private function roleLabel(?User $user): string
    {
        if (! $user) {
            return '';
        }
        if ($user->hasRole('admin')) {
            return 'Codexa MM Support';
        }
        if ($user->hasRole('instructor')) {
            return 'Instructor';
        }

        return ucfirst($user->roles->first()?->name ?? '');
    }

    private function relativeLabel($date): string
    {
        if (! $date) {
            return '';
        }
        $minutes = $date->diffInMinutes(now());
        if ($minutes < 1) {
            return 'အခုလေးတင်';
        }
        if ($minutes < 60) {
            return 'လွန်ခဲ့သော '.$minutes.' မိနစ်';
        }
        if ($minutes < 24 * 60) {
            return 'လွန်ခဲ့သော '.(int) ($minutes / 60).' နာရီ';
        }
        if ($date->isYesterday()) {
            return 'မနေ့က';
        }

        return self::myanmarMonth((int) $date->format('n')).' '.$date->format('d');
    }

    private static function myanmarMonth(int $month): string
    {
        return [
            1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
            5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
            9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
        ][$month] ?? '';
    }

    private function timeLabel($date): string
    {
        if (! $date) {
            return '';
        }
        $hour = (int) $date->format('G');
        $daypart = $hour < 12 ? 'မနက်' : ($hour < 16 ? 'နေ့လယ်' : ($hour < 20 ? 'ညနေ' : 'ည'));
        $time = $daypart.' '.$date->format('g:i');

        if ($date->isToday()) {
            return $time;
        }
        if ($date->isYesterday()) {
            return 'မနေ့က · '.$time;
        }

        return self::myanmarMonth((int) $date->format('n')).' '.$date->format('d').' · '.$time;
    }
}

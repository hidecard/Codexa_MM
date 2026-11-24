<?php

namespace App\Http\Controllers;

use App\Models\InstructorApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InstructorApplicationController extends Controller
{
    /**
     * Public Teach page. Logged-in users see the state of their latest
     * application (pending / approved / rejected) instead of a fresh form.
     */
    public function show(Request $request): Response
    {
        $application = null;
        if ($request->user()) {
            $application = InstructorApplication::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->first();
        }

        return Inertia::render('Public/Teach', [
            'application' => $application ? [
                'id' => $application->id,
                'status' => $application->status,
                'expertise' => $application->expertise,
                'admin_note' => $application->admin_note,
                'created_at' => optional($application->created_at)?->toDateString(),
            ] : null,
        ]);
    }

    /**
     * Submit an instructor application. One pending application per user;
     * users who are already instructors cannot apply again. A rejected
     * applicant may apply again.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasRole('instructor')) {
            throw ValidationException::withMessages([
                'application' => 'သင်သည် Instructor တစ်ဦး ဖြစ်နေပါပြီ။',
            ]);
        }

        $pending = InstructorApplication::query()
            ->where('user_id', $user->id)
            ->where('status', InstructorApplication::STATUS_PENDING)
            ->exists();

        if ($pending) {
            throw ValidationException::withMessages([
                'application' => 'စောင့်ဆိုင်းဆဲ လျှောက်လွှာ တစ်ခု ရှိနေပါပြီ။ Admin စစ်ဆေးပြီးမှ အသစ် တင်နိုင်ပါမယ်။',
            ]);
        }

        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:2000'],
            'expertise' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:255'],
            'portfolio_links' => ['nullable', 'array', 'max:5'],
            'portfolio_links.*' => ['nullable', 'string', 'max:500'],
        ]);

        InstructorApplication::create([
            'user_id' => $user->id,
            'bio' => $validated['bio'] ?? null,
            'expertise' => $validated['expertise'],
            'experience' => $validated['experience'] ?? null,
            'portfolio_links' => array_values(array_filter($validated['portfolio_links'] ?? [])),
            'status' => InstructorApplication::STATUS_PENDING,
        ]);

        return back()->with('success', 'လျှောက်လွှာ တင်ပြီးပါပြီ — Admin အဖွဲ့က ၂ ရက်အတွင်း စစ်ဆေး အကြောင်းပြန်ပါမယ်။');
    }
}

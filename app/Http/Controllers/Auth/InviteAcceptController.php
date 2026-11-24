<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Staff invitation acceptance. Reached only through the temporary signed
 * link emailed by StaffController::invite; the 'signed' middleware on the
 * routes verifies the signature and the 7-day expiry.
 */
class InviteAcceptController extends Controller
{
    use PasswordValidationRules;

    public function create(Request $request, User $user): Response
    {
        return Inertia::render('Auth/AcceptInvite', [
            'name' => $user->name,
            'email' => $user->email,
            // The form must POST back to this same signed URL so the
            // 'signed' middleware on the POST route still passes.
            'acceptUrl' => $request->fullUrl(),
        ]);
    }

    public function store(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => $this->passwordRules(),
        ]);

        $user->forceFill([
            'password' => Hash::make($request->input('password')),
        ])->save();

        return redirect()->route('login')
            ->with('status', 'Your password has been set. You can now sign in.');
    }
}

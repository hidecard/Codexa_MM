<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Admin\Academy\GamificationController;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function index(Request $request, BadgeService $badges): Response
    {
        $user = $request->user();

        // Visiting the leaderboard also awards newly earned badges.
        $badges->evaluate($user);

        $xpRules = [];
        foreach (GamificationController::xpRules() as $key => $rule) {
            $xpRules[] = [
                'action' => $rule['label'],
                'xp' => ((int) Setting::getValue($key, $rule['value'])).' XP',
            ];
        }

        return Inertia::render('Student/Leaderboard', [
            'week' => $badges->leaderboard(Carbon::now()->subDays(7), $user->id),
            'month' => $badges->leaderboard(Carbon::now()->subDays(30), $user->id),
            'xpRules' => $xpRules,
        ]);
    }
}

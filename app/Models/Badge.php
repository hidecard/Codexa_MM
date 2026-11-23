<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'icon', 'description', 'rule_type', 'threshold', 'is_active'])]
class Badge extends Model
{
    use HasFactory;

    public const RULE_XP_THRESHOLD = 'xp_threshold';

    public const RULE_COURSES_COMPLETED = 'courses_completed';

    public const RULE_LESSONS_COMPLETED = 'lessons_completed';

    public const RULE_QUIZZES_PASSED = 'quizzes_passed';

    public const RULE_ASSIGNMENTS_SUBMITTED = 'assignments_submitted';

    protected function casts(): array
    {
        return ['threshold' => 'integer', 'is_active' => 'boolean'];
    }

    public function awards(): HasMany
    {
        return $this->hasMany(BadgeAward::class);
    }

    /**
     * The starter badge set. Icons are keys into the Achievements page
     * icon map (book, cert, flame, quiz, pen, chat, live, moon, target).
     */
    public static function starterBadges(): array
    {
        return [
            ['name' => 'First Steps', 'icon' => 'book', 'description' => 'ပထမဆုံး သင်ခန်းစာ ပြီးဆုံးခြင်း', 'rule_type' => self::RULE_LESSONS_COMPLETED, 'threshold' => 1],
            ['name' => 'First Course', 'icon' => 'cert', 'description' => 'သင်တန်း ၁ ခု ပြီးဆုံးခြင်း', 'rule_type' => self::RULE_COURSES_COMPLETED, 'threshold' => 1],
            ['name' => '100 XP', 'icon' => 'target', 'description' => 'စုစုပေါင်း 100 XP ပြည့်ခြင်း', 'rule_type' => self::RULE_XP_THRESHOLD, 'threshold' => 100],
            ['name' => '500 XP', 'icon' => 'target', 'description' => 'စုစုပေါင်း 500 XP ပြည့်ခြင်း', 'rule_type' => self::RULE_XP_THRESHOLD, 'threshold' => 500],
            ['name' => '5 Courses', 'icon' => 'cert', 'description' => 'သင်တန်း ၅ ခု ပြီးဆုံးခြင်း', 'rule_type' => self::RULE_COURSES_COMPLETED, 'threshold' => 5],
            ['name' => 'Quiz Master', 'icon' => 'quiz', 'description' => 'Quiz 10 ခု အောင်မြင်ခြင်း', 'rule_type' => self::RULE_QUIZZES_PASSED, 'threshold' => 10],
            ['name' => 'Assignment Star', 'icon' => 'pen', 'description' => 'Assignment 5 ခု တင်သွင်းခြင်း', 'rule_type' => self::RULE_ASSIGNMENTS_SUBMITTED, 'threshold' => 5],
            ['name' => '5,000 XP', 'icon' => 'target', 'description' => 'စုစုပေါင်း 5,000 XP ပြည့်ခြင်း', 'rule_type' => self::RULE_XP_THRESHOLD, 'threshold' => 5000],
        ];
    }

    /**
     * Create any missing starter badges. Idempotent; safe to call on
     * every badge evaluation so the set exists even when the seeder
     * was never run.
     */
    public static function ensureSeeded(): void
    {
        foreach (static::starterBadges() as $badge) {
            static::query()->firstOrCreate(['name' => $badge['name']], $badge);
        }
    }
}

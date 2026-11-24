<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Database\Seeder;

/**
 * Builds learning paths from the courses the catalog seeder created, so
 * the student Paths pages show real paths with real course steps.
 * Idempotent: paths are matched by title and their course order is synced.
 */
class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $bySlug = Course::query()->pluck('id', 'slug');

        $paths = [
            [
                'title' => 'Web Developer လမ်းကြောင်း',
                'description' => 'JavaScript အခြေခံကနေ Full-Stack web app တစ်ခုလုံး တည်ဆောက်နိုင်တဲ့ အထိ အဆင့်ဆင့် လေ့လာရန်။',
                'level' => 'Beginner → Advanced',
                'duration_label' => '၄–၆ လ',
                'gradient' => 'linear-gradient(130deg,#0b3b5e,#0ea892)',
                'glyph' => '</>',
                'outcomes' => [
                    'JavaScript ဖြင့် interactive web page များ တည်ဆောက်နိုင်ခြင်း',
                    'Full-stack web application တစ်ခု ကိုယ်တိုင် တည်ဆောက်ပြီး',
                    'Junior Web Developer အလုပ်များ လျှောက်ရန် အဆင်သင့်',
                ],
                'sort_order' => 1,
                'courses' => ['programming-with-javascript', 'full-stack-web-development'],
            ],
            [
                'title' => 'Product & Design လမ်းကြောင်း',
                'description' => 'အကြံဉာဏ်တစ်ခုကို သုံးစွဲရလွယ်တဲ့ ထုတ်ကုန် တစ်ခုအဖြစ် ပြောင်းလဲနိုင်ဖို့ design နဲ့ product အခြေခံကို လေ့လာရန်။',
                'level' => 'Beginner → Intermediate',
                'duration_label' => '၃–၄ လ',
                'gradient' => 'linear-gradient(130deg,#831843,#ec4899)',
                'glyph' => 'UX',
                'outcomes' => [
                    'User journey နဲ့ wireframe များ ဆွဲနိုင်ခြင်း',
                    'Interface system တစ်ခု တည်ဆောက်နိုင်ခြင်း',
                    'Product ဆုံးဖြတ်ချက်တွေကို ရှင်းလင်းစွာ တင်ပြနိုင်ခြင်း',
                ],
                'sort_order' => 2,
                'courses' => ['digital-product-design', 'full-stack-web-development'],
            ],
        ];

        foreach ($paths as $attributes) {
            $slugs = $attributes['courses'];
            unset($attributes['courses']);

            $courseIds = collect($slugs)
                ->map(fn (string $slug) => $bySlug[$slug] ?? null)
                ->filter()
                ->values();

            if ($courseIds->isEmpty()) {
                continue;
            }

            $path = LearningPath::updateOrCreate(['title' => $attributes['title']], $attributes);
            $path->courses()->sync(
                $courseIds->mapWithKeys(fn (int $id, int $position) => [$id => ['position' => $position + 1]])->all()
            );
        }
    }
}

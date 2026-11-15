<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\PortfolioProject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublicContentSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->role('admin')->first() ?? User::query()->first();

        $categories = collect([
            ['name' => 'Academy', 'description' => 'Learning and course insights.'],
            ['name' => 'Engineering', 'description' => 'Building and shipping software.'],
            ['name' => 'Community', 'description' => 'Updates from Codexa MM.'],
        ])->mapWithKeys(fn ($c) => [$c['name'] => BlogCategory::updateOrCreate(['slug' => Str::slug($c['name'])], ['name' => $c['name'], 'slug' => Str::slug($c['name']), 'description' => $c['description']])]);

        $posts = [
            ['title' => 'Learning to ship: a practical path for new developers', 'category' => 'Academy', 'excerpt' => 'How guided projects and fundamentals build real confidence.'],
            ['title' => 'Building reliable web platforms with clarity', 'category' => 'Engineering', 'excerpt' => 'What we prioritize when delivering maintainable systems.'],
        ];
        foreach ($posts as $post) {
            BlogPost::updateOrCreate(
                ['slug' => Str::slug($post['title'])],
                [
                    'category_id' => $categories[$post['category']]->id,
                    'author_id' => $author?->id,
                    'title' => $post['title'],
                    'slug' => Str::slug($post['title']),
                    'excerpt' => $post['excerpt'],
                    'content' => $post['excerpt']."\n\nCodexa MM shares practical lessons from academy and delivery work. More details coming soon.",
                    'status' => 'published',
                    'published_at' => now(),
                ]
            );
        }

        $projects = [
            ['title' => 'Education Portal Platform', 'client_name' => 'Codexa Academy', 'short_description' => 'A learning experience for courses, lessons, and student progress.', 'description' => 'A web platform designed to support structured learning, course discovery, and future student progress tracking.', 'technologies' => ['Laravel', 'React', 'TypeScript', 'Tailwind'], 'position' => 1],
            ['title' => 'Client Service Operations', 'client_name' => 'Codexa Solutions', 'short_description' => 'A foundation for managing inquiries, projects, and delivery.', 'description' => 'A system blueprint for quotations, projects, milestones, and client collaboration.', 'technologies' => ['Laravel', 'Inertia', 'PostgreSQL'], 'position' => 2],
        ];
        foreach ($projects as $p) {
            PortfolioProject::updateOrCreate(['slug' => Str::slug($p['title'])], [...$p, 'slug' => Str::slug($p['title']), 'status' => 'published', 'published_at' => now()]);
        }

        $faqs = [
            ['question' => 'What is Codexa MM?', 'answer' => 'Codexa MM brings together Codexa Academy for programming education and Codexa Solutions for software development services.', 'category' => 'General', 'sort_order' => 1],
            ['question' => 'Who can enroll in courses?', 'answer' => 'Anyone can register as a student, browse published courses, and enroll when enrollment is available.', 'category' => 'Academy', 'sort_order' => 2],
            ['question' => 'Do you build custom software?', 'answer' => 'Yes. We design and build web platforms, digital systems, and product experiences. Contact us to discuss your needs.', 'category' => 'Solutions', 'sort_order' => 3],
            ['question' => 'How do I contact Codexa MM?', 'answer' => 'Use the contact form on our website or email hello@codexamm.com.', 'category' => 'General', 'sort_order' => 4],
        ];
        foreach ($faqs as $faq) {
            Faq::updateOrCreate(['question' => $faq['question']], [...$faq, 'is_published' => true]);
        }
    }
}

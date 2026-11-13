<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            ['name' => 'Product Development', 'slug' => 'product-development', 'description' => 'From a clear product direction to a reliable release.', 'position' => 1],
            ['name' => 'Digital Systems', 'slug' => 'digital-systems', 'description' => 'Make your operations simpler, faster, and more connected.', 'position' => 2],
            ['name' => 'Product Design', 'slug' => 'product-design', 'description' => 'Give people a digital experience worth returning to.', 'position' => 3],
        ];

        $categories = collect($catalog)->mapWithKeys(fn (array $attributes) => [
            $attributes['slug'] => ServiceCategory::updateOrCreate(['slug' => $attributes['slug']], $attributes),
        ]);

        $services = [
            ['category' => 'product-development', 'title' => 'Web Platform Development', 'slug' => 'web-platform-development', 'short_description' => 'Build secure, maintainable web platforms that are ready to grow with your team.', 'description' => 'We pair product thinking with strong engineering to take your platform from idea to reliable release.', 'features' => ['Product discovery and roadmap', 'Laravel and React engineering', 'Deployment and technical handover']],
            ['category' => 'digital-systems', 'title' => 'Business System Modernization', 'slug' => 'business-system-modernization', 'short_description' => 'Connect the systems and workflows that keep your business moving.', 'description' => 'We simplify legacy processes and design practical digital systems your people can use every day.', 'features' => ['Workflow mapping', 'Custom internal tools', 'Reporting and integrations']],
            ['category' => 'product-design', 'title' => 'UX and Interface Design', 'slug' => 'ux-interface-design', 'short_description' => 'Turn complex product ideas into clear, useful experiences.', 'description' => 'We help teams make better product decisions through research, prototyping, and thoughtful interface systems.', 'features' => ['User research and journeys', 'Wireframes and prototypes', 'Design systems and handoff']],
        ];

        foreach ($services as $attributes) {
            $category = $categories[$attributes['category']];
            unset($attributes['category']);
            Service::updateOrCreate(
                ['slug' => $attributes['slug']],
                [...$attributes, 'category_id' => $category->id, 'status' => 'active'],
            );
        }
    }
}

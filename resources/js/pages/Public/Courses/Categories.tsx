import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PublicLayout } from '@/components/shared/public-layout';
import { SAMPLE_CATEGORIES, SAMPLE_COURSES, categoryMeta, formatCount } from '../sample-data';

type Category = { id: number; name: string; slug: string; description?: string | null; courses_count?: number };
type Props = { categories?: Category[] };

export default function Categories({ categories: apiCategories }: Props) {
    const usingSample = !apiCategories || apiCategories.length === 0;
    const categories: { key: string; name: string; slug: string; description?: string | null; count: number; students: number }[] = usingSample
        ? SAMPLE_CATEGORIES.map((c) => {
              const mine = SAMPLE_COURSES.filter((course) => course.category === c.name);
              return { key: c.name, name: c.name, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), count: mine.length, students: mine.reduce((s, course) => s + (course.students ?? 0), 0) };
          })
        : apiCategories!.map((c) => ({ key: String(c.id), name: c.name, slug: c.slug, description: c.description, count: c.courses_count ?? 0, students: 0 }));

    return (
        <PublicLayout>
            <Head title="သင်တန်း နယ်ပယ်များ" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">နယ်ပယ်အလိုက် သင်တန်းများ</h1>
                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ကိုယ် စိတ်ဝင်စားတဲ့ လမ်းကြောင်းကို ရွေးပြီး စတင်လိုက်ပါ</p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((c) => {
                        const meta = categoryMeta(c.name);
                        return (
                            <Link
                                key={c.key}
                                href={`/courses?category=${c.slug}`}
                                className="group overflow-hidden rounded-2xl bg-white ring-1 ring-[#dce3f0] transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#0d1730] dark:ring-[#1e2c52]"
                            >
                                <div className="flex items-center justify-between p-5 text-white" style={{ background: meta.grad }}>
                                    <span className="font-mono text-3xl font-bold" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                        {meta.glyph}
                                    </span>
                                    <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold backdrop-blur">သင်တန်း {c.count} ခု</span>
                                </div>
                                <div className="p-5">
                                    <h2 className="text-lg font-extrabold">{c.name}</h2>
                                    {c.description ? (
                                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{c.description}</p>
                                    ) : (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                                            <BookOpen className="size-4" />
                                            {c.students > 0 ? `ကျောင်းသား ${formatCount(c.students)} ယောက် သင်ယူနေပါတယ်` : 'သင်တန်းများ ကြည့်ရန်'}
                                        </p>
                                    )}
                                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-teal-700 group-hover:gap-2.5 dark:text-teal-300">
                                        သင်တန်းများ ကြည့်ရန် <ArrowRight className="size-4" />
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-10 rounded-2xl bg-white p-6 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <p className="font-extrabold">ဘယ် နယ်ပယ်က စရမလဲ မသိသေးဘူးလား?</p>
                    <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">အလုပ်အကိုင် လမ်းကြောင်းတွေက သင်တန်းတွေကို အဆင့်ဆင့် စီထားပေးပါတယ်။</p>
                    <Link href="/student/paths" className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                        လမ်းကြောင်းများ ကြည့်ရန်
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}

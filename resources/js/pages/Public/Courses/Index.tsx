import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { CourseCard } from '@/components/lms/course-card';
import { formatCount, mapApiCourse, type ApiCourse } from '@/lib/ui-utils';

type Category = { id: number; name: string; slug: string };
type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
type Props = {
    courses?: Page<ApiCourse>;
    categories?: Category[];
    filters?: { q?: string; category?: number | null; level?: string | null; sort?: string | null };
};

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sorts = [
    { value: 'newest', label: 'နောက်ဆုံးထွက်' },
    { value: 'priceAsc', label: 'ဈေးအနည်းဆုံး' },
    { value: 'priceDesc', label: 'ဈေးအများဆုံး' },
];

export default function Index({ courses, categories = [], filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category?.toString() ?? '');
    const [level, setLevel] = useState(filters.level ?? 'All');
    const [sort, setSort] = useState(filters.sort ?? 'newest');

    const go = (next: { q?: string; category?: string; level?: string; sort?: string }) => {
        router.get(
            '/courses',
            {
                q: next.q || undefined,
                category: next.category || undefined,
                level: next.level && next.level !== 'All' ? next.level : undefined,
                sort: next.sort && next.sort !== 'newest' ? next.sort : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        go({ q, category, level, sort });
    };

    const pickCategory = (id: string) => {
        setCategory(id);
        go({ q, category: id, level, sort });
    };

    const total = courses?.total ?? 0;

    return (
        <PublicLayout>
            <Head title="သင်တန်းများ" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">သင်တန်းများ ရှာဖွေရန်</h1>
                        <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                            Programming, Web, Mobile နဲ့ Design သင်တန်း <b className="text-[#0d1730] dark:text-white">{formatCount(total)}</b> ခု ရှိပါတယ်
                        </p>
                    </div>
                    <Link href="/courses/categories" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                        နယ်ပယ်အလိုက် ကြည့်ရန် →
                    </Link>
                </div>

                <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        type="button"
                        onClick={() => pickCategory('')}
                        className={`flex-none rounded-full px-4 py-2 text-sm font-bold transition ${
                            category === ''
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                        }`}
                    >
                        အားလုံး
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => pickCategory(c.id.toString())}
                            className={`flex-none rounded-full px-4 py-2 text-sm font-bold transition ${
                                category === c.id.toString()
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
                    <label className="relative min-w-[210px] flex-1">
                        <span className="sr-only">သင်တန်း ရှာရန်</span>
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8494b3] dark:text-[#67779c]" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="သင်တန်းအမည်၊ နည်းပညာ ရှာရန်…"
                            className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm ring-1 ring-[#dce3f0] outline-none placeholder:text-[#8494b3] focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:placeholder:text-[#67779c]"
                        />
                    </label>
                    <select
                        value={level}
                        onChange={(e) => {
                            setLevel(e.target.value);
                            go({ q, category, level: e.target.value, sort });
                        }}
                        aria-label="Level"
                        className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold ring-1 ring-[#dce3f0] outline-none focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52]"
                    >
                        {levels.map((l) => (
                            <option key={l} value={l}>
                                {l === 'All' ? 'Level အားလုံး' : l}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            go({ q, category, level, sort: e.target.value });
                        }}
                        aria-label="Sort"
                        className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold ring-1 ring-[#dce3f0] outline-none focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52]"
                    >
                        {sorts.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                        ရှာဖွေရန်
                    </button>
                </form>

                {courses && courses.data.length > 0 ? (
                    <>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {courses.data.map((course) => (
                                <CourseCard key={course.id} course={mapApiCourse(course)} showAddToCart />
                            ))}
                        </div>
                        {courses.links.length > 3 && (
                            <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                                {courses.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                                                link.active
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="rounded-lg px-3 py-2 text-sm text-[#8494b3]" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </nav>
                        )}
                    </>
                ) : (
                    <EmptyCatalog
                        onReset={() => {
                            setQ('');
                            setCategory('');
                            setLevel('All');
                            router.get('/courses', {}, { preserveState: true, replace: true });
                        }}
                    />
                )}
            </div>
        </PublicLayout>
    );
}

function EmptyCatalog({ onReset }: { onReset: () => void }) {
    return (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
            <p className="text-lg font-extrabold">ရှာဖွေမှုနဲ့ ကိုက်ညီတဲ့ သင်တန်း မတွေ့ပါ</p>
            <p className="mt-1.5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">တခြား keyword သို့မဟုတ် category ဖြင့် ပြန်ရှာကြည့်ပါ</p>
            <button
                type="button"
                onClick={onReset}
                className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
            >
                Filter အားလုံး ရှင်းရန်
            </button>
        </div>
    );
}

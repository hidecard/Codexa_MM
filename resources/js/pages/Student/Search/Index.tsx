import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CourseCard } from '@/components/lms/course-card';
import { Search as SearchIcon, Star, User } from 'lucide-react';

type CourseResult = {
    id: number;
    slug: string;
    title: string;
    category: string;
    instructor: string;
    price: number;
    oldPrice: number | null;
    rating: number;
    students: number;
    level: string;
};

type InstructorResult = {
    name: string;
    role: string;
    rating: number;
    students: number;
};

type PathResult = {
    id: number;
    title: string;
    desc: string;
};

type ArticleResult = {
    title: string;
    cat: string;
    href: string;
};

type Props = {
    query?: string;
    tab?: string;
    courses?: CourseResult[];
    instructors?: InstructorResult[];
    paths?: PathResult[];
    articles?: ArticleResult[];
};

const TABS: { key: string; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'courses', label: 'သင်တန်း' },
    { key: 'instructors', label: 'ဆရာ' },
    { key: 'paths', label: 'လမ်းကြောင်း' },
    { key: 'articles', label: 'ဆောင်းပါး' },
];

export default function Index(): JSX.Element {
    const { data } = usePage<Props>();
    const query = data.query ?? '';
    const tab = (data.tab ?? 'all') as (typeof TABS)[number]['key'];
    const courses = data.courses ?? [];
    const instructors = data.instructors ?? [];
    const paths = data.paths ?? [];
    const articles = data.articles ?? [];

    const [localQuery, setLocalQuery] = useState(query);
    const [localTab, setLocalTab] = useState(tab);

    const q = localQuery.trim().toLowerCase();
    const match = (text: string) => !q || text.toLowerCase().includes(q);

    const total = courses.length + instructors.length + paths.length + articles.length;

    return (
        <LmsShell title="ရှာဖွေရန်" nav="student">
            <Head title="Search" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><SearchIcon className="size-7 text-teal-600" /> ရှာဖွေရန်</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်တန်း၊ ဆရာ၊ ဆောင်းပါးနှင့် လမ်းကြောင်းများကို ရှာဖွေပါ</p>
            </div>

            <div className="relative mt-6">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="ဥပမာ: React, Python, Thura Aung…"
                    autoFocus
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setLocalTab(t.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${localTab === t.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                {q ? `“${localQuery.trim()}” အတွက် ရလဒ် ${total} ခု တွေ့ရှိပါသည်` : `ရလဒ် စုစုပေါင်း ${total} ခု`}
            </p>

            {(localTab === 'all' || localTab === 'courses') && courses.length > 0 && (
                <section className="mt-6">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">သင်တန်းများ ({courses.length})</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((c) => (
                            <Link
                                key={c.id}
                                href={`/courses/${c.slug}`}
                                className="block"
                            >
                                <CourseCard
                                    course={{
                                        id: c.id,
                                        slug: c.slug,
                                        title: c.title,
                                        category: c.category,
                                        instructor: c.instructor,
                                        price: c.price,
                                        oldPrice: c.oldPrice,
                                        rating: c.rating,
                                        students: c.students,
                                        level: c.level,
                                    }}
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {(localTab === 'all' || localTab === 'instructors') && instructors.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ဆရာ/ဆရာမများ ({instructors.length})</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {instructors.map((i) => (
                            <Link key={i.name} href="/instructors" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
                                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-sm font-extrabold text-white"><User className="size-6" /></span>
                                <span>
                                    <span className="block font-extrabold text-slate-900 dark:text-white">{i.name}</span>
                                    <span className="mt-0.5 block text-xs text-teal-600">{i.role}</span>
                                    <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {i.rating} · ကျောင်းသား {i.students.toLocaleString()} ယောက်</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {(localTab === 'all' || localTab === 'paths') && paths.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">လမ်းကြောင်းများ ({paths.length})</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {paths.map((p) => (
                            <Link key={p.id} href={`/student/paths/${p.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
                                <span className="block font-extrabold text-slate-900 dark:text-white">{p.title}</span>
                                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{p.desc}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {(localTab === 'all' || localTab === 'articles') && articles.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Community ဆောင်းပါးများ ({articles.length})</h2>
                    <div className="mt-4 flex flex-col gap-3">
                        {articles.map((a) => (
                            <Link key={a.title} href={a.href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
                                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{a.cat}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{a.title}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {total === 0 && (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <SearchIcon className="mx-auto size-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">ရှာဖွေမှု မတွေ့ပါ</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အခြား စကားလုံးပြီး ထပ်ရှာကြည့်ပါ၊ သို့မဟုတ် သင်တန်း စာရင်းကို ကြည့်ပါ။</p>
                    <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>
                </div>
            )}
        </LmsShell>
    );
}

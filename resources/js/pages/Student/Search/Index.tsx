import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CourseCard } from '@/components/lms/course-card';
import { Search as SearchIcon, Star, User } from 'lucide-react';

type Props = { query?: string };

/* SAMPLE DATA — fallback only; search runs over the prototype catalog (no search backend yet). */
const COURSES = [
    { id: 1, slug: 'html-css-foundations', title: 'HTML & CSS Foundations', category: 'Web Development', instructor: 'Thura Aung', price: 45000, oldPrice: 90000, rating: 4.9, students: 2340, level: 'Beginner' },
    { id: 2, slug: 'javascript-deep-dive', title: 'JavaScript Deep Dive', category: 'Web Development', instructor: 'May Thazin', price: 75000, oldPrice: 150000, rating: 4.8, students: 1985, level: 'Intermediate' },
    { id: 3, slug: 'python-for-beginners', title: 'Python for Beginners', category: 'Programming', instructor: 'Kaung Htet Oo', price: 50000, oldPrice: 100000, rating: 4.9, students: 3120, level: 'Beginner' },
    { id: 4, slug: 'react-complete-course', title: 'React.js Complete Course', category: 'Web Development', instructor: 'Thura Aung', price: 95000, oldPrice: 180000, rating: 4.8, students: 1640, level: 'Intermediate' },
    { id: 5, slug: 'php-laravel-framework', title: 'PHP & Laravel Framework', category: 'Backend', instructor: 'Aung Khant', price: 85000, oldPrice: 160000, rating: 4.7, students: 1210, level: 'Intermediate' },
    { id: 6, slug: 'flutter-mobile-development', title: 'Flutter Mobile Development', category: 'Mobile', instructor: 'Su Myat Noe', price: 90000, oldPrice: 170000, rating: 4.8, students: 980, level: 'Intermediate' },
    { id: 7, slug: 'ui-ux-design-with-figma', title: 'UI/UX Design with Figma', category: 'Design', instructor: 'Nilar Win', price: 40000, oldPrice: 80000, rating: 4.9, students: 1750, level: 'Beginner' },
    { id: 8, slug: 'mysql-database-design', title: 'MySQL & Database Design', category: 'Backend', instructor: 'Aung Khant', price: 35000, oldPrice: 70000, rating: 4.7, students: 890, level: 'Beginner' },
    { id: 9, slug: 'nodejs-api-development', title: 'Node.js API Development', category: 'Backend', instructor: 'May Thazin', price: 80000, oldPrice: 150000, rating: 4.8, students: 760, level: 'Advanced' },
    { id: 10, slug: 'git-github-team-workflow', title: 'Git, GitHub & Team Workflow', category: 'Tools', instructor: 'Kaung Htet Oo', price: 25000, oldPrice: 50000, rating: 4.8, students: 1430, level: 'Beginner' },
];
const INSTRUCTORS = [
    { name: 'Thura Aung', role: 'Web Development Instructor', rating: '4.9', students: 3980 },
    { name: 'May Thazin', role: 'JavaScript & Node.js Instructor', rating: '4.8', students: 2745 },
    { name: 'Kaung Htet Oo', role: 'Programming Instructor', rating: '4.9', students: 4550 },
    { name: 'Aung Khant', role: 'Backend Instructor', rating: '4.7', students: 2100 },
    { name: 'Su Myat Noe', role: 'Mobile Development Instructor', rating: '4.8', students: 980 },
    { name: 'Nilar Win', role: 'UI/UX Design Instructor', rating: '4.9', students: 1750 },
];
const PATHS = [
    { id: 1, title: 'Web Developer လမ်းကြောင်း', desc: 'Frontend ကနေ Backend အထိ ပြည့်စုံတဲ့ web developer တစ်ဦး ဖြစ်ရန်' },
    { id: 2, title: 'Python & Data လမ်းကြောင်း', desc: 'Python ကို ကျွမ်းကျင်ပြီး data analysis လမ်းကြောင်းသို့ ဝင်ရောက်ရန်' },
    { id: 3, title: 'Mobile Developer လမ်းကြောင်း', desc: 'Flutter ဖြင့် Android / iOS app များ တည်ဆောက်ပြီး store ပေါ် တင်နိုင်ရန်' },
    { id: 4, title: 'UI/UX Designer လမ်းကြောင်း', desc: 'Design အခြေခံကနေ professional UI/UX designer တစ်ဦး ဖြစ်ရန်' },
];
const ARTICLES = [
    { title: 'useEffect ကို ဘယ်အချိန်မှာ သုံးသင့်လဲ?', cat: 'React', href: '/student/community/1' },
    { title: 'List နဲ့ Dict — ဘယ်အချိန် ဘာသုံးသင့်လဲ?', cat: 'Python', href: '/student/community/2' },
    { title: 'Flutter မှာ state management ဘာနဲ့ စသင့်လဲ?', cat: 'Mobile', href: '/student/community/5' },
];

const TABS = ['All', 'သင်တန်း', 'ဆရာ', 'ဆောင်းပါး', 'လမ်းကြောင်း'] as const;
type Tab = (typeof TABS)[number];

export default function Index({ query: initialQuery = '' }: Props) {
    const [query, setQuery] = useState(initialQuery);
    const [tab, setTab] = useState<Tab>('All');
    const q = query.trim().toLowerCase();

    const match = (text: string) => !q || text.toLowerCase().includes(q);
    const courses = COURSES.filter((c) => match(`${c.title} ${c.category} ${c.instructor}`));
    const instructors = INSTRUCTORS.filter((i) => match(`${i.name} ${i.role}`));
    const articles = ARTICLES.filter((a) => match(`${a.title} ${a.cat}`));
    const paths = PATHS.filter((p) => match(`${p.title} ${p.desc}`));
    const total = courses.length + instructors.length + articles.length + paths.length;

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
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ဥပမာ: React, Python, Thura Aung…"
                    autoFocus
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {t === 'All' ? 'အားလုံး' : t}
                    </button>
                ))}
            </div>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                {q ? `“${query.trim()}” အတွက် ရလဒ် ${total} ခု တွေ့ရှိပါသည်` : `ရလဒ် စုစုပေါင်း ${total} ခု`}
            </p>

            {(tab === 'All' || tab === 'သင်တန်း') && courses.length > 0 && (
                <section className="mt-6">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">သင်တန်းများ ({courses.length})</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
                    </div>
                </section>
            )}

            {(tab === 'All' || tab === 'ဆရာ') && instructors.length > 0 && (
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

            {(tab === 'All' || tab === 'လမ်းကြောင်း') && paths.length > 0 && (
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

            {(tab === 'All' || tab === 'ဆောင်းပါး') && articles.length > 0 && (
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
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အခြား စကားလုံးဖြင့် ထပ်ရှာကြည့်ပါ၊ သို့မဟုတ် သင်တန်း စာရင်းကို ကြည့်ပါ။</p>
                    <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>
                </div>
            )}
        </LmsShell>
    );
}

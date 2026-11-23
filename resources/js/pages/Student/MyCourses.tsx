import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen, CheckCircle2, PlayCircle, Search } from 'lucide-react';

type Enrollment = {
    id: number;
    status: string;
    enrolled_at?: string | null;
    progress?: number;
    completed_lessons?: number;
    total_lessons?: number;
    course: { id: number; title: string; slug: string; category?: string | null; instructor?: string | null; thumbnail?: string | null };
};

type Filter = 'all' | 'active' | 'completed' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'active', label: 'သင်ယူနေဆဲ' },
    { key: 'completed', label: 'ပြီးစီးပြီးသား' },
    { key: 'pending', label: 'စောင့်နေဆဲ' },
];

export default function MyCourses({ enrollments = [] }: { enrollments?: Enrollment[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const [query, setQuery] = useState('');

    const filtered = enrollments.filter((e) => {
        if (filter === 'active' && e.status !== 'active') return false;
        if (filter === 'completed' && e.status !== 'completed') return false;
        if (filter === 'pending' && e.status !== 'pending') return false;
        if (query && !e.course.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="သင်တန်းများ" nav="student">
            <Head title="My Courses" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ကျွန်ုပ်၏ သင်တန်းများ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">စာရင်းသွင်းထားသော သင်တန်းများ · {enrollments.length} ခု</p>
                </div>
                <Link href="/courses" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">သင်တန်း ထပ်ရှာရန်</Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="သင်တန်း ရှာဖွေရန်…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<BookOpen className="size-10" />}
                    title={enrollments.length === 0 ? 'သင်တန်း မရှိသေးပါ' : 'ရှာဖွေမှု မတွေ့ပါ'}
                    description={enrollments.length === 0 ? 'သင်တန်း စာရင်းသွင်းပြီး စတင် သင်ယူလိုက်ပါ။' : 'အခြား စကားလုံးဖြင့် ထပ်ရှာကြည့်ပါ။'}
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ရှာဖွေရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((e) => {
                        const progress = e.progress ?? (e.status === 'completed' ? 100 : 0);
                        return (
                            <article key={e.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        {e.course.category && <p className="text-xs font-bold uppercase tracking-wider text-teal-600">{e.course.category}</p>}
                                        <h2 className="mt-1 text-lg font-extrabold leading-snug text-slate-900 dark:text-white">{e.course.title}</h2>
                                        {e.course.instructor && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{e.course.instructor}</p>}
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${e.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : e.status === 'active' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{e.status}</span>
                                </div>
                                <div className="mt-4"><ProgressBar value={progress} tone="teal" /></div>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {e.completed_lessons !== undefined && e.total_lessons !== undefined
                                        ? `${e.completed_lessons}/${e.total_lessons} သင်ခန်းစာ · ${progress}% ပြီးစီး`
                                        : `${progress}% ပြီးစီး`}
                                    {e.enrolled_at ? ` · ${e.enrolled_at} တွင် စာရင်းသွင်း` : ''}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {e.status === 'active' || e.status === 'completed' ? (
                                        <Link href={`/student/courses/${e.course.id}/learn`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">
                                            <PlayCircle className="size-4" /> {e.status === 'completed' ? 'ပြန်ကြည့်ရန်' : 'ဆက်လက်သင်ယူရန်'}
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-800">ငွေပေးချေ အတည်ပြုရန် စောင့်နေသည်</span>
                                    )}
                                    <Link href={`/courses/${e.course.slug}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသေးစိတ်</Link>
                                    {e.status === 'completed' && <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-4" /> ပြီးစီးပြီးပါပြီ</span>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

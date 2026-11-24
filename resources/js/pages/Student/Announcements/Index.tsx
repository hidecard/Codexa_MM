import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell, ChevronLeft } from 'lucide-react';

type Announcement = {
    id: number;
    title: string;
    content: string;
    published_at: string;
    category: string;
    audience: string;
    pinned: boolean;
    course?: { id: number; title: string; slug: string } | null;
};

type Filter = 'all' | 'pinned' | 'general' | 'schedule' | 'assignment' | 'exam';

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'pinned', label: 'ဖတ်ထားစာ' },
    { key: 'general', label: 'မူဝါဒ' },
    { key: 'schedule', label: 'စာရင်း' },
    { key: 'assignment', label: 'Assignment' },
    { key: 'exam', label: 'စာမေးပွဲ' },
];

const typeLabel = (t: string) => {
    switch (t) {
        case 'general':
            return 'မူဝါဒ';
        case 'schedule':
            return 'စာရင်း';
        case 'assignment':
            return 'Assignment';
        case 'exam':
            return 'စာမေးပွဲ';
        default:
            return t;
    }
};

export default function Index({ announcements = [] }: { announcements?: Announcement[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const filtered = announcements.filter(
        (a) => filter === 'all' || (filter === 'pinned' ? a.pinned : a.category === filter),
    );

    return (
        <LmsShell title="Announcements" nav="student">
            <Head title="Announcements" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Announcements</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    သင်တန်းအကြောင်းကြားချက်များ
                </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
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

            {filtered.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Bell className="size-10" />}
                    title={announcements.length === 0 ? 'Announcement မရှိသေးပါ' : 'ဤအမျိုးအစား Announcement မရှိပါ'}
                    description="ဆရာ/သင်တန်းထက်မှ Announcement အသစ်များ ပိုး၍လာပါက ဤနေရာတွင် ပေါ်လာပါမည်။"
                />
            ) : (
                <ul className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
                    {filtered.map((a) => (
                        <li key={a.id} className="py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    {a.pinned && <Bell className="size-5 shrink-0 mt-0.5 text-amber-500" />}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{a.title}</h2>
                                            {a.pinned && <Badge variant="outline">ဖတ်ထားစာ</Badge>}
                                            <Badge variant="secondary">{typeLabel(a.category)}</Badge>
                                        </div>
                                        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                                            {a.course?.title && <Link href={`/courses/${a.course.slug}`} className="font-semibold text-teal-600 hover:underline">{a.course.title}</Link>}
                                            {' '}· {new Date(a.published_at).toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{a.content}</p>
                        </li>
                    ))}
                </ul>
            )}
        </LmsShell>
    );
}
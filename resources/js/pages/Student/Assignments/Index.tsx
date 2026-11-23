import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList, Clock3 } from 'lucide-react';

type Assignment = {
    id: number;
    title: string;
    due_at?: string | null;
    max_score: number;
    course?: { id: number; title: string } | null;
    submission?: { id: number; status: string; submitted_at?: string | null; grade?: { score: number; feedback?: string | null } | null } | null;
};

type Filter = 'all' | 'pending' | 'submitted' | 'graded';

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'pending', label: 'မတင်ရသေး' },
    { key: 'submitted', label: 'တင်ပြီးပါပြီ' },
    { key: 'graded', label: 'အမှတ်ပေးပြီးပါပြီ' },
];

function statusOf(a: Assignment): 'pending' | 'submitted' | 'graded' {
    if (!a.submission) return 'pending';
    if (a.submission.status === 'graded' || a.submission.status === 'returned') return 'graded';
    return 'submitted';
}

export default function Index({ assignments = [] }: { assignments?: Assignment[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const filtered = assignments.filter((a) => filter === 'all' || statusOf(a) === filter);
    const pendingCount = assignments.filter((a) => statusOf(a) === 'pending').length;

    return (
        <LmsShell title="Assignment များ" nav="student">
            <Head title="Assignments" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Assignment များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    စာရင်းသွင်းထားသော သင်တန်းများမှ Assignment များ{pendingCount > 0 ? ` · ${pendingCount} ခု မတင်ရသေးပါ` : ''}
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
                    icon={<ClipboardList className="size-10" />}
                    title={assignments.length === 0 ? 'Assignment မရှိသေးပါ' : 'ဤအမျိုးအစား Assignment မရှိပါ'}
                    description="သင်တန်းများတွင် Assignment အသစ်များ ရှိလာပါက ဤနေရာတွင် ပေါ်လာပါမည်။"
                    action={<Link href="/student/my-courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4">
                    {filtered.map((a) => {
                        const status = statusOf(a);
                        return (
                            <Link key={a.id} href={`/student/assignments/${a.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300"><ClipboardList className="size-5" /></span>
                                        <div>
                                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{a.title}</h2>
                                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                {a.course?.title}
                                                {a.due_at ? <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> သတ်မှတ် {a.due_at}</span> : ' · သတ်မှတ် ရက်မရှိ'}
                                                <span>· အမှတ်အများဆုံး {a.max_score}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={status === 'graded' ? 'success' : status === 'submitted' ? 'secondary' : 'warning'}>
                                            {status === 'graded' ? 'အမှတ်ပေးပြီးပါပြီ' : status === 'submitted' ? 'တင်ပြီးပါပြီ' : 'မတင်ရသေး'}
                                        </Badge>
                                        {a.submission?.grade && <Badge variant="outline">{a.submission.grade.score}/{a.max_score}</Badge>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

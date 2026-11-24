import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList, FileText, Clock3, Download, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

type Submission = {
    id: number;
    content?: string | null;
    status: string;
    submitted_at?: string | null;
    assignment?: { id: number; title: string; max_score: number; due_at?: string | null; course?: { id: number; title: string; slug: string } | null } | null;
    grade?: { score: number; feedback?: string | null; graded_at?: string | null } | null;
    files?: { id: number; name: string; type?: string | null; size: number }[];
};

function statusLabel(status: string) {
    switch (status) {
        case 'submitted': return 'တင်ပြီးပါပြီ';
        case 'graded': return 'အမှတ်ပေးပြီးပါပြီ';
        case 'returned': return 'ပြန်လာပြီး';
        default: return status;
    }
}

function statusVariant(status: string) {
    if (status === 'graded' || status === 'returned') return 'success';
    if (status === 'submitted') return 'secondary';
    return 'warning';
}

export default function Index({ submissions = [] }: { submissions?: Submission[] }) {
    return (
        <LmsShell title="တင်ပြချက်များ" nav="student">
            <Head title="My Submissions" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">တင်ပြချက်များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်ပြချက်များ အားလုံးကို ဒီမှာ ကြည့်နိုင်ပါသည်</p>
            </div>

            {submissions.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<ClipboardList className="size-10" />}
                    title="တင်ပြချက် မရှိသေးပါ"
                    description="Assignment တင်ပြလာနတ်အောင် ဒီမှာ ပေါ်လာပါမယ်။"
                    action={<Link href="/student/assignments" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">Assignments ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4">
                    {submissions.map((s) => (
                        <Link key={s.id} href={s.assignment?.course?.slug ? `/student/courses/${s.assignment.course.slug}/assignments/${s.assignment.id}` : `/student/assignments/${s.assignment?.id}`} className="block">
                            <article className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"><ClipboardList className="size-5" /></span>
                                        <div>
                                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{s.assignment?.title ?? 'Assignment'}</h2>
                                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                {s.assignment?.course && <Link href={`/courses/${s.assignment.course.slug}`} className="font-semibold text-teal-600 hover:underline">{s.assignment.course.title}</Link>}
                                                <span>· တင်ပြခဲ့သည်: {s.submitted_at ? formatDate(s.submitted_at) : '—'}</span>
                                                <span>· အမှတ်အများဆုံး {s.assignment?.max_score ?? '—'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge>
                                        {s.grade && <Badge variant="outline">{s.grade.score}/{s.assignment?.max_score}</Badge>}
                                        <span className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" title="ဒေါင်းလုဒ်ရန်"><Download className="size-4" /></span>
                                    </div>
                                </div>
                                {s.content && (
                                    <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{s.content}</p>
                                )}
                                {s.files && s.files.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {s.files.map((f) => (
                                            <li key={f.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><FileText className="size-4 shrink-0 text-teal-600" /> {f.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}
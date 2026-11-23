import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { Avatar, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Submission = { id: number; status: string; content?: string | null; submitted_at?: string | null; student?: { id: number; name: string; email: string } | null; grade?: { score: number; feedback?: string | null } | null };
type Assignment = { id: number; title: string; instructions: string; max_score: number; due_at?: string | null; allow_late_submission: boolean; course?: { id: number; title: string } | null };

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function GradeForm({ assignmentId, submission, maxScore }: { assignmentId: number; submission: Submission; maxScore: number }) {
    const { data, setData, post, processing, errors } = useForm({ score: submission.grade?.score ?? 0, feedback: submission.grade?.feedback ?? '', status: 'graded' as 'graded' | 'returned' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/instructor/assignments/${assignmentId}/submissions/${submission.id}/grade`, { preserveScroll: true });
    };
    return (
        <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-3">
            <Input label="အမှတ်" type="number" min={0} max={maxScore} step="0.01" value={data.score} onChange={(e) => setData('score', Number(e.target.value))} error={errors.score} />
            <div className="sm:col-span-2">
                <label className={labelCls}>Feedback</label>
                <input className={inputCls} value={data.feedback} onChange={(e) => setData('feedback', e.target.value)} />
            </div>
            <div>
                <label className={labelCls}>အခြေအနေ</label>
                <select className={inputCls} value={data.status} onChange={(e) => setData('status', e.target.value as 'graded' | 'returned')}>
                    <option value="graded">အမှတ်ပေးပြီး</option>
                    <option value="returned">ပြန်ပေးပြီး</option>
                </select>
            </div>
            <div className="flex items-end sm:col-span-2">
                <button type="submit" className={btnAccentCls} disabled={processing}>
                    အမှတ် သိမ်းရန်
                </button>
            </div>
        </form>
    );
}

export default function Show({ assignment, submissions = [] }: { assignment: Assignment; submissions: Submission[] }) {
    const graded = submissions.filter((s) => s.status === 'graded' || s.status === 'returned').length;
    return (
        <LmsShell title={assignment.title} nav="instructor">
            <Head title={assignment.title} />
            <PageIntro
                title={assignment.title}
                description={`${assignment.course?.title ?? ''} · အမှတ်ပြည့် ${assignment.max_score}${assignment.due_at ? ` · နောက်ဆုံးရက် ${formatDate(assignment.due_at)}` : ''}${assignment.allow_late_submission ? ' · နောက်ကျတင်ခွင့်ရှိ' : ''}`}
                actions={
                    <Link href="/instructor/assignments" className={btnGhostCls}>
                        <ChevronLeft className="size-4" /> Assignment အားလုံး
                    </Link>
                }
            />

            <LmsCard className="mt-6 p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>ညွှန်ကြားချက်</h2>
                <div className={`mt-3 whitespace-pre-wrap leading-7 ${mutedCls}`}>{assignment.instructions}</div>
            </LmsCard>

            <section className="mt-8">
                <h2 className={`text-xl font-extrabold ${inkCls}`}>
                    တင်သွင်းမှုများ ({submissions.length} ခု · အမှတ်ပေးပြီး {graded} ခု)
                </h2>
                {submissions.length === 0 ? (
                    <p className={`mt-3 ${mutedCls}`}>တင်သွင်းမှု မရှိသေးပါ။</p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {submissions.map((s) => (
                            <LmsCard key={s.id} className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar init={initials(s.student?.name ?? '?')} color="#0ea892" />
                                        <div>
                                            <p className={`font-bold ${inkCls}`}>{s.student?.name}</p>
                                            <p className={`text-sm ${mutedCls}`}>
                                                {s.student?.email}
                                                {s.submitted_at ? ` · ${formatDate(s.submitted_at)}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {s.status === 'graded' || s.status === 'returned' ? (
                                        <Pill tone="teal">{s.status === 'graded' ? 'အမှတ်ပေးပြီး' : 'ပြန်ပေးပြီး'}</Pill>
                                    ) : (
                                        <Pill tone="amber">စစ်ဆေးရန်</Pill>
                                    )}
                                </div>
                                {s.content && (
                                    <div className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-[#12234a] dark:text-[#e9eefb]">
                                        {s.content}
                                    </div>
                                )}
                                <GradeForm assignmentId={assignment.id} submission={s} maxScore={assignment.max_score} />
                            </LmsCard>
                        ))}
                    </div>
                )}
            </section>
        </LmsShell>
    );
}

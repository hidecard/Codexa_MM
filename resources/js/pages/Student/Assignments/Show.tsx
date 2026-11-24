import { Head, Link, useForm } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, ChevronLeft, Clock3, FileText, UploadCloud } from 'lucide-react';
import type { FormEvent } from 'react';

type Assignment = { id: number; title: string; instructions: string; max_score: number; due_at?: string | null; allow_late_submission: boolean; course?: { id: number; title: string } | null; attachments: { id: number; name?: string | null; type?: string | null; size?: number | null }[] };
type Submission = { id: number; content?: string | null; status: string; submitted_at?: string | null; grade?: { score: number; feedback?: string | null; graded_at?: string | null } | null } | null;

export default function Show({ assignment, submission = null }: { assignment: Assignment; submission?: Submission }) {
    const { data, setData, post, processing, errors } = useForm({ content: submission?.content ?? '' });
    const errs = errors as Record<string, string | undefined>;
    const submit = (e: FormEvent) => { e.preventDefault(); post(`/student/assignments/${assignment.id}/submit`); };
    const graded = submission?.status === 'graded' || submission?.status === 'returned';

    return (
        <LmsShell title="Assignment" nav="student">
            <Head title={assignment.title} />
            <Link href="/student/assignments" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Assignment အားလုံး</Link>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">{assignment.course?.title}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{assignment.title}</h1>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>အမှတ်အများဆုံး {assignment.max_score}</span>
                        {assignment.due_at && <span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> သတ်မှတ် {assignment.due_at}</span>}
                        <span>{assignment.allow_late_submission ? 'နောက်ကျပြီး တင်နိုင်သည်' : 'နောက်ကျပြီး တင်မရပါ'}</span>
                    </p>
                </div>
                {submission && (
                    <Badge variant={graded ? 'success' : 'secondary'}>
                        {graded ? 'အမှတ်ပေးပြီးပါပြီ' : submission.status === 'submitted' ? 'တင်ပြီးပါပြီ' : submission.status}
                    </Badge>
                )}
            </div>

            <Card className="mt-6">
                <CardContent className="p-6">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ညွှန်ကြားချက်</h2>
                    <div className="mt-3 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{assignment.instructions}</div>
                    {assignment.attachments.length > 0 && (
                        <ul className="mt-4 space-y-2">
                            {assignment.attachments.map((a) => (
                                <li key={a.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"><FileText className="size-4 shrink-0 text-teal-600" /> {a.name ?? 'ဖိုင်'}</li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {submission?.grade && (
                <Card className="mt-4">
                    <CardContent className="p-6">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Award className="size-5 text-amber-500" /> ရရှိသော အမှတ်</h2>
                        <p className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{submission.grade.score}<span className="text-lg text-slate-400">/{assignment.max_score}</span></p>
                        {submission.grade.feedback && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ဆရာ့ မှတ်ချက်</p>
                                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{submission.grade.feedback}</p>
                            </div>
                        )}
                        {submission.grade.graded_at && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">အမှတ်ပေးခဲ့သည်: {submission.grade.graded_at}</p>}
                    </CardContent>
                </Card>
            )}

            <Card className="mt-4">
                <CardContent className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><UploadCloud className="size-5 text-teal-600" /> ကျွန်ုပ်၏ တင်ပြချက်</h2>
                    {graded ? (
                        <p className="mt-3 text-slate-600 dark:text-slate-300">ဤတင်ပြချက်ကို အမှတ်ပေးပြီးဖြစ်သဖြင့် ပြင်ဆင်၍ မရတော့ပါ။</p>
                    ) : (
                        <form onSubmit={submit} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အဖြေ / တင်ပြချက်</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    rows={8}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="သင်၏ အဖြေကို ဤနေရာတွင် ရေးပါ…"
                                />
                                {errs.content && <p className="mt-1.5 text-sm text-rose-600">{errs.content}</p>}
                                {errs.submission && <p className="mt-1.5 text-sm text-rose-600">{errs.submission}</p>}
                            </div>
                            <Button type="submit" disabled={processing} className="bg-teal-600 hover:bg-teal-700">{submission ? 'ပြန်လည် တင်ပြရန်' : 'Assignment တင်ပြရန်'}</Button>
                        </form>
                    )}
                    {submission?.submitted_at && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">တင်ပြခဲ့သည်: {submission.submitted_at}</p>}
                    {submission?.content && graded && (
                        <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{submission.content}</div>
                    )}
                </CardContent>
            </Card>
        </LmsShell>
    );
}

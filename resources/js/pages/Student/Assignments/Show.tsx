import { Head, Link, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FormEvent } from 'react';

type Assignment = { id: number; title: string; instructions: string; max_score: number; due_at?: string | null; allow_late_submission: boolean; course?: { id: number; title: string } | null; attachments: { id: number; name?: string | null; type?: string | null; size?: number | null }[] };
type Submission = { id: number; content?: string | null; status: string; submitted_at?: string | null; grade?: { score: number; feedback?: string | null; graded_at?: string | null } | null } | null;

export default function Show({ assignment, submission }: { assignment: Assignment; submission: Submission }) {
    const { data, setData, post, processing, errors } = useForm({ content: submission?.content ?? '' });
    const errs = errors as Record<string, string | undefined>;
    const submit = (e: FormEvent) => { e.preventDefault(); post(`/student/assignments/${assignment.id}/submit`); };
    const graded = submission?.status === 'graded' || submission?.status === 'returned';
    return (
        <AppShell navItems={[{ label: 'Dashboard', href: '/student/dashboard' }, { label: 'Assignments', href: '/student/assignments' }]}>
            <Head title={assignment.title} />
            <Link href="/student/assignments" className="text-sm font-semibold text-slate-600 hover:text-blue-700">← All assignments</Link>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{assignment.course?.title}</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">{assignment.title}</h1>
                    <p className="mt-1 text-sm text-slate-500">Max score: {assignment.max_score}{assignment.due_at ? ` · Due ${assignment.due_at}` : ''}{assignment.allow_late_submission ? ' · Late submissions allowed' : ' · No late submissions'}</p>
                </div>
                {submission && <Badge variant={graded ? 'success' : 'secondary'}>{submission.status}</Badge>}
            </div>

            <Card className="mt-6"><CardContent className="p-6"><h2 className="text-lg font-black text-slate-950">Instructions</h2><div className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{assignment.instructions}</div></CardContent></Card>

            {submission?.grade && (
                <Card className="mt-4"><CardContent className="p-6"><h2 className="text-lg font-black text-slate-950">Grade</h2><p className="mt-2 text-2xl font-black text-emerald-700">{submission.grade.score}/{assignment.max_score}</p>{submission.grade.feedback && <p className="mt-2 whitespace-pre-wrap text-slate-700">{submission.grade.feedback}</p>}</CardContent></Card>
            )}

            <Card className="mt-4">
                <CardContent className="p-6">
                    <h2 className="text-lg font-black text-slate-950">Your submission</h2>
                    {graded ? (
                        <p className="mt-3 text-slate-600">This submission has been graded and can no longer be modified.</p>
                    ) : (
                        <form onSubmit={submit} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Response</label>
                                <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" rows={8} value={data.content} onChange={(e) => setData('content', e.target.value)} placeholder="Write your submission..." />
                                {errs.content && <p className="mt-1.5 text-sm text-rose-600">{errs.content}</p>}
                                {errs.submission && <p className="mt-1.5 text-sm text-rose-600">{errs.submission}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>{submission ? 'Resubmit' : 'Submit assignment'}</Button>
                        </form>
                    )}
                    {submission?.submitted_at && <p className="mt-3 text-sm text-slate-500">Submitted at: {submission.submitted_at}</p>}
                </CardContent>
            </Card>
        </AppShell>
    );
}

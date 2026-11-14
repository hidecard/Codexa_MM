import { Head, Link, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FormEvent } from 'react';

type Submission = { id: number; status: string; content?: string | null; submitted_at?: string | null; student?: { id: number; name: string; email: string } | null; grade?: { score: number; feedback?: string | null } | null };
type Assignment = { id: number; title: string; instructions: string; max_score: number; due_at?: string | null; allow_late_submission: boolean; course?: { id: number; title: string } | null };

function GradeForm({ assignmentId, submission, maxScore }: { assignmentId: number; submission: Submission; maxScore: number }) {
    const { data, setData, post, processing, errors } = useForm({ score: submission.grade?.score ?? 0, feedback: submission.grade?.feedback ?? '', status: 'graded' as 'graded' | 'returned' });
    const submit = (e: FormEvent) => { e.preventDefault(); post(`/instructor/assignments/${assignmentId}/submissions/${submission.id}/grade`, { preserveScroll: true }); };
    return (
        <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-3">
            <Input label="Score" type="number" min={0} max={maxScore} step="0.01" value={data.score} onChange={(e) => setData('score', Number(e.target.value))} error={errors.score} />
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700">Feedback</label><input className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.feedback} onChange={(e) => setData('feedback', e.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value as 'graded' | 'returned')}><option value="graded">Graded</option><option value="returned">Returned</option></select></div>
            <div className="sm:col-span-2 flex items-end"><Button type="submit" size="sm" disabled={processing}>Save grade</Button></div>
        </form>
    );
}

export default function Show({ assignment, submissions = [] }: { assignment: Assignment; submissions: Submission[] }) {
    return (
        <AppShell navItems={[{ label: 'Dashboard', href: '/instructor/dashboard' }, { label: 'Assignments', href: '/instructor/assignments' }]}>
            <Head title={assignment.title} />
            <Link href="/instructor/assignments" className="text-sm font-semibold text-slate-600 hover:text-blue-700">← All assignments</Link>
            <div className="mt-3">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{assignment.course?.title}</p>
                <h1 className="mt-1 text-3xl font-black text-slate-950">{assignment.title}</h1>
                <p className="mt-1 text-sm text-slate-500">Max score {assignment.max_score}{assignment.due_at ? ` · Due ${assignment.due_at}` : ''}</p>
            </div>
            <Card className="mt-6"><CardContent className="p-6"><h2 className="text-lg font-black text-slate-950">Instructions</h2><div className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{assignment.instructions}</div></CardContent></Card>
            <section className="mt-8">
                <h2 className="text-xl font-black text-slate-950">Submissions ({submissions.length})</h2>
                {submissions.length === 0 ? <p className="mt-3 text-slate-600">No submissions yet.</p> : (
                    <div className="mt-4 space-y-4">
                        {submissions.map((s) => (
                            <Card key={s.id}><CardContent className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div><p className="font-bold text-slate-950">{s.student?.name}</p><p className="text-sm text-slate-500">{s.student?.email}{s.submitted_at ? ` · ${s.submitted_at}` : ''}</p></div>
                                    <Badge variant={s.status === 'graded' || s.status === 'returned' ? 'success' : 'secondary'}>{s.status}</Badge>
                                </div>
                                {s.content && <div className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{s.content}</div>}
                                <GradeForm assignmentId={assignment.id} submission={s} maxScore={assignment.max_score} />
                            </CardContent></Card>
                        ))}
                    </div>
                )}
            </section>
        </AppShell>
    );
}

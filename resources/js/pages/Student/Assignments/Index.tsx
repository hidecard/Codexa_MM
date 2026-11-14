import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';

type Assignment = { id: number; title: string; due_at?: string | null; max_score: number; course?: { id: number; title: string } | null; submission?: { id: number; status: string; submitted_at?: string | null; grade?: { score: number; feedback?: string | null } | null } | null };
const nav = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'My courses', href: '/student/my-courses' },
];

export default function Index({ assignments = [] }: { assignments: Assignment[] }) {
    return (
        <AppShell navItems={nav}>
            <Head title="Assignments" />
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Student</p>
                <h1 className="mt-1 text-3xl font-black text-slate-950">Assignments</h1>
                <p className="mt-1 text-slate-600">Assignments from your enrolled courses.</p>
            </div>
            {assignments.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No assignments yet.</div>
            ) : (
                <div className="mt-8 grid gap-4">
                    {assignments.map((a) => (
                        <Link key={a.id} href={`/student/assignments/${a.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">{a.title}</h2>
                                    <p className="mt-1 text-sm text-slate-500">{a.course?.title}{a.due_at ? ` · Due ${a.due_at}` : ' · No due date'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {a.submission ? <Badge variant={a.submission.status === 'graded' || a.submission.status === 'returned' ? 'success' : 'secondary'}>{a.submission.status}</Badge> : <Badge variant="warning">not submitted</Badge>}
                                    {a.submission?.grade && <Badge variant="outline">{a.submission.grade.score}/{a.max_score}</Badge>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

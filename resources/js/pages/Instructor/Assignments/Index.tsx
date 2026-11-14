import { Head, Link, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FormEvent } from 'react';

type Assignment = { id: number; title: string; due_at?: string | null; max_score: number; submissions_count: number; course?: { id: number; title: string } | null };
type Course = { id: number; title: string };
const nav = [{ label: 'Dashboard', href: '/instructor/dashboard' }, { label: 'Courses', href: '/instructor/courses' }, { label: 'Assignments', href: '/instructor/assignments' }];

export default function Index({ assignments = [], courses = [] }: { assignments: Assignment[]; courses: Course[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ course_id: courses[0]?.id ?? '', title: '', instructions: '', max_score: 100, due_at: '', allow_late_submission: false });
    const submit = (e: FormEvent) => { e.preventDefault(); post('/instructor/assignments', { onSuccess: () => reset('title', 'instructions') }); };
    return (
        <AppShell navItems={nav}>
            <Head title="Assignments" />
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Instructor</p>
                <h1 className="mt-1 text-3xl font-black text-slate-950">Assignments</h1>
                <p className="mt-1 text-slate-600">Create assignments and review submissions for your courses.</p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3">
                    {assignments.length === 0 ? <Card><CardContent className="p-8 text-center text-slate-600">No assignments yet.</CardContent></Card> : assignments.map((a) => (
                        <Link key={a.id} href={`/instructor/assignments/${a.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">{a.title}</h2>
                                    <p className="mt-1 text-sm text-slate-500">{a.course?.title}{a.due_at ? ` · Due ${a.due_at}` : ''}</p>
                                </div>
                                <Badge variant="outline">{a.submissions_count} submissions</Badge>
                            </div>
                        </Link>
                    ))}
                </div>
                <Card className="h-fit">
                    <CardContent className="p-5">
                        <h2 className="text-lg font-black text-slate-950">New assignment</h2>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.course_id} onChange={(e) => setData('course_id', Number(e.target.value))}>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                                {errors.course_id && <p className="mt-1 text-sm text-rose-600">{errors.course_id}</p>}
                            </div>
                            <Input label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                            <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Instructions</label><textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={4} value={data.instructions} onChange={(e) => setData('instructions', e.target.value)} required />{errors.instructions && <p className="mt-1 text-sm text-rose-600">{errors.instructions}</p>}</div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Max score" type="number" min={1} value={data.max_score} onChange={(e) => setData('max_score', Number(e.target.value))} error={errors.max_score} />
                                <Input label="Due at" type="datetime-local" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} error={errors.due_at} />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={data.allow_late_submission} onChange={(e) => setData('allow_late_submission', e.target.checked)} /> Allow late submission</label>
                            <Button type="submit" disabled={processing || courses.length === 0}>Create</Button>
                            {courses.length === 0 && <p className="text-sm text-slate-500">Create a course first.</p>}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

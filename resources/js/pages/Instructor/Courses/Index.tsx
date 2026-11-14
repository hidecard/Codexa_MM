import { Head, Link, router } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type Course = {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    pricing_type: 'free' | 'paid' | 'package';
    level: string;
    modules_count: number;
    updated_at?: string;
    category?: { id: number; name: string } | null;
};

const nav = [
    { label: 'Dashboard', href: '/instructor/dashboard' },
    { label: 'Courses', href: '/instructor/courses' },
];

export default function Index({ courses = [] }: { courses: Course[] }) {
    const destroy = (id: number) => {
        if (confirm('Delete this course?')) router.delete(`/instructor/courses/${id}`);
    };
    return (
        <AppShell navItems={nav}>
            <Head title="My Courses" />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Instructor</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">Courses</h1>
                    <p className="mt-1 text-slate-600">Create and manage courses assigned to you.</p>
                </div>
                <Link href="/instructor/courses/create" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700"><Plus className="size-4" /> New course</Link>
            </div>

            {courses.length === 0 ? (
                <Card className="mt-8"><CardContent className="p-10 text-center text-slate-600">No courses yet. Create your first course to get started.</CardContent></Card>
            ) : (
                <div className="mt-8 grid gap-4">
                    {courses.map((course) => (
                        <Card key={course.id}>
                            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-black text-slate-950">{course.title}</h2>
                                        <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'secondary'}>{course.status}</Badge>
                                        <Badge variant="outline">{course.pricing_type}</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">{course.category?.name ?? 'Uncategorized'} · {course.level} · {course.modules_count} modules</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/instructor/courses/${course.id}/edit`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil className="size-4" /> Edit</Link>
                                    <Button type="button" variant="outline" size="sm" onClick={() => destroy(course.id)} className="text-rose-600 hover:text-rose-700"><Trash2 className="size-4" /> Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

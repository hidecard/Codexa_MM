import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { BookOpen } from 'lucide-react';

const nav = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'My courses', href: '/student/my-courses' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'Certificates', href: '/student/certificates' },
];

type Enrollment = {
    id: number;
    status: string;
    enrolled_at?: string | null;
    course: { id: number; title: string; slug: string; category?: string | null };
};

export default function MyCourses({ enrollments = [] }: { enrollments: Enrollment[] }) {
    return (
        <AppShell navItems={nav}>
            <Head title="My Courses" />
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Student</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">My Courses</h1>
                    <p className="mt-1 text-slate-600">Courses you have enrolled in.</p>
                </div>
                <Link href="/courses" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600">Browse catalog</Link>
            </div>

            {enrollments.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <BookOpen className="mx-auto size-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">You haven’t enrolled in any courses yet.</p>
                    <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Find a course</Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((e) => (
                        <article key={e.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                            {e.course.category && <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{e.course.category}</p>}
                            <h2 className="mt-1 text-lg font-black text-slate-950">{e.course.title}</h2>
                            <p className="mt-2 text-sm text-slate-500 capitalize">Status: <span className="font-semibold text-slate-700">{e.status}</span></p>
                            <div className="mt-5 flex gap-2">
                                {e.status === 'active' || e.status === 'completed' ? (
                                    <Link href={`/student/courses/${e.course.id}/learn`} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600">Open</Link>
                                ) : (
                                    <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">Pending</span>
                                )}
                                <Link href={`/courses/${e.course.slug}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Details</Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

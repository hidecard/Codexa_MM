import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { BookOpen, Plus, Users } from 'lucide-react';

const nav = [
    { label: 'Dashboard', href: '/instructor/dashboard' },
    { label: 'Courses', href: '/instructor/courses' },
    { label: 'Students', href: '/instructor/students' },
];

export default function Dashboard() {
    return (
        <AppShell navItems={nav}>
            <Head title="Instructor Dashboard" />
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Instructor</p>
                <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard</h1>
                <p className="mt-1 text-slate-600">Manage your assigned courses and curriculum.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/instructor/courses" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm">
                    <BookOpen className="size-8 text-blue-600" />
                    <h2 className="mt-4 text-lg font-black text-slate-950">My courses</h2>
                    <p className="mt-1 text-sm text-slate-600">View, create, and edit courses you own or are assigned to.</p>
                </Link>
                <Link href="/instructor/courses/create" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm">
                    <Plus className="size-8 text-blue-600" />
                    <h2 className="mt-4 text-lg font-black text-slate-950">Create a course</h2>
                    <p className="mt-1 text-sm text-slate-600">Start a new draft and build modules and lessons.</p>
                </Link>
                <Link href="/instructor/students" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm">
                    <Users className="size-8 text-blue-600" />
                    <h2 className="mt-4 text-lg font-black text-slate-950">Students</h2>
                    <p className="mt-1 text-sm text-slate-600">Student insights and rosters for your courses.</p>
                </Link>
            </div>
        </AppShell>
    );
}

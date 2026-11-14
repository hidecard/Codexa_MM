import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Bell, BookOpen, CheckCircle2, ClipboardList, FileBadge, PlayCircle, Activity } from 'lucide-react';

const nav = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'My courses', href: '/student/my-courses' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'Certificates', href: '/student/certificates' },
    { label: 'Profile', href: '/student/profile' },
];

type EnrollmentCard = {
    id: number;
    status: string;
    progress: number;
    completed_lessons: number;
    total_lessons: number;
    course: { id: number; title: string; slug: string; category?: string | null };
    continue_lesson: { id: number; title: string } | null;
};

type Props = {
    enrollments: EnrollmentCard[];
    stats: { enrolled: number; active: number; completed: number };
    assignments?: { id: number; title: string; due_at?: string | null; course?: { id: number; title: string } | null }[];
    activities?: { id: number; lesson?: string | null; course?: string | null; is_completed: boolean; updated_at?: string | null }[];
    certificates?: { id: number; certificate_number: string; issued_at?: string | null; course?: string | null }[];
    notifications?: { id: number; title: string; message: string; is_read: boolean; created_at?: string | null }[];
};

export default function Dashboard({ enrollments = [], stats = { enrolled: 0, active: 0, completed: 0 }, assignments = [], activities = [], certificates = [], notifications = [] }: Props) {
    const continueItem = enrollments.find((e) => e.continue_lesson && (e.status === 'active' || e.status === 'completed'));
    return (
        <AppShell navItems={nav}>
            <Head title="Student Dashboard" />
            <div className="flex flex-col gap-2">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Codexa Academy</p>
                <h1 className="text-3xl font-black text-slate-950">Student Dashboard</h1>
                <p className="text-slate-600">Track your learning, continue lessons, and manage your courses.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">Enrolled</p><p className="mt-1 text-3xl font-black text-slate-950">{stats.enrolled}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">Active</p><p className="mt-1 text-3xl font-black text-blue-600">{stats.active}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">Completed</p><p className="mt-1 text-3xl font-black text-emerald-600">{stats.completed}</p></div>
            </div>

            {continueItem && continueItem.continue_lesson && (
                <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-300">Continue learning</p>
                    <h2 className="mt-2 text-2xl font-black">{continueItem.course.title}</h2>
                    <p className="mt-1 text-slate-300">Next up: {continueItem.continue_lesson.title}</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-500" style={{ width: `${continueItem.progress}%` }} /></div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href={`/student/courses/${continueItem.course.id}/lessons/${continueItem.continue_lesson.id}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500"><PlayCircle className="size-5" /> Resume lesson</Link>
                        <Link href={`/student/courses/${continueItem.course.id}/learn`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/10">View course</Link>
                    </div>
                </section>
            )}

            <section className="mt-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-950">Enrolled courses</h2>
                    <Link href="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700">Browse more</Link>
                </div>
                {enrollments.length === 0 ? (
                    <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <BookOpen className="mx-auto size-10 text-slate-300" />
                        <p className="mt-3 font-semibold text-slate-700">No enrollments yet.</p>
                        <p className="mt-1 text-sm text-slate-500">Explore the catalog and enroll in a course to get started.</p>
                        <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-blue-600">Explore courses</Link>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {enrollments.map((e) => (
                            <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        {e.course.category && <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{e.course.category}</p>}
                                        <h3 className="mt-1 text-lg font-black text-slate-950">{e.course.title}</h3>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${e.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : e.status === 'active' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{e.status}</span>
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${e.progress}%` }} /></div>
                                <p className="mt-2 text-sm text-slate-500">{e.completed_lessons}/{e.total_lessons} lessons · {e.progress}% complete</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {e.status === 'active' || e.status === 'completed' ? (
                                        <Link href={`/student/courses/${e.course.id}/learn`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"><PlayCircle className="size-4" /> Open course</Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">Awaiting activation</span>
                                    )}
                                    {e.status === 'completed' && <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Completed</span>}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><ClipboardList className="size-5 text-blue-600" /> Assignments</h2><Link href="/student/assignments" className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</Link></div>
                    {assignments.length === 0 ? <p className="mt-4 text-sm text-slate-500">No assignments yet for your enrolled courses.</p> : (
                        <ul className="mt-4 space-y-3">{assignments.map((a) => <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="font-semibold text-slate-900">{a.title}</p><p className="text-xs text-slate-500">{a.course?.title}{a.due_at ? ` · Due ${a.due_at}` : ''}</p></div><Link href={`/student/assignments/${a.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700">Open</Link></li>)}</ul>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><Activity className="size-5 text-blue-600" /> Recent activity</h2></div>
                    {activities.length === 0 ? <p className="mt-4 text-sm text-slate-500">Your learning activity will appear here.</p> : (
                        <ul className="mt-4 space-y-3">{activities.map((a) => <li key={a.id} className="flex items-start gap-3 text-sm"><span className={`mt-0.5 size-2 rounded-full ${a.is_completed ? 'bg-emerald-500' : 'bg-blue-500'}`} /><div><p className="font-medium text-slate-900">{a.is_completed ? 'Completed' : 'Progressed'}: {a.lesson}</p><p className="text-xs text-slate-500">{a.course}{a.updated_at ? ` · ${a.updated_at}` : ''}</p></div></li>)}</ul>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><FileBadge className="size-5 text-blue-600" /> Certificates</h2><Link href="/student/certificates" className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</Link></div>
                    {certificates.length === 0 ? <p className="mt-4 text-sm text-slate-500">Certificates you earn will appear here.</p> : (
                        <ul className="mt-4 space-y-3">{certificates.map((c) => <li key={c.id} className="rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-900">{c.course ?? 'Certificate'}</p><p className="text-xs text-slate-500">{c.certificate_number}{c.issued_at ? ` · Issued ${c.issued_at}` : ''}</p></li>)}</ul>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><Bell className="size-5 text-blue-600" /> Notifications</h2><Link href="/student/notifications" className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</Link></div>
                    {notifications.length === 0 ? <p className="mt-4 text-sm text-slate-500">No notifications yet.</p> : (
                        <ul className="mt-4 space-y-3">{notifications.map((n) => <li key={n.id} className={`rounded-xl p-3 ${n.is_read ? 'bg-slate-50' : 'bg-blue-50'}`}><p className="font-semibold text-slate-900">{n.title}</p><p className="mt-0.5 text-sm text-slate-600">{n.message}</p>{n.created_at && <p className="mt-1 text-xs text-slate-500">{n.created_at}</p>}</li>)}</ul>
                    )}
                </section>
            </div>
        </AppShell>
    );
}

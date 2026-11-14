import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { CheckCircle2, PlayCircle } from 'lucide-react';

type Lesson = { id: number; title: string; duration: number; type: string; is_free: boolean; is_completed: boolean };
type Module = { id: number; title: string; description?: string | null; position: number; lessons: Lesson[] };
type Props = {
    course: { id: number; title: string; slug: string; short_description?: string | null };
    modules: Module[];
    progress: { completed: number; total: number; percent: number };
    nextLessonId: number | null;
};

export default function Learn({ course, modules, progress, nextLessonId }: Props) {
    return (
        <AppShell navItems={[{ label: 'Dashboard', href: '/student/dashboard' }, { label: 'My courses', href: '/student/my-courses' }]}>
            <Head title={`Learn · ${course.title}`} />
            <div className="flex flex-col gap-2">
                <Link href="/student/my-courses" className="text-sm font-semibold text-slate-600 hover:text-blue-700">← My courses</Link>
                <h1 className="text-3xl font-black text-slate-950">{course.title}</h1>
                {course.short_description && <p className="max-w-2xl text-slate-600">{course.short_description}</p>}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-slate-900">Progress: {progress.completed}/{progress.total} lessons · {progress.percent}%</p>
                    {nextLessonId && (
                        <Link href={`/student/courses/${course.id}/lessons/${nextLessonId}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                            <PlayCircle className="size-4" /> Continue
                        </Link>
                    )}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress.percent}%` }} /></div>
            </div>

            <div className="mt-8 space-y-4">
                {modules.map((m) => (
                    <section key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-black text-blue-700">{m.position}</span>
                            <div className="flex-1">
                                <h2 className="text-lg font-black text-slate-950">{m.title}</h2>
                                {m.description && <p className="mt-1 text-sm text-slate-600">{m.description}</p>}
                            </div>
                        </div>
                        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                            {m.lessons.map((l) => (
                                <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {l.is_completed ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="size-4 rounded-full border border-slate-300" />}
                                        <Link href={`/student/courses/${course.id}/lessons/${l.id}`} className="font-semibold text-slate-800 hover:text-blue-700">{l.title}</Link>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500">{l.duration} min</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </AppShell>
    );
}

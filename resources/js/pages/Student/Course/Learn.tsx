import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { CheckCircle2, ChevronDown, ChevronLeft, Clock3, FileText, PlayCircle, Video } from 'lucide-react';

type Lesson = { id: number; title: string; duration: number; type: string; is_free: boolean; is_completed: boolean; resume_position?: number };
type Module = { id: number; title: string; description?: string | null; position: number; lessons: Lesson[] };
type Props = {
    course?: { id: number; title: string; slug: string; short_description?: string | null };
    modules?: Module[];
    progress?: { completed: number; total: number; percent: number };
    nextLessonId?: number | null;
};

function typeIcon(type: string) {
    if (type === 'quiz') return <FileText className="size-4 text-purple-600" />;
    if (type === 'assignment') return <FileText className="size-4 text-amber-600" />;
    if (type === 'text') return <FileText className="size-4 text-slate-500" />;
    return <Video className="size-4 text-teal-600" />;
}

export default function Learn({ course, modules = [], progress = { completed: 0, total: 0, percent: 0 }, nextLessonId = null }: Props) {
    const [open, setOpen] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        modules.forEach((m, i) => { initial[m.id] = i === 0; });
        return initial;
    });
    if (!course) {
        return (
            <LmsShell title="သင်တန်း" nav="student">
                <Head title="Learn" />
                <p className="text-slate-500 dark:text-slate-400">သင်တန်း မတွေ့ပါ။</p>
                <Link href="/student/my-courses" className="mt-4 inline-block text-sm font-bold text-teal-600">သင်တန်းများ သို့ ပြန်သွားရန်</Link>
            </LmsShell>
        );
    }
    return (
        <LmsShell title={course.title} nav="student">
            <Head title={`Learn · ${course.title}`} />
            <Link href="/student/my-courses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> ကျွန်ုပ်၏ သင်တန်းများ</Link>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{course.title}</h1>
            {course.short_description && <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{course.short_description}</p>}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-slate-900 dark:text-white">တိုးတက်မှု: {progress.completed}/{progress.total} သင်ခန်းစာ · {progress.percent}%</p>
                    {nextLessonId ? (
                        <Link href={`/student/courses/${course.id}/lessons/${nextLessonId}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                            <PlayCircle className="size-4" /> {progress.completed === 0 ? 'စတင် သင်ယူရန်' : 'ဆက်လက် သင်ယူရန်'}
                        </Link>
                    ) : progress.percent === 100 ? (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="size-4" /> သင်တန်း ပြီးစီးပါပြီ</span>
                    ) : null}
                </div>
                <div className="mt-3"><ProgressBar value={progress.percent} tone="teal" /></div>
            </div>

            <div className="mt-6 space-y-4">
                {modules.map((m) => {
                    const done = m.lessons.filter((l) => l.is_completed).length;
                    const isOpen = open[m.id] ?? false;
                    return (
                        <section key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <button onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))} className="flex w-full items-start gap-3 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-sm font-black text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{m.position}</span>
                                <span className="flex-1">
                                    <span className="block text-lg font-extrabold text-slate-900 dark:text-white">{m.title}</span>
                                    {m.description && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{m.description}</span>}
                                    <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{done}/{m.lessons.length} သင်ခန်းစာ ပြီးစီး</span>
                                </span>
                                <ChevronDown className={`mt-1 size-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                                    {m.lessons.map((l) => (
                                        <li key={l.id}>
                                            <Link href={`/student/courses/${course.id}/lessons/${l.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                                <span className="flex items-center gap-3">
                                                    {l.is_completed ? <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> : <span className="grid size-5 shrink-0 place-items-center">{typeIcon(l.type)}</span>}
                                                    <span className="font-semibold text-slate-800 hover:text-teal-700 dark:text-slate-100">{l.title}</span>
                                                    {l.is_free && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">အခမဲ့</span>}
                                                </span>
                                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><Clock3 className="size-3.5" /> {l.duration} မိနစ်</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>
        </LmsShell>
    );
}

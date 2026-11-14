import { Head, Link, router } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { CheckCircle2, ChevronLeft, Clock3, FileText, Gauge } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NavLesson = { id: number; title: string; duration: number; is_completed: boolean };
type Props = {
    course: { id: number; title: string; slug: string };
    modules: { id: number; title: string; lessons: NavLesson[] }[];
    lesson: {
        id: number;
        title: string;
        content?: string | null;
        duration: number;
        type: string;
        is_completed: boolean;
        module: { id: number; title: string };
        resources: { id: number; name: string; type?: string | null; size: number }[];
        stream_url?: string | null;
        captions?: { src: string; label?: string; srclang?: string }[];
        resume_position?: number;
        playback_speeds?: number[];
    };
};

export default function Lesson({ course, modules, lesson }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastSentRef = useRef(0);
    const [speed, setSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(lesson.resume_position ?? 0);
    const speeds = lesson.playback_speeds?.length ? lesson.playback_speeds : [1];

    const markComplete = () => router.post(`/student/courses/${course.id}/lessons/${lesson.id}/complete`, {
        position: Math.floor(videoRef.current?.currentTime ?? currentTime),
        watch_time: Math.floor(videoRef.current?.currentTime ?? currentTime),
    });

    const sendProgress = (pos: number, force = false) => {
        const floored = Math.floor(pos);
        if (!force && Math.abs(floored - lastSentRef.current) < 10) return;
        lastSentRef.current = floored;
        router.post(`/student/courses/${course.id}/lessons/${lesson.id}/progress`, { position: pos, watch_time: floored }, { preserveScroll: true, preserveState: true, showProgress: false });
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.playbackRate = speed;
    }, [speed]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !lesson.resume_position) return;
        const onLoaded = () => {
            try { v.currentTime = Math.max(0, lesson.resume_position || 0); } catch {}
        };
        if (v.readyState >= 1) onLoaded();
        else v.addEventListener('loadedmetadata', onLoaded, { once: true });
    }, [lesson.resume_position]);

    return (
        <AppShell navItems={[{ label: 'Dashboard', href: '/student/dashboard' }, { label: 'Course', href: `/student/courses/${course.id}/learn` }]}>
            <Head title={`${lesson.title} · ${course.title}`} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <article>
                    <Link href={`/student/courses/${course.id}/learn`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ChevronLeft className="size-4" /> Back to course</Link>
                    <p className="mt-4 text-sm font-bold uppercase tracking-wider text-blue-600">{lesson.module.title}</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">{lesson.title}</h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> {lesson.duration} min</span><span className="capitalize">{lesson.type}</span></div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                        {lesson.type === 'video' && lesson.stream_url ? (
                            <div>
                                <video
                                    ref={videoRef}
                                    key={lesson.id}
                                    className="aspect-video w-full bg-black"
                                    controls
                                    controlsList="nodownload"
                                    playsInline
                                    preload="metadata"
                                    onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; setCurrentTime(t); sendProgress(t); }}
                                    onPause={(e) => sendProgress(e.currentTarget.currentTime, true)}
                                    onEnded={(e) => { sendProgress(e.currentTarget.currentTime, true); if (!lesson.is_completed) markComplete(); }}
                                >
                                    <source src={lesson.stream_url} />
                                    {(lesson.captions ?? []).map((c, i) => (
                                        <track key={i} kind="subtitles" src={c.src} label={c.label ?? 'Captions'} srcLang={c.srclang ?? 'en'} default={i === 0} />
                                    ))}
                                </video>
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-sm text-slate-200">
                                    <span>Resume at {Math.floor(lesson.resume_position ?? 0)}s · saved as you watch</span>
                                    <label className="inline-flex items-center gap-2 font-semibold"><Gauge className="size-4" /> Speed
                                        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-md border border-white/20 bg-slate-900 px-2 py-1 text-white">
                                            {speeds.map((s) => <option key={s} value={s}>{s}x</option>)}
                                        </select>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-300">
                                <p className="text-lg font-semibold">Lesson content</p>
                                <p className="mt-2 text-sm text-slate-400">Video delivery uses authorized, expiring access when available. This lesson is available to enrolled students.</p>
                            </div>
                        )}
                    </div>

                    {lesson.content && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-black text-slate-950">Lesson notes</h2>
                            <div className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{lesson.content}</div>
                        </section>
                    )}

                    {lesson.resources.length > 0 && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-black text-slate-950">Resources</h2>
                            <ul className="mt-3 space-y-2">
                                {lesson.resources.map((r) => (
                                    <li key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><FileText className="size-4 text-blue-600" /> {r.name}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-xs text-slate-500">Resource downloads will be delivered through authorized access.</p>
                        </section>
                    )}

                    <div className="mt-6">
                        {lesson.is_completed ? (
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 font-bold text-emerald-700"><CheckCircle2 className="size-5" /> Lesson completed</span>
                        ) : (
                            <button type="button" onClick={markComplete} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"><CheckCircle2 className="size-5" /> Mark as complete</button>
                        )}
                    </div>
                </article>

                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
                    <h2 className="px-2 text-sm font-black uppercase tracking-wider text-slate-500">Course lessons</h2>
                    <div className="mt-3 space-y-4">
                        {modules.map((m) => (
                            <div key={m.id}>
                                <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400">{m.title}</p>
                                <ul className="mt-1 space-y-1">
                                    {m.lessons.map((l) => {
                                        const active = l.id === lesson.id;
                                        return (
                                            <li key={l.id}>
                                                <Link href={`/student/courses/${course.id}/lessons/${l.id}`} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm ${active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                                                    <span className="flex items-center gap-2">{l.is_completed ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="size-4 rounded-full border border-slate-300" />} {l.title}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </AppShell>
    );
}

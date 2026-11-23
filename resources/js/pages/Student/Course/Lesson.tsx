import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { YouTubeEmbed } from '@/components/lms/youtube-embed';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, Gauge, HelpCircle, ListVideo, NotebookPen } from 'lucide-react';

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
        youtube_id?: string | null;
        video_url?: string | null;
        captions?: { src: string; label?: string; srclang?: string }[];
        resume_position?: number;
        playback_speeds?: number[];
    };
    questions?: { id: number; question: string; answer?: string | null; is_answered: boolean; answered_by?: string | null; created_at?: string | null }[];
};

type Tab = 'content' | 'resources' | 'notes' | 'qa';

export default function Lesson({ course, modules = [], lesson, questions = [] }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastSentRef = useRef(0);
    const [speed, setSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(lesson.resume_position ?? 0);
    const [tab, setTab] = useState<Tab>('content');
    const [note, setNote] = useState('');
    const [savedNote, setSavedNote] = useState(false);
    const [question, setQuestion] = useState('');
    const [questionSent, setQuestionSent] = useState(false);

    const askQuestion = () => {
        if (!question.trim()) return;
        router.post(
            '/student/questions',
            { course_id: course.id, lesson_id: lesson.id, question: question.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setQuestion('');
                    setQuestionSent(true);
                },
            },
        );
    };
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const speeds = lesson.playback_speeds?.length ? lesson.playback_speeds : [1];

    const allLessons = modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    const completedCount = allLessons.filter((l) => l.is_completed).length;
    const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

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
            try { v.currentTime = Math.max(0, lesson.resume_position || 0); } catch { /* ignore seek errors */ }
        };
        if (v.readyState >= 1) onLoaded();
        else v.addEventListener('loadedmetadata', onLoaded, { once: true });
    }, [lesson.resume_position]);

    const sidebar = (
        <div className="space-y-4">
            <div>
                <p className="px-2 text-xs font-bold text-slate-500 dark:text-slate-400">တိုးတက်မှု {completedCount}/{allLessons.length} · {percent}%</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} /></div>
            </div>
            {modules.map((m) => (
                <div key={m.id}>
                    <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400">{m.title}</p>
                    <ul className="mt-1 space-y-1">
                        {m.lessons.map((l) => {
                            const active = l.id === lesson.id;
                            return (
                                <li key={l.id}>
                                    <Link href={`/student/courses/${course.id}/lessons/${l.id}`} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm ${active ? 'bg-teal-50 font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
                                        <span className="flex items-center gap-2">{l.is_completed ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> : <span className="size-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" />} {l.title}</span>
                                        <span className="shrink-0 text-[11px] text-slate-400">{l.duration} မိနစ်</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );

    return (
        <LmsShell title={course.title} nav="student">
            <Head title={`${lesson.title} · ${course.title}`} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <article className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={`/student/courses/${course.id}/learn`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> သင်တန်း သို့ ပြန်သွားရန်</Link>
                        <button onClick={() => setSidebarOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-200"><ListVideo className="size-4" /> သင်ခန်းစာများ</button>
                    </div>
                    <p className="mt-4 text-sm font-bold uppercase tracking-wider text-teal-600">{lesson.module.title}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{lesson.title}</h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> {lesson.duration} မိနစ်</span>
                        <span className="capitalize">{lesson.type}</span>
                        {lesson.is_completed && <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> ပြီးစီးပြီးပါပြီ</span>}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                        {lesson.youtube_id ? (
                            <YouTubeEmbed videoId={lesson.youtube_id} title={lesson.title} />
                        ) : lesson.type === 'video' && lesson.stream_url ? (
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
                                    <span>{Math.floor(lesson.resume_position ?? 0)} စက္ကန့်မှ ပြန်စသည် · ကြည့်ရှုချိန် အလိုအလျောက် သိမ်းသည်</span>
                                    <label className="inline-flex items-center gap-2 font-semibold"><Gauge className="size-4" /> အမြန်နှုန်း
                                        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-md border border-white/20 bg-slate-900 px-2 py-1 text-white">
                                            {speeds.map((s) => <option key={s} value={s}>{s}x</option>)}
                                        </select>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-300">
                                <p className="text-lg font-semibold">သင်ခန်းစာ အကြောင်းအရာ</p>
                                <p className="mt-2 text-sm text-slate-400">ဗီဒီယို မရှိပါ — အောက်ပါ အကြောင်းအရာကို ဖတ်ရှုပါ။</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
                        {([
                            { key: 'content', label: 'အကြောင်းအရာ' },
                            { key: 'resources', label: `ရင်းမြစ် (${lesson.resources.length})` },
                            { key: 'notes', label: 'မှတ်စု' },
                            { key: 'qa', label: `မေးခွန်း (${questions.length})` },
                        ] as { key: Tab; label: string }[]).map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold ${tab === t.key ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>{t.label}</button>
                        ))}
                    </div>

                    {tab === 'content' && (
                        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            {lesson.content ? (
                                <div className="whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{lesson.content}</div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">ဤသင်ခန်းစာအတွက် စာသား အကြောင်းအရာ မရှိပါ။</p>
                            )}
                        </section>
                    )}

                    {tab === 'resources' && (
                        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            {lesson.resources.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">ရင်းမြစ် ဖိုင် မရှိပါ။</p>
                            ) : (
                                <ul className="space-y-2">
                                    {lesson.resources.map((r) => (
                                        <li key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"><FileText className="size-4 shrink-0 text-teal-600" /> {r.name}</li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">ရင်းမြစ် ဖိုင်များကို စာရင်းသွင်းထားသော ကျောင်းသားများသာ ဒေါင်းလုဒ် လုပ်နိုင်ပါသည်။</p>
                        </section>
                    )}

                    {tab === 'notes' && (
                        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><NotebookPen className="size-5 text-teal-600" /> ကိုယ်ပိုင် မှတ်စု</h2>
                            <textarea value={note} onChange={(e) => { setNote(e.target.value); setSavedNote(false); }} rows={5} placeholder="ဤသင်ခန်းစာအတွက် မှတ်စု ရေးရန်…" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                            <div className="mt-3 flex items-center gap-3">
                                <button onClick={() => setSavedNote(true)} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">မှတ်စု သိမ်းရန်</button>
                                {savedNote && <span className="text-sm font-semibold text-emerald-600">သိမ်းပြီးပါပြီ (ဤ browser တွင်သာ)</span>}
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">မှတ်စုများကို <Link href="/student/notes" className="font-bold text-teal-600">မှတ်စုများ စာမျက်နှာ</Link> တွင် စုစည်း ကြည့်နိုင်သည်။</p>
                        </section>
                    )}

                    {tab === 'qa' && (
                        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><HelpCircle className="size-5 text-teal-600" /> ဆရာကို မေးခွန်း မေးရန်</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဤ သင်ခန်းစာနဲ့ ပတ်သက်ပြီး နားမလည်တာ ရှိရင် မေးနိုင်ပါတယ် — ဆရာက ဖြေကြားပေးပါမယ်။</p>
                            {questionSent && <p className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">မေးခွန်း တင်ပြီးပါပြီ — ဆရာ ဖြေကြားပေးပါမယ်။</p>}
                            <textarea value={question} onChange={(e) => { setQuestion(e.target.value); setQuestionSent(false); }} rows={3} maxLength={5000} placeholder="မေးခွန်း ရေးရန်…" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                            <button onClick={askQuestion} disabled={!question.trim()} className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">မေးခွန်း တင်ရန်</button>

                            {questions.length > 0 && (
                                <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
                                    <h3 className="font-extrabold text-slate-900 dark:text-white">သင့် မေးခွန်းများ</h3>
                                    {questions.map((q) => (
                                        <div key={q.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                            <p className="text-sm leading-6 text-slate-800 dark:text-slate-100">{q.question}</p>
                                            {q.is_answered && q.answer ? (
                                                <p className="mt-3 border-l-2 border-teal-500 pl-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                    <span className="font-bold text-teal-700 dark:text-teal-300">{q.answered_by ?? 'ဆရာ'}:</span> {q.answer}
                                                </p>
                                            ) : (
                                                <p className="mt-2 text-xs font-semibold text-amber-600">အဖြေ စောင့်နေပါတယ်</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        {prevLesson ? (
                            <Link href={`/student/courses/${course.id}/lessons/${prevLesson.id}`} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ChevronLeft className="size-4" /> ယခင် သင်ခန်းစာ</Link>
                        ) : <span />}
                        {lesson.is_completed ? (
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="size-5" /> ပြီးစီးပြီးပါပြီ</span>
                        ) : (
                            <button type="button" onClick={markComplete} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700"><CheckCircle2 className="size-5" /> ပြီးစီးကြောင်း မှတ်ရန်</button>
                        )}
                        {nextLesson ? (
                            <Link href={`/student/courses/${course.id}/lessons/${nextLesson.id}`} className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">နောက် သင်ခန်းစာ <ChevronRight className="size-4" /></Link>
                        ) : <span />}
                    </div>
                </article>

                <aside className={`h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                    <h2 className="px-2 text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">သင်တန်း သင်ခန်းစာများ</h2>
                    <div className="mt-3">{sidebar}</div>
                </aside>
            </div>
        </LmsShell>
    );
}

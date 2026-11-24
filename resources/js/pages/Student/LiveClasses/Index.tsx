import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bell, CalendarDays, Eye, PlayCircle, Radio, Users } from 'lucide-react';
import { postJson } from '@/lib/csrf';

type LiveClass = {
    id: number;
    day: string;
    mon: string;
    when: string;
    title: string;
    instructor: string;
    time: string;
    courseTitle: string;
    desc: string;
    liveNow: boolean;
    joined: number;
};

type Recorded = { id: number; live_session_id: number; title: string; instructor: string; date: string; dur: string; views: number; course: number; video_url: string | null; session_title: string };

type Props = { upcoming?: LiveClass[]; recorded?: Recorded[] };

export default function Index({ upcoming = [], recorded = [] }: Props) {
    const list = upcoming;
    const recs = recorded;
    const [tab, setTab] = useState<'all' | 'upcoming' | 'recorded'>('all');
    const [reminded, setReminded] = useState<number[]>([]);
    const toggleRemind = (id: number) => setReminded((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

    // Fire-and-forget view count; the video opens in a new tab.
    const trackView = (r: Recorded) => {
        postJson(`/student/live-classes/${r.live_session_id}/recordings/${r.id}/view`).catch(() => {});
    };

    return (
        <LmsShell title="Live Classes" nav="student">
            <Head title="Live Classes" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Live Classes</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဆရာ/ဆရာမများနဲ့ တိုက်ရိုက် သင်ယူရမည့် အတန်းများနှင့် မှတ်တမ်းများ</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'အားလုံး' },
                    { key: 'upcoming', label: 'လာမည့် အတန်းများ' },
                    { key: 'recorded', label: 'မှတ်တမ်းများ' },
                ] as { key: 'all' | 'upcoming' | 'recorded'; label: string }[]).map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab !== 'recorded' && (
                <section className="mt-6">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">လာမည့် အတန်းများ</h2>
                    {list.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">လာမည့် live class မရှိသေးပါ — session အသစ် စီစဉ်ရင် ဒီမှာ ပေါ်လာပါမယ်။</p>
                    ) : (
                    <div className="mt-4 flex flex-col gap-4">
                        {list.map((s) => (
                            <article key={s.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:text-center">
                                    <span className="grid size-16 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-slate-800">
                                        <span><span className="block text-xl font-extrabold leading-none">{s.day}</span><span className="mt-1 block text-[11px] text-slate-300">{s.mon}</span></span>
                                    </span>
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.liveNow ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'}`}>{s.when}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-extrabold leading-snug text-slate-900 dark:text-white">{s.title}</h3>
                                        {s.liveNow && <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white"><Radio className="size-3" /> LIVE</span>}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.instructor} · {s.time} · {s.courseTitle}</p>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{s.desc}</p>
                                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><Users className="size-3.5" /> {s.joined} ယောက် ပါဝင်မည်</p>
                                </div>
                                <div className="flex shrink-0 flex-col gap-2 sm:w-44">
                                    {s.liveNow ? (
                                        <Link href={`/student/live-classes/${s.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"><Radio className="size-4" /> အတန်း ဝင်ရန်</Link>
                                    ) : (
                                        <button onClick={() => toggleRemind(s.id)} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${reminded.includes(s.id) ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/20 dark:text-teal-300' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
                                            <Bell className="size-4" /> {reminded.includes(s.id) ? 'သတိပေးချက် ထားပြီးပါပြီ' : 'သတိပေးချက် ထားရန်'}
                                        </button>
                                    )}
                                    <Link href={`/student/live-classes/${s.id}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသေးစိတ်</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                    )}
                </section>
            )}

            {tab !== 'upcoming' && (
                <section className="mt-8">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><PlayCircle className="size-5 text-teal-600" /> Live မှတ်တမ်းများ</h2>
                    {recs.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">မှတ်တမ်း မရှိသေးပါ — live class ပြီးဆုံးရင် မှတ်တမ်းတွေ ဒီမှာ ပေါ်လာပါမယ်။</p>
                    ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {recs.map((r) => (
                            <article key={r.id > 0 ? `rec-${r.id}` : `sess-${r.live_session_id}`} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                {r.video_url ? (
                                    <a href={r.video_url} target="_blank" rel="noreferrer" onClick={() => trackView(r)} className="grid aspect-video place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800">
                                        <PlayCircle className="size-10 opacity-80" />
                                    </a>
                                ) : (
                                    <div className="grid aspect-video place-items-center rounded-xl bg-slate-950 text-white"><PlayCircle className="size-10 opacity-80" /></div>
                                )}
                                <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{r.title}</h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.instructor} · {r.date}</p>
                                <p className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {r.dur || '—'}</span>
                                    <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {r.views.toLocaleString()} ကြည့်ရှုမှု</span>
                                </p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {r.video_url ? (
                                        <a href={r.video_url} target="_blank" rel="noreferrer" onClick={() => trackView(r)} className="text-sm font-bold text-teal-600 hover:text-teal-700">မှတ်တမ်း ကြည့်ရန် →</a>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">မှတ်တမ်း မရှိသေးပါ</span>
                                    )}
                                    {r.course > 0 && (
                                        <Link href={`/student/courses/${r.course}/learn`} className="text-sm font-bold text-teal-600 hover:text-teal-700">သင်တန်း ဖွင့်ရန် →</Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    )}
                </section>
            )}
        </LmsShell>
    );
}

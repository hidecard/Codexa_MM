import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bell, CalendarDays, Eye, PlayCircle, Radio, Users } from 'lucide-react';

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

type Recorded = { title: string; instructor: string; date: string; dur: string; views: number; course: number };

type Props = { upcoming?: LiveClass[]; recorded?: Recorded[] };

/* SAMPLE DATA — fallback only; no LiveClass model exists yet (from prototype). */
const SAMPLE_UPCOMING: LiveClass[] = [
    { id: 1, day: '22', mon: 'နိုဝင်ဘာ', when: 'ယနေ့', title: 'React Hooks Deep Dive — Live Session', instructor: 'Thura Aung', time: 'ညနေ 7:00 – 8:30', courseTitle: 'React.js Complete Course', desc: 'useState, useEffect နဲ့ custom hooks တွေကို live coding နဲ့တကွ ရှင်းပြပါမယ်။', liveNow: true, joined: 84 },
    { id: 2, day: '23', mon: 'နိုဝင်ဘာ', when: 'မနက်ဖြန်', title: 'JavaScript Async Patterns — Q&A Live', instructor: 'May Thazin', time: 'ညနေ 7:00 – 8:00', courseTitle: 'JavaScript Deep Dive', desc: 'Promise, async/await နဲ့ ပတ်သက်တဲ့ မေးခွန်းတွေကို တိုက်ရိုက် ဖြေကြားပေးပါမယ်။', liveNow: false, joined: 56 },
    { id: 3, day: '28', mon: 'နိုဝင်ဘာ', when: 'စနေ', title: 'Python OOP Workshop — Live Coding', instructor: 'Kaung Htet Oo', time: 'မနက် 10:00 – 11:30', courseTitle: 'Python for Beginners', desc: 'Class နဲ့ object တွေကို လက်တွေ့ mini project တစ်ခု ဆောက်ရင်း သင်ယူပါမယ်။', liveNow: false, joined: 112 },
    { id: 4, day: '29', mon: 'နိုဝင်ဘာ', when: 'တနင်္ဂနွေ', title: 'Figma Auto Layout Masterclass', instructor: 'Nilar Win', time: 'နေ့လယ် 2:00 – 3:30', courseTitle: 'UI/UX Design with Figma', desc: 'Responsive UI တွေအတွက် Auto Layout ကို အဆင့်မြင့် နည်းလမ်းတွေနဲ့ သုံးပြပါမယ်။', liveNow: false, joined: 73 },
    { id: 5, day: '30', mon: 'နိုဝင်ဘာ', when: 'တနင်္လာ', title: 'Laravel REST API — Live Q&A', instructor: 'Aung Khant', time: 'ညနေ 7:30 – 8:30', courseTitle: 'PHP & Laravel Framework', desc: 'API project လုပ်နေသူတွေအတွက် error ဖြေရှင်းနည်းနဲ့ best practice များ ဆွေးနွေးပါမယ်။', liveNow: false, joined: 41 },
];
const SAMPLE_RECORDED: Recorded[] = [
    { title: 'CSS Grid & Flexbox Masterclass — Live မှတ်တမ်း', instructor: 'Thura Aung', date: 'နိုဝင်ဘာ 15', dur: '1:24:00', views: 1240, course: 1 },
    { title: 'Python Functions Deep Dive — Live မှတ်တမ်း', instructor: 'Kaung Htet Oo', date: 'နိုဝင်ဘာ 12', dur: '58:20', views: 986, course: 3 },
    { title: 'Git Team Workflow — Live မှတ်တမ်း', instructor: 'Kaung Htet Oo', date: 'နိုဝင်ဘာ 08', dur: '1:05:40', views: 754, course: 10 },
];

export default function Index({ upcoming, recorded }: Props) {
    const list = upcoming && upcoming.length > 0 ? upcoming : SAMPLE_UPCOMING;
    const recs = recorded && recorded.length > 0 ? recorded : SAMPLE_RECORDED;
    const [tab, setTab] = useState<'all' | 'upcoming' | 'recorded'>('all');
    const [reminded, setReminded] = useState<number[]>([]);
    const toggleRemind = (id: number) => setReminded((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

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
                </section>
            )}

            {tab !== 'upcoming' && (
                <section className="mt-8">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><PlayCircle className="size-5 text-teal-600" /> Live မှတ်တမ်းများ</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {recs.map((r) => (
                            <article key={r.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="grid aspect-video place-items-center rounded-xl bg-slate-950 text-white"><PlayCircle className="size-10 opacity-80" /></div>
                                <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{r.title}</h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.instructor} · {r.date}</p>
                                <p className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {r.dur}</span>
                                    <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {r.views.toLocaleString()} ကြည့်ရှုမှု</span>
                                </p>
                                <Link href={`/student/courses/${r.course}/learn`} className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">သင်တန်း ဖွင့်ရန် →</Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </LmsShell>
    );
}

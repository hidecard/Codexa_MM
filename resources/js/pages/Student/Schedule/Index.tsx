import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CalendarDays, Clock3, Radio } from 'lucide-react';

type AgendaItem = { time: string; title: string; sub: string; col: string; href: string; btn: string };
type Deadline = { id: number; title: string; course: string; due: string };

/* SAMPLE DATA — fallback only; no schedule backend exists yet (from prototype). */
const WEEK_DAYS = [
    { short: 'တနင်္လာ', name: 'တနင်္လာနေ့', day: 23, today: false, event: false },
    { short: 'အင်္ဂါ', name: 'အင်္ဂါနေ့', day: 24, today: false, event: false },
    { short: 'ဗုဒ္ဓဟူး', name: 'ဗုဒ္ဓဟူးနေ့', day: 25, today: false, event: true },
    { short: 'ကြာသပတေး', name: 'ကြာသပတေးနေ့', day: 26, today: false, event: false },
    { short: 'သောကြာ', name: 'သောကြာနေ့', day: 27, today: false, event: false },
    { short: 'စနေ', name: 'စနေနေ့', day: 28, today: false, event: true },
    { short: 'တနင်္ဂနွေ', name: 'တနင်္ဂနွေနေ့', day: 22, today: true, event: true },
];
const TODAY_AGENDA: AgendaItem[] = [
    { time: 'မနက် 9:00 – 9:45', title: 'ကိုယ်ပိုင် လေ့လာမှု — Python for Beginners', sub: 'Chapter 6 · OOP Basics ဆက်လေ့လာရန်', col: '#22c55e', href: '/student/courses/3/learn', btn: 'စတင်ရန်' },
    { time: 'နေ့လယ် 2:00 – 2:30', title: 'ပြန်လည်လေ့လာခြင်း — JavaScript Async', sub: 'Promise နဲ့ async/await မှတ်စုများ ပြန်ဖတ်ရန်', col: '#38bdf8', href: '/student/courses/2/learn', btn: 'ဖွင့်ရန်' },
    { time: 'ညနေ 7:00 – 8:30', title: 'Live Class — React Hooks Deep Dive', sub: 'ဆရာ Thura Aung · Q&A အပါအဝင်', col: '#ef4444', href: '/student/live-classes/1', btn: 'အသေးစိတ်' },
    { time: 'ည 9:00 – 9:30', title: 'Assignment ပြင်ဆင်မှု', sub: 'JS Array Methods Assignment — မနက်ဖြန် နောက်ဆုံးရက်', col: '#f59e0b', href: '/student/assignments', btn: 'ဖွင့်ရန်' },
];
const DEADLINES: Deadline[] = [
    { id: 1, title: 'JS Array Methods Assignment', course: 'JavaScript Deep Dive', due: 'မနက်ဖြန် · ည 11:59' },
    { id: 2, title: 'Portfolio Website Project', course: 'HTML & CSS Foundations', due: 'နောက် 5 ရက် · ည 11:59' },
    { id: 3, title: 'Python Quiz — Chapter 5', course: 'Python for Beginners', due: 'နောက် 3 ရက်' },
];
const LIVE_THIS_WEEK = [
    { id: 1, title: 'React Hooks Deep Dive — Live Session', when: 'ယနေ့ · ညနေ 7:00 – 8:30 · Thura Aung' },
    { id: 2, title: 'JavaScript Async Patterns — Q&A Live', when: 'မနက်ဖြန် · ညနေ 7:00 – 8:00 · May Thazin' },
    { id: 3, title: 'Python OOP Workshop — Live Coding', when: 'စနေ · မနက် 10:00 – 11:30 · Kaung Htet Oo' },
];

export default function Index() {
    const [day, setDay] = useState(6);
    const selected = WEEK_DAYS[day];

    return (
        <LmsShell title="အချိန်ဇယား" nav="student">
            <Head title="Schedule" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><CalendarDays className="size-7 text-teal-600" /> အချိန်ဇယား</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဒီအပတ် လေ့လာမှု အစီအစဉ်၊ Live class နှင့် Assignment နောက်ဆုံးရက်များ</p>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
                {WEEK_DAYS.map((d, i) => (
                    <button
                        key={d.day + d.name}
                        onClick={() => setDay(i)}
                        className={`rounded-2xl border p-2.5 text-center transition sm:p-3 ${i === day ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-900/20' : 'border-slate-200 bg-white hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900'}`}
                    >
                        <p className="text-[11px] font-extrabold text-slate-400">{d.short}</p>
                        <p className="mt-1 text-lg font-extrabold leading-none text-slate-900 dark:text-white sm:text-xl">{d.day}</p>
                        <p className="mt-1 hidden text-[11px] font-semibold text-slate-500 sm:block dark:text-slate-400">{d.today ? 'ယနေ့' : d.name}</p>
                        <span className={`mx-auto mt-1.5 block size-1.5 rounded-full ${d.event ? 'bg-rose-500' : 'bg-transparent'}`} />
                    </button>
                ))}
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {selected.today
                    ? `ယနေ့ · ${selected.name}, နိုဝင်ဘာ ${selected.day} — ဒီနေ့ အစီအစဉ်များကို အောက်မှာ ကြည့်နိုင်ပါတယ်`
                    : `${selected.name}, နိုဝင်ဘာ ${selected.day}${selected.event ? ' — Live class / deadline ရှိပါတယ်။' : ' — သီးသန့် အစီအစဉ် မရှိသေးပါ။ ကိုယ်ပိုင် လေ့လာချိန်အဖြစ် သုံးနိုင်ပါတယ်။'}`}
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ယနေ့ အစီအစဉ်</h2>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        {TODAY_AGENDA.map((a, i) => (
                            <div key={a.title} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="size-3 shrink-0 rounded-full" style={{ background: a.col, boxShadow: '0 0 0 5px rgba(14,168,146,.12)' }} />
                                    {i < TODAY_AGENDA.length - 1 && <span className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                                </div>
                                <div className="flex-1 pb-5">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{a.time}</p>
                                    <p className="mt-0.5 font-bold leading-snug text-slate-900 dark:text-white">{a.title}</p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                                </div>
                                <Link href={a.href} className="h-fit shrink-0 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{a.btn}</Link>
                            </div>
                        ))}
                    </div>

                    <h2 className="mt-8 flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Clock3 className="size-5 text-amber-500" /> လာမည့် Deadline များ</h2>
                    <div className="mt-4 flex flex-col gap-3">
                        {DEADLINES.map((d) => (
                            <div key={d.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"><Clock3 className="size-5" /></span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold leading-snug text-slate-900 dark:text-white">{d.title}</h3>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{d.course}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{d.due}</span>
                                <Link href="/student/assignments" className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသေးစိတ်</Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Radio className="size-5 text-rose-500" /> ဒီအပတ် Live Class များ</h2>
                        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                            {LIVE_THIS_WEEK.map((s) => (
                                <Link key={s.id} href={`/student/live-classes/${s.id}`} className="block py-3">
                                    <p className="text-sm font-bold leading-snug text-slate-900 hover:text-teal-700 dark:text-white">{s.title}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.when}</p>
                                </Link>
                            ))}
                        </div>
                        <Link href="/student/live-classes" className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">Live Classes အားလုံး →</Link>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

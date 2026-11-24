import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CalendarDays, Clock3, Radio } from 'lucide-react';

type WeekDay = { short: string; name: string; day: number; month: string; date: string; today: boolean; event: boolean };
type AgendaItem = { time: string; title: string; sub: string; col: string; href: string; btn: string };
type Deadline = { id: number; title: string; course: string; due: string };
type LiveItem = { id: number; title: string; when: string };

type Props = {
    weekDays: WeekDay[];
    agendaByDate: Record<string, AgendaItem[]>;
    deadlines: Deadline[];
    liveThisWeek: LiveItem[];
};

export default function Index({ weekDays, agendaByDate, deadlines, liveThisWeek }: Props) {
    const todayIndex = Math.max(0, weekDays.findIndex((d) => d.today));
    const [day, setDay] = useState(todayIndex);
    const selected = weekDays[day] ?? weekDays[0];
    const agenda = selected ? (agendaByDate[selected.date] ?? []) : [];

    return (
        <LmsShell title="အချိန်ဇယား" nav="student">
            <Head title="Schedule" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><CalendarDays className="size-7 text-teal-600" /> အချိန်ဇယား</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဒီအပတ် လေ့လာမှု အစီအစဉ်၊ Live class နှင့် Assignment နောက်ဆုံးရက်များ</p>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
                {weekDays.map((d, i) => (
                    <button
                        key={d.date}
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
            {selected && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {selected.today
                        ? `ယနေ့ · ${selected.name}, ${selected.month} ${selected.day} — ဒီနေ့ အစီအစဉ်များကို အောက်မှာ ကြည့်နိုင်ပါတယ်`
                        : `${selected.name}, ${selected.month} ${selected.day}${selected.event ? ' — Live class / deadline ရှိပါတယ်။' : ' — သီးသန့် အစီအစဉ် မရှိသေးပါ။ ကိုယ်ပိုင် လေ့လာချိန်အဖြစ် သုံးနိုင်ပါတယ်။'}`}
                </p>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{selected?.today ? 'ယနေ့ အစီအစဉ်' : `${selected?.name ?? ''} အစီအစဉ်`}</h2>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        {agenda.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">ဒီနေ့အတွက် စီစဉ်ထားသော Live class သို့မဟုတ် deadline မရှိပါ။</p>
                        ) : (
                            agenda.map((a, i) => (
                                <div key={a.title} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="size-3 shrink-0 rounded-full" style={{ background: a.col, boxShadow: '0 0 0 5px rgba(14,168,146,.12)' }} />
                                        {i < agenda.length - 1 && <span className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                                    </div>
                                    <div className="flex-1 pb-5">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{a.time}</p>
                                        <p className="mt-0.5 font-bold leading-snug text-slate-900 dark:text-white">{a.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                                    </div>
                                    <Link href={a.href} className="h-fit shrink-0 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{a.btn}</Link>
                                </div>
                            ))
                        )}
                    </div>

                    <h2 className="mt-8 flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Clock3 className="size-5 text-amber-500" /> လာမည့် Deadline များ</h2>
                    {deadlines.length === 0 ? (
                        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">လာမည့် deadline မရှိပါ။</p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3">
                            {deadlines.map((d) => (
                                <div key={d.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"><Clock3 className="size-5" /></span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-extrabold leading-snug text-slate-900 dark:text-white">{d.title}</h3>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{d.course}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{d.due}</span>
                                    <Link href={`/student/assignments/${d.id}`} className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသေးစိတ်</Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Radio className="size-5 text-rose-500" /> ဒီအပတ် Live Class များ</h2>
                        {liveThisWeek.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">ဒီအပတ် Live class မရှိပါ။</p>
                        ) : (
                            <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                                {liveThisWeek.map((s) => (
                                    <Link key={s.id} href={`/student/live-classes/${s.id}`} className="block py-3">
                                        <p className="text-sm font-bold leading-snug text-slate-900 hover:text-teal-700 dark:text-white">{s.title}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.when}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <Link href="/student/live-classes" className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">Live Classes အားလုံး →</Link>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bell, CalendarDays, ChevronLeft, Clock3, Radio, User, Users } from 'lucide-react';

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

/* SAMPLE DATA — fallback only (from prototype). */
const SAMPLE: LiveClass[] = [
    { id: 1, day: '22', mon: 'နိုဝင်ဘာ', when: 'ယနေ့', title: 'React Hooks Deep Dive — Live Session', instructor: 'Thura Aung', time: 'ညနေ 7:00 – 8:30', courseTitle: 'React.js Complete Course', desc: 'useState, useEffect နဲ့ custom hooks တွေကို live coding နဲ့တကွ ရှင်းပြပါမယ်။', liveNow: true, joined: 84 },
    { id: 2, day: '23', mon: 'နိုဝင်ဘာ', when: 'မနက်ဖြန်', title: 'JavaScript Async Patterns — Q&A Live', instructor: 'May Thazin', time: 'ညနေ 7:00 – 8:00', courseTitle: 'JavaScript Deep Dive', desc: 'Promise, async/await နဲ့ ပတ်သက်တဲ့ မေးခွန်းတွေကို တိုက်ရိုက် ဖြေကြားပေးပါမယ်။', liveNow: false, joined: 56 },
    { id: 3, day: '28', mon: 'နိုဝင်ဘာ', when: 'စနေ', title: 'Python OOP Workshop — Live Coding', instructor: 'Kaung Htet Oo', time: 'မနက် 10:00 – 11:30', courseTitle: 'Python for Beginners', desc: 'Class နဲ့ object တွေကို လက်တွေ့ mini project တစ်ခု ဆောက်ရင်း သင်ယူပါမယ်။', liveNow: false, joined: 112 },
    { id: 4, day: '29', mon: 'နိုဝင်ဘာ', when: 'တနင်္ဂနွေ', title: 'Figma Auto Layout Masterclass', instructor: 'Nilar Win', time: 'နေ့လယ် 2:00 – 3:30', courseTitle: 'UI/UX Design with Figma', desc: 'Responsive UI တွေအတွက် Auto Layout ကို အဆင့်မြင့် နည်းလမ်းတွေနဲ့ သုံးပြပါမယ်။', liveNow: false, joined: 73 },
    { id: 5, day: '30', mon: 'နိုဝင်ဘာ', when: 'တနင်္လာ', title: 'Laravel REST API — Live Q&A', instructor: 'Aung Khant', time: 'ညနေ 7:30 – 8:30', courseTitle: 'PHP & Laravel Framework', desc: 'API project လုပ်နေသူတွေအတွက် error ဖြေရှင်းနည်းနဲ့ best practice များ ဆွေးနွေးပါမယ်။', liveNow: false, joined: 41 },
];

const AGENDA = [
    { time: '7:00', item: 'အတန်း စတင်ခြင်း နှင့် မိတ်ဆက်ခြင်း' },
    { time: '7:10', item: 'အဓိက အကြောင်းအရာ live coding ဖြင့် ရှင်းပြခြင်း' },
    { time: '8:00', item: 'လက်တွေ့ ဥပမာ နှင့် လေ့ကျင့်ခန်း' },
    { time: '8:20', item: 'မေးခွန်း ဖြေကြားခြင်း (Q&A)' },
];

export default function Show({ live }: { live?: LiveClass | null }) {
    const { url } = usePage();
    const idFromUrl = Number(url.split('/').filter(Boolean).pop());
    const item = live ?? SAMPLE.find((s) => s.id === idFromUrl) ?? SAMPLE[0];
    const [reminded, setReminded] = useState(false);
    const [joined, setJoined] = useState(false);

    return (
        <LmsShell title="Live Class" nav="student">
            <Head title={item.title} />
            <Link href="/student/live-classes" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Live Classes အားလုံး</Link>

            <div className="mt-4 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                    {item.liveNow && <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold"><Radio className="size-3" /> ယခု LIVE လွှင့်နေသည်</span>}
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{item.courseTitle}</span>
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{item.desc}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5"><User className="size-4" /> {item.instructor}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {item.mon} {item.day} · {item.when}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {item.time}</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {item.joined} ယောက် ပါဝင်မည်</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    {item.liveNow ? (
                        <button onClick={() => setJoined(true)} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700">
                            <Radio className="size-4" /> {joined ? 'အတန်းထဲ ရောက်ရှိနေပါပြီ' : 'အတန်း ဝင်ရန်'}
                        </button>
                    ) : (
                        <button onClick={() => setReminded((r) => !r)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500">
                            <Bell className="size-4" /> {reminded ? 'သတိပေးချက် ထားပြီးပါပြီ ✓' : 'သတိပေးချက် ထားရန်'}
                        </button>
                    )}
                    <Link href="/student/schedule" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">အချိန်ဇယားတွင် ကြည့်ရန်</Link>
                </div>
                {reminded && !item.liveNow && <p className="mt-3 text-sm text-teal-300">အတန်း မစခင် 30 မိနစ် အလို သတိပေးပါမည်။</p>}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အတန်း အစီအစဉ်</h2>
                    <ul className="mt-4 space-y-3">
                        {AGENDA.map((a) => (
                            <li key={a.time} className="flex gap-4 text-sm">
                                <span className="w-12 shrink-0 font-extrabold text-teal-600">{a.time}</span>
                                <span className="text-slate-700 dark:text-slate-200">{a.item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ပြင်ဆင်ထားရန်</h2>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <li>အတန်း မစခင် သက်ဆိုင်ရာ သင်ခန်းစာကို အရင် ကြည့်ထားပါ။</li>
                        <li>မေးခွန်း ရှိပါက အတန်း အတွင်း chat မှ မေးမြန်းနိုင်ပါသည်။</li>
                        <li>Live ပြီးနောက် မှတ်တမ်း video ကို ဤစာမျက်နှာတွင် ပြန်ကြည့်နိုင်ပါမည်။</li>
                        <li>အင်တာနက် လိုင်းကောင်းသော နေရာမှ ဝင်ရောက်ပါ။</li>
                    </ul>
                </div>
            </div>
        </LmsShell>
    );
}

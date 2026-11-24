import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { CalendarDays, MapPin, User } from 'lucide-react';

type Event = { id: number; title: string; type: string; date: string; time: string; place: string; host: string; seats: number; total: number; joined: boolean; desc: string };
type Props = { events?: Event[] };

/* SAMPLE DATA — fallback only; no Event model exists yet (from prototype). */
const SAMPLE_EVENTS: Event[] = [
    { id: 1, title: 'React Portfolio Workshop — ကိုယ်ပိုင် Portfolio ဆောက်ကြမယ်', type: 'Workshop', date: 'ဒီဇင်ဘာ 07 · စနေ', time: 'မနက် 10:00 – 12:00', place: 'Online · Zoom', host: 'Thura Aung', seats: 18, total: 60, joined: false, desc: 'React နဲ့ ကိုယ်ပိုင် portfolio website ကို အစအဆုံး အတူတူ ဆောက်မယ့် လက်တွေ့ workshop ပါ။ ပြီးရင် deploy အထိ လုပ်ပေးပါမယ်။' },
    { id: 2, title: 'Myanmar Dev Meetup — Junior မှ Mid-level သို့', type: 'Meetup', date: 'ဒီဇင်ဘာ 14 · စနေ', time: 'ညနေ 2:00 – 5:00', place: 'ရန်ကုန် · MICT Park', host: 'Codexa MM အဖွဲ့', seats: 42, total: 120, joined: true, desc: 'လုပ်ငန်းခွင်ထဲက developer ၄ ဦးရဲ့ အတွေ့အကြုံ မျှဝေမှုနဲ့ networking အစီအစဉ်။ ကျောင်းသားဟောင်းတွေလည်း တက်ရောက်နိုင်ပါတယ်။' },
    { id: 3, title: 'Webinar — AI Tool တွေကို Developer အဖြစ် ထိရောက်စွာ သုံးနည်း', type: 'Webinar', date: 'ဒီဇင်ဘာ 18 · ဗုဒ္ဓဟူး', time: 'ည 7:30 – 9:00', place: 'Online · YouTube Live', host: 'May Thazin', seats: 300, total: 500, joined: false, desc: 'AI assistant တွေကို code review, debugging နဲ့ သင်ယူမှုမှာ ဘယ်လို မှန်မှန်ကန်ကန် သုံးရမလဲ ဆိုတာ live demo နဲ့ ရှင်းပြပါမယ်။' },
    { id: 4, title: 'Codexa Hackathon 2026 — 24 နာရီ စိန်ခေါ်မှု', type: 'Hackathon', date: 'ဇန်နဝါရီ 11–12', time: 'မနက် 9:00 စတင်', place: 'ရန်ကုန် · Codexa MM Campus', host: 'Codexa MM အဖွဲ့', seats: 8, total: 16, joined: false, desc: 'အဖွဲ့ ၁၆ ဖွဲ့၊ ဆုကြေး စုစုပေါင်း ၁၀ သိန်း ကျပ်။ Theme — မြန်မာ စီးပွားငယ်တွေအတွက် နည်းပညာ ဖြေရှင်းချက်။ အဖွဲ့နဲ့ဖြစ်စေ တစ်ဦးချင်းဖြစ်စေ ဝင်ပြိုင်နိုင်ပါတယ်။' },
    { id: 5, title: 'Flutter Study Jam — ပထမဆုံး App ကို Play Store တင်ကြမယ်', type: 'Workshop', date: 'ဇန်နဝါရီ 19 · တနင်္ဂနွေ', time: 'မနက် 10:00 – 1:00', place: 'Online · Zoom', host: 'Su Myat Noe', seats: 25, total: 40, joined: false, desc: 'Flutter app တစ်ခုကို build လုပ်ပြီး Play Store ပေါ် တင်တဲ့ အဆင့်အထိ အတူတူ လိုက်လုပ်မယ့် study jam ပါ။ Laptop ယူလာရုံပါပဲ။' },
];

const TYPES = ['All', 'Workshop', 'Webinar', 'Meetup', 'Hackathon'];

export default function Index({ events }: Props) {
    const [list, setList] = useState<Event[]>(events && events.length > 0 ? events : SAMPLE_EVENTS);
    const [type, setType] = useState('All');
    const filtered = list.filter((e) => type === 'All' || e.type === type);
    const joinedCount = list.filter((e) => e.joined).length;

    const toggleJoin = (id: number) => setList((l) => l.map((e) => (e.id === id ? { ...e, joined: !e.joined, seats: e.seats + (e.joined ? 1 : -1) } : e)));

    return (
        <LmsShell title="ပွဲများ" nav="student">
            <Head title="Events" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><CalendarDays className="size-7 text-teal-600" /> ပွဲများ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ပွဲ {list.length} ခု · စာရင်းသွင်းပြီး {joinedCount} ခု</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {TYPES.map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${type === t ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {t === 'All' ? 'အားလုံး' : t}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {filtered.map((e) => {
                    const pct = Math.round(((e.total - e.seats) / e.total) * 100);
                    return (
                        <article key={e.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold uppercase text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{e.type}</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{e.date} · {e.time}</span>
                            </div>
                            <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{e.title}</h3>
                            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{e.desc}</p>
                            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {e.place}</span>
                                <span className="inline-flex items-center gap-1"><User className="size-3.5" /> စီစဉ်သူ {e.host}</span>
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1"><ProgressBar value={pct} tone="teal" /></div>
                                <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">နေရာ {e.seats} ခု ကျန်</span>
                            </div>
                            <button onClick={() => toggleJoin(e.id)} className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold ${e.joined ? 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                                {e.joined ? 'စာရင်းသွင်းပြီး — ပယ်ဖျက်ရန်' : 'စာရင်းသွင်းရန် (အခမဲ့)'}
                            </button>
                        </article>
                    );
                })}
            </div>
            {filtered.length === 0 && <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ဒီ အမျိုးအစားမှာ ပွဲ မရှိသေးပါ။</p>}
        </LmsShell>
    );
}

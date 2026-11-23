import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { GraduationCap, Star } from 'lucide-react';

type Mentor = { name: string; init: string; col: string; role: string; tags: string; rating: string; sessions: number };
type MySession = { mentor: string; topic: string; when: string; status: string };
type Props = { mentors?: Mentor[]; mySessions?: MySession[] };

/* SAMPLE DATA — fallback only; no Mentor model exists yet (from prototype). */
const SAMPLE_MENTORS: Mentor[] = [
    { name: 'Thura Aung', init: 'TA', col: '#0ea892', role: 'Senior Frontend Engineer · 8 နှစ်', tags: 'React · Career · Portfolio', rating: '4.9', sessions: 132 },
    { name: 'May Thazin', init: 'MT', col: '#ec4899', role: 'Full-stack Developer · 6 နှစ်', tags: 'JavaScript · Node.js · Interview', rating: '4.8', sessions: 98 },
    { name: 'Su Myat Noe', init: 'SM', col: '#38bdf8', role: 'Flutter Developer · 4 နှစ်', tags: 'Flutter · Mobile · Freelance', rating: '4.9', sessions: 64 },
    { name: 'Aung Khant', init: 'AK', col: '#f59e0b', role: 'Backend Engineer · 7 နှစ်', tags: 'PHP · Laravel · Database', rating: '4.7', sessions: 87 },
];
const SAMPLE_SESSIONS: MySession[] = [
    { mentor: 'May Thazin', topic: 'Interview ပြင်ဆင်မှု (mock interview)', when: 'နိုဝင်ဘာ 16 · စနေ မနက် 10:00', status: 'ပြီးဆုံး' },
];

const TOPICS = ['Career အကြံဉာဏ်', 'Interview ပြင်ဆင်မှု (mock interview)', 'Portfolio review', 'Project code review', 'Freelance စတင်ရန်'];
const TIMES = ['စနေ မနက် 10:00', 'စနေ ညနေ 2:00', 'တနင်္ဂနွေ မနက် 10:00', 'တနင်္ဂနွေ ညနေ 4:00'];

export default function Index({ mentors, mySessions }: Props) {
    const list = mentors && mentors.length > 0 ? mentors : SAMPLE_MENTORS;
    const [sessions, setSessions] = useState<MySession[]>(mySessions && mySessions.length > 0 ? mySessions : SAMPLE_SESSIONS);
    const [mentor, setMentor] = useState(list[0]?.name ?? '');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [when, setWhen] = useState(TIMES[0]);
    const [booked, setBooked] = useState(false);

    const book = () => {
        setSessions((s) => [{ mentor, topic, when: `လာမည့် ${when}`, status: 'ကြိုတင်မှာပြီး' }, ...s]);
        setBooked(true);
    };

    return (
        <LmsShell title="Mentorship" nav="student">
            <Head title="Mentorship" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><GraduationCap className="size-7 text-teal-600" /> Mentorship</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">လုပ်ငန်းခွင် အတွေ့အကြုံရှိ mentor များနဲ့ 1-on-1 session မှာယူပြီး လမ်းညွှန်မှု ရယူပါ</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Mentor များ</h2>
                    <div className="mt-4 flex flex-col gap-4">
                        {list.map((m) => (
                            <article key={m.name} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-white" style={{ background: m.col }}>{m.init}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-extrabold text-slate-900 dark:text-white">{m.name}</p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{m.role}</p>
                                    <p className="mt-1 text-xs font-semibold text-teal-600">{m.tags}</p>
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {m.rating} · session {m.sessions} ကြိမ် ပြုလုပ်ပြီး</p>
                                </div>
                                <button onClick={() => { setMentor(m.name); setBooked(false); }} className="shrink-0 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-700">Session မှာရန်</button>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Session ကြိုတင်မှာယူရန်</h2>
                        <div className="mt-4 space-y-3">
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Mentor</span>
                                <select value={mentor} onChange={(e) => setMentor(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                    {list.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">ဆွေးနွေးလိုသော အကြောင်းအရာ</span>
                                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အချိန်</span>
                                <select value={when} onChange={(e) => setWhen(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </label>
                            <button onClick={book} className="w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">Session မှာယူရန် (Pro Plan တွင် လစဉ် 1 ကြိမ် အခမဲ့)</button>
                            {booked && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">Session ကြိုတင်မှာယူပြီးပါပြီ — Zoom link ကို Messages ထဲ ပို့ထားပါတယ်</p>}
                        </div>

                        <h3 className="mt-6 font-extrabold text-slate-900 dark:text-white">ကျွန်ုပ်၏ Session များ</h3>
                        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                            {sessions.map((s, i) => (
                                <div key={i} className="py-3">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.mentor}</p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.topic}</p>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.when}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.status === 'ပြီးဆုံး' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'}`}>{s.status}</span>
                                    </div>
                                </div>
                            ))}
                            {sessions.length === 0 && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Session မရှိသေးပါ</p>}
                        </div>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

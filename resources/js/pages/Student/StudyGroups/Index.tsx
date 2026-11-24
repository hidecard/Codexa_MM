import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Plus, Users } from 'lucide-react';

type Group = { id: number; name: string; topic: string; members: number; desc: string; meet: string; joined: boolean };
type Props = { groups?: Group[] };

/* SAMPLE DATA — fallback only; no StudyGroup model exists yet (from prototype). */
const SAMPLE_GROUPS: Group[] = [
    { id: 1, name: 'React Weekend Warriors', topic: 'Web Development', members: 24, desc: 'စနေ၊ တနင်္ဂနွေ မနက်ပိုင်း React project အတူ ဆောက်ကြမယ်။ အပတ်တိုင်း code review session ရှိပါတယ်။', meet: 'စနေ · မနက် 9:00 (Zoom)', joined: true },
    { id: 2, name: 'Python Beginners Club', topic: 'Programming', members: 41, desc: 'Python အခြေခံ လေ့ကျင့်ခန်းတွေ အတူ ဖြေပြီး မေးခွန်းတွေ ဆွေးနွေးတဲ့ အဖွဲ့ပါ။', meet: 'ဗုဒ္ဓဟူး · ည 8:00 (Zoom)', joined: true },
    { id: 3, name: 'Laravel Myanmar Devs', topic: 'Backend', members: 18, desc: 'Laravel project လက်တွေ့ ဆောက်ရင်း API design နဲ့ deployment အတွေ့အကြုံ မျှဝေကြမယ်။', meet: 'သောကြာ · ည 7:30 (Zoom)', joined: false },
    { id: 4, name: 'UI Design Critique Circle', topic: 'Design', members: 15, desc: 'အပတ်တိုင်း ကိုယ့် design တွေ တင်ပြီး အပြန်အလှန် feedback ပေးတဲ့ အဖွဲ့ပါ။', meet: 'တနင်္ဂနွေ · ညနေ 4:00 (Zoom)', joined: false },
    { id: 5, name: 'Flutter Builders MM', topic: 'Mobile', members: 12, desc: 'Flutter app တွေ အတူ ဆောက်၊ Play Store တင်တဲ့ အတွေ့အကြုံ မျှဝေမယ်။', meet: 'အင်္ဂါ · ည 8:00 (Zoom)', joined: false },
    { id: 6, name: 'Job Hunt Support Group', topic: 'Career', members: 33, desc: 'CV ပြင်၊ mock interview လေ့ကျင့်ပြီး အလုပ် လျှောက်ရာမှာ အချင်းချင်း ကူညီတဲ့ အဖွဲ့ပါ။', meet: 'တနင်္လာ · ည 7:00 (Zoom)', joined: false },
];

const TOPICS = ['Web Development', 'Programming', 'Backend', 'Mobile', 'Design', 'Career'];

export default function Index({ groups }: Props) {
    const [list, setList] = useState<Group[]>(groups && groups.length > 0 ? groups : SAMPLE_GROUPS);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [nextId, setNextId] = useState(100);
    const joinedCount = list.filter((g) => g.joined).length;

    const toggle = (id: number) => setList((l) => l.map((g) => (g.id === id ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g)));
    const create = () => {
        if (!name.trim()) return;
        setList((l) => [{ id: nextId, name: name.trim(), topic, members: 1, desc: desc.trim() || 'အတူတူ လေ့လာပြီး အပတ်စဉ် ဆွေးနွေးမယ့် အဖွဲ့ ဖြစ်ပါတယ်။', meet: 'အပတ်စဉ် · အချိန် မသတ်မှတ်ရသေး', joined: true }, ...l]);
        setNextId((n) => n + 1);
        setName(''); setDesc(''); setShowForm(false);
    };

    return (
        <LmsShell title="လေ့လာမှု အဖွဲ့များ" nav="student">
            <Head title="Study Groups" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Users className="size-7 text-teal-600" /> လေ့လာမှု အဖွဲ့များ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အဖွဲ့ {list.length} ခု · ဝင်ထားတာ {joinedCount} ခု</p>
                </div>
                <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                    <Plus className="size-4" /> အဖွဲ့ အသစ် ဖွဲ့ရန်
                </button>
            </div>

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">အဖွဲ့ အသစ် ဖွဲ့ရန်</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="အဖွဲ့ အမည်" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="အဖွဲ့ အကြောင်း အကျဉ်းချုပ် (မဖြစ်မနေ မဟုတ်)" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <button onClick={create} disabled={!name.trim()} className="mt-3 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">အဖွဲ့ ဖွဲ့ရန် (သင်က admin ဖြစ်ပါမည်)</button>
                </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((g) => (
                    <article key={g.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{g.topic}</span>
                            {g.joined && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">ဝင်ထားပြီး</span>}
                            <span className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">အဖွဲ့ဝင် {g.members} ဦး</span>
                        </div>
                        <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{g.name}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{g.desc}</p>
                        <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">{g.meet}</p>
                        <button onClick={() => toggle(g.id)} className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold ${g.joined ? 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                            {g.joined ? 'အဖွဲ့မှ ထွက်ရန်' : 'အဖွဲ့ ဝင်ရန်'}
                        </button>
                    </article>
                ))}
            </div>
        </LmsShell>
    );
}

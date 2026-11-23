import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CheckCircle2, Code2, Play, Trophy, XCircle } from 'lucide-react';

type Challenge = { id: number; title: string; lang: string; diff: 'Easy' | 'Medium' | 'Hard'; xp: number; solved: boolean; desc: string; starter: string; expect: string[]; tests: string[] };
type Props = { challenges?: Challenge[] };

/* SAMPLE DATA — fallback only; no Challenge model exists yet (from prototype). */
const SAMPLE_CHALLENGES: Challenge[] = [
    { id: 1, title: 'Array ထဲက အကြီးဆုံး ဂဏန်း ရှာပါ', lang: 'JavaScript', diff: 'Easy', xp: 30, solved: false, desc: 'ဂဏန်း array တစ်ခု ပေးထားပါတယ်။ အကြီးဆုံး ဂဏန်းကို ပြန်ပေးတဲ့ findMax(arr) function ရေးပါ။', starter: 'function findMax(arr) {\n  // ဒီမှာ code ရေးပါ\n  \n}', expect: ['function findMax', 'return'], tests: ['findMax([3, 7, 2]) → 7', 'findMax([-5, -1, -9]) → -1', 'findMax([42]) → 42'] },
    { id: 2, title: 'စာလုံး ပြောင်းပြန် လှန်ပါ', lang: 'Python', diff: 'Easy', xp: 30, solved: false, desc: 'စာသား တစ်ခု ပေးထားပါတယ်။ ပြောင်းပြန် လှန်ပြီး ပြန်ပေးတဲ့ reverse_text(s) function ရေးပါ။', starter: "def reverse_text(s):\n    # ဒီမှာ code ရေးပါ\n    pass", expect: ['def reverse_text', 'return'], tests: ["reverse_text('codexa') → 'axeduc'", "reverse_text('abc') → 'cba'", "reverse_text('') → ''"] },
    { id: 3, title: 'FizzBuzz — 1 မှ 20', lang: 'JavaScript', diff: 'Easy', xp: 40, solved: true, desc: "1 မှ 20 အထိ ပုံနှိပ်ပါ။ 3 နဲ့ စားပြတ်ရင် 'Fizz'၊ 5 နဲ့ စားပြတ်ရင် 'Buzz'၊ နှစ်ခုလုံးနဲ့ စားပြတ်ရင် 'FizzBuzz' ပုံနှိပ်ပါ။", starter: 'for (let i = 1; i <= 20; i++) {\n  // ဒီမှာ code ရေးပါ\n}', expect: ['for', 'FizzBuzz'], tests: ["3 → 'Fizz'", "5 → 'Buzz'", "15 → 'FizzBuzz'"] },
    { id: 4, title: 'Palindrome စစ်ဆေးပါ', lang: 'Python', diff: 'Medium', xp: 60, solved: false, desc: 'စာသား တစ်ခုက ရှေ့နောက် အတူတူ ဖတ်လို့ရသလား (palindrome) စစ်ပေးတဲ့ is_palindrome(s) function ရေးပါ။ စာလုံးအကြီးအသေးနဲ့ space တွေကို လျစ်လျူရှုပါ။', starter: 'def is_palindrome(s):\n    # ဒီမှာ code ရေးပါ\n    pass', expect: ['def is_palindrome', 'return'], tests: ["is_palindrome('Racecar') → True", "is_palindrome('hello') → False", "is_palindrome('A man a plan a canal Panama') → True"] },
    { id: 5, title: 'ထပ်နေတဲ့ element တွေ ဖယ်ပါ', lang: 'JavaScript', diff: 'Medium', xp: 60, solved: false, desc: 'Array တစ်ခုထဲက ထပ်နေတဲ့ တန်ဖိုးတွေကို ဖယ်ပြီး အသစ် array ပြန်ပေးတဲ့ unique(arr) function ရေးပါ။ မူလ အစဉ်ကို မပြောင်းပါနဲ့။', starter: 'function unique(arr) {\n  // Set သုံးရင် ပိုလွယ်ပါတယ်\n  \n}', expect: ['function unique', 'return'], tests: ['unique([1,1,2,3,3]) → [1,2,3]', "unique(['a','a','b']) → ['a','b']", 'unique([]) → []'] },
    { id: 6, title: 'နှစ်ခု ပေါင်းခြင်း (Two Sum)', lang: 'Python', diff: 'Hard', xp: 100, solved: false, desc: 'ဂဏန်း list နဲ့ target တစ်ခု ပေးထားပါတယ်။ ပေါင်းရင် target ရတဲ့ ဂဏန်း နှစ်ခုရဲ့ index တွေကို ပြန်ပေးတဲ့ two_sum(nums, target) function ရေးပါ။', starter: 'def two_sum(nums, target):\n    # dictionary သုံးရင် O(n) နဲ့ ဖြေလို့ရပါတယ်\n    pass', expect: ['def two_sum', 'return'], tests: ['two_sum([2,7,11,15], 9) → [0,1]', 'two_sum([3,2,4], 6) → [1,2]', 'two_sum([3,3], 6) → [0,1]'] },
];

function diffBadge(diff: Challenge['diff']) {
    if (diff === 'Easy') return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Easy</span>;
    if (diff === 'Medium') return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Medium</span>;
    return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">Hard</span>;
}

export default function Index({ challenges }: Props) {
    const [list, setList] = useState<Challenge[]>(challenges && challenges.length > 0 ? challenges : SAMPLE_CHALLENGES);
    const [diff, setDiff] = useState<'All' | Challenge['diff']>('All');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [code, setCode] = useState('');
    const [result, setResult] = useState<'pass' | 'fail' | null>(null);
    const active = list.find((c) => c.id === activeId) ?? null;
    const solvedCount = list.filter((c) => c.solved).length;
    const earnedXp = list.filter((c) => c.solved).reduce((s, c) => s + c.xp, 0);
    const filtered = list.filter((c) => diff === 'All' || c.diff === diff);

    const open = (c: Challenge) => { setActiveId(c.id); setCode(c.starter); setResult(null); };
    const run = () => {
        if (!active) return;
        const ok = active.expect.every((e) => code.includes(e));
        setResult(ok ? 'pass' : 'fail');
        if (ok && !active.solved) {
            setList((l) => l.map((c) => (c.id === active.id ? { ...c, solved: true } : c)));
        }
    };

    return (
        <LmsShell title="Code Challenge" nav="student">
            <Head title="Code Challenges" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Code2 className="size-7 text-teal-600" /> Code Challenge</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">နေ့စဉ် coding challenge တွေ ဖြေပြီး XP စုပါ · ဖြေပြီးသား {solvedCount}/{list.length} · ရရှိပြီး XP {earnedXp}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"><Trophy className="size-4 text-amber-500" /> {earnedXp} XP</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDiff(d)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${diff === d ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {d === 'All' ? 'အားလုံး' : d}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                    {filtered.map((c) => (
                        <article key={c.id} className={`rounded-2xl border p-5 dark:border-slate-800 ${c.id === activeId ? 'border-teal-500 bg-white ring-1 ring-teal-500 dark:bg-slate-900' : 'border-slate-200 bg-white dark:bg-slate-900'}`}>
                            <div className="flex flex-wrap items-center gap-2">
                                {diffBadge(c.diff)}
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{c.lang}</span>
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">+{c.xp} XP</span>
                                {c.solved && <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="size-4" /> ဖြေပြီးပါပြီ</span>}
                            </div>
                            <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{c.title}</h3>
                            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{c.desc}</p>
                            <button onClick={() => open(c)} className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{c.solved ? 'ပြန်ဖြေကြည့်ရန်' : 'Challenge ဖြေရန်'}</button>
                        </article>
                    ))}
                </div>

                <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                    {active ? (
                        <>
                            <h2 className="font-extrabold text-slate-900 dark:text-white">{active.title}</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{active.lang} · {active.diff} · +{active.xp} XP</p>
                            <textarea value={code} onChange={(e) => { setCode(e.target.value); setResult(null); }} rows={10} spellCheck={false} className="mt-4 w-full rounded-xl bg-slate-950 p-4 font-mono text-sm leading-6 text-emerald-200 outline-none focus:ring-2 focus:ring-teal-500" />
                            <div className="mt-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Test cases</p>
                                <ul className="mt-2 space-y-1">
                                    {active.tests.map((t) => <li key={t} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{t}</li>)}
                                </ul>
                            </div>
                            <button onClick={run} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"><Play className="size-4" /> Run &amp; စစ်ဆေးရန်</button>
                            {result === 'pass' && (
                                <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"><CheckCircle2 className="size-5" /> အားလုံး မှန်ကန်ပါသည် — +{active.xp} XP ရရှိပါပြီ!</p>
                            )}
                            {result === 'fail' && (
                                <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"><XCircle className="size-5" /> လိုအပ်သော ပုံစံ မပါသေးပါ — function နာမည်နှင့် return ကို စစ်ကြည့်ပါ။</p>
                            )}
                            <p className="mt-3 text-xs text-slate-400">မှတ်ချက် — စစ်ဆေးမှုသည် ရိုးရှင်းသော ပုံစံ စစ်ဆေးခြင်းသာ ဖြစ်သည် (code runner အစစ်အမှန် မဟုတ်)။</p>
                        </>
                    ) : (
                        <div className="py-10 text-center">
                            <Code2 className="mx-auto size-12 text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">Challenge တစ်ခု ရွေးချယ်ပါ</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဘယ်ဘက်မှ challenge ကို နှိပ်ပြီး code ရေးဖြေနိုင်ပါသည်။</p>
                        </div>
                    )}
                </div>
            </div>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Crown, Flame, Medal, TrendingDown, TrendingUp } from 'lucide-react';

type Entry = { rank: number; n: string; xp: number; streak: number; done: number; init: string; col: string; ch: number; you?: boolean };
type XpRule = { action: string; xp: string };
type Props = { week?: Entry[]; month?: Entry[]; xpRules?: XpRule[] };

export default function Leaderboard({ week = [], month = [], xpRules = [] }: Props) {
    const [period, setPeriod] = useState<'week' | 'month'>('week');
    const list = period === 'week' ? week : month;
    const me = list.find((e) => e.you);
    const myRank = me ? me.rank : null;
    // The current user is appended past the top 10 when outside it; the
    // podium shows only the true top 3, the table shows ranks 4+.
    const top3 = list.filter((e) => e.rank <= 3);
    const rest = list.filter((e) => e.rank > 3);

    return (
        <LmsShell title="Leaderboard" nav="student">
            <Head title="Leaderboard" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Crown className="size-7 text-amber-500" /> Leaderboard</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">XP အများဆုံး ရရှိထားသော ကျောင်းသားများ — သင်ယူလေ၊ အဆင့်တက်လေပါ။</p>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`rounded-full px-4 py-2 text-sm font-bold ${period === p ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                        >
                            {p === 'week' ? 'ဤအပတ်' : 'ဤလ'}
                        </button>
                    ))}
                </div>
            </div>

            {me && myRank && (
                <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-800 dark:bg-teal-900/20">
                    <span className="grid size-12 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: me.col }}>{me.init}</span>
                    <div className="flex-1">
                        <p className="font-extrabold text-slate-900 dark:text-white">သင့်အဆင့် · #{myRank}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{me.xp.toLocaleString()} XP · {me.streak} ရက် streak · သင်ခန်းစာ {me.done} ခု ပြီးစီး</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-teal-700 dark:bg-slate-800 dark:text-teal-300"><Flame className="size-4 text-amber-500" /> {me.streak} ရက်</span>
                </div>
            )}

            {list.length === 0 && (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    {period === 'week' ? 'ဒီအပတ်မှာ XP ရရှိသူ မရှိသေးပါ — သင်ခန်းစာ ပြီးဆုံးအောင် လေ့လာလိုက်ပါ။' : 'ဒီလမှာ XP ရရှိသူ မရှိသေးပါ — သင်ခန်းစာ ပြီးဆုံးအောင် လေ့လာလိုက်ပါ။'}
                </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {top3.map((e, i) => (
                    <article key={e.n} className={`rounded-2xl border p-5 text-center dark:border-slate-800 ${i === 0 ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-900/10' : 'border-slate-200 bg-white dark:bg-slate-900'}`}>
                        <span className="mx-auto grid size-16 place-items-center rounded-full text-lg font-extrabold text-white" style={{ background: e.col }}>{e.init}</span>
                        <p className="mt-3 flex items-center justify-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                            <Medal className={`size-4 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-amber-700'}`} /> #{e.rank} {e.n}
                        </p>
                        {e.you && <span className="mt-1 inline-block rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">သင်</span>}
                        <p className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">{e.xp.toLocaleString()} XP</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{e.streak} ရက် streak · သင်ခန်းစာ {e.done} ခု</p>
                    </article>
                ))}
            </div>

            {rest.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rest.map((e) => (
                        <li key={e.n} className={`flex items-center gap-3 px-5 py-3.5 ${e.you ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                            <span className="w-8 text-center text-sm font-extrabold text-slate-400">#{e.rank}</span>
                            <span className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: e.col }}>{e.init}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-bold text-slate-900 dark:text-white">{e.n}{e.you && <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">သင်</span>}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{e.streak} ရက် streak · သင်ခန်းစာ {e.done} ခု ပြီးစီး</span>
                            </span>
                            {e.ch > 0 ? <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600"><TrendingUp className="size-3.5" /> {e.ch}</span>
                                : e.ch < 0 ? <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600"><TrendingDown className="size-3.5" /> {Math.abs(e.ch)}</span>
                                : <span className="text-xs font-bold text-slate-400">—</span>}
                            <span className="w-20 text-right text-sm font-extrabold text-slate-900 dark:text-white">{e.xp.toLocaleString()} XP</span>
                        </li>
                    ))}
                </ul>
            </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">XP ဘယ်လို ရနိုင်လဲ?</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {xpRules.map((r) => (
                        <li key={r.action} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{r.action}</span>
                            <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-extrabold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{r.xp}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </LmsShell>
    );
}

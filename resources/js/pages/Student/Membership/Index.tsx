import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat } from '@/lib/format';
import { Check, Crown, Sparkles } from 'lucide-react';

type Plan = { name: string; monthly: number; yearly: number; features: string[]; current?: boolean; popular?: boolean };
type Props = { currentPlan?: string; cycle?: 'monthly' | 'yearly'; renewDate?: string };

/* SAMPLE DATA — plan catalogue from the prototype landing page; membership state is a fallback. */
const PLANS: Plan[] = [
    { name: 'Free', monthly: 0, yearly: 0, features: ['အခမဲ့ သင်တန်း 5 ခု', 'Community ဝင်ရောက်ခွင့်', 'အခြေခံ လက်မှတ်', 'မိုဘိုင်းတွင် ကြည့်ရှုနိုင်ခြင်း'] },
    { name: 'Pro', monthly: 30000, yearly: 300000, popular: true, current: true, features: ['သင်တန်းအားလုံး unlimited', 'Live class အားလုံး', 'လက်မှတ်နဲ့ ဆရာ feedback', '1-on-1 mentor session (လစဉ် 1 ကြိမ်)', 'Offline download', 'ဦးစားပေး Support'] },
    { name: 'Team', monthly: 120000, yearly: 1200000, features: ['Pro ၏ အရာအားလုံး', 'အဖွဲ့ဝင် 5 ဦးအထိ', 'အဖွဲ့ တိုးတက်မှု dashboard', 'သီးသန့် Live workshop', 'Invoice ဖြင့် ပေးချေနိုင်ခြင်း'] },
];

export default function Index({ currentPlan = 'Pro', cycle = 'yearly', renewDate = '2027 ဇန်နဝါရီ 15' }: Props) {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>(cycle);
    const [plan, setPlan] = useState(currentPlan);
    const [autoRenew, setAutoRenew] = useState(true);
    const [cancelled, setCancelled] = useState(false);

    return (
        <LmsShell title="အသင်းဝင် စီမံရန်" nav="student">
            <Head title="Membership" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Crown className="size-7 text-amber-500" /> Pro Plan စီမံရန်</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင့် အသင်းဝင် အစီအစဉ်၊ သက်တမ်းနဲ့ နောက် ငွေဖြတ်မည့် ရက်ကို စီမံပါ</p>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950"><Crown className="size-3.5" /> {plan} · {cancelled ? 'ဖျက်သိမ်းထားသည်' : 'အသက်ဝင်ဆဲ'}</p>
                        <h2 className="mt-3 text-2xl font-extrabold">{plan} Plan</h2>
                        <p className="mt-1 text-sm text-slate-300">
                            {cancelled
                                ? `သက်တမ်း ${renewDate} အထိ ဆက် သုံးနိုင်ပြီး ထို့နောက် Free Plan သို့ ပြန်သွားပါမည်။`
                                : `သက်တမ်း — ${renewDate} အထိ · ${billing === 'yearly' ? 'နှစ်စဉ်' : 'လစဉ်'} ငွေဖြတ်မည် · ${autoRenew ? 'အလိုအလျောက် သက်တမ်းတိုးမည်' : 'အလိုအလျောက် သက်တမ်းတိုးမည် မဟုတ်'}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setAutoRenew((v) => !v)} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20">
                            {autoRenew ? 'အလိုအလျောက် တိုးခြင်း ပိတ်ရန်' : 'အလိုအလျောက် တိုးခြင်း ဖွင့်ရန်'}
                        </button>
                        {!cancelled ? (
                            <button onClick={() => setCancelled(true)} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Plan ဖျက်သိမ်းရန်</button>
                        ) : (
                            <button onClick={() => setCancelled(false)} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500">ဖျက်သိမ်းမှု ပြန်ရုပ်သိမ်းရန်</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
                <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>လစဉ်</span>
                <button onClick={() => setBilling((b) => (b === 'monthly' ? 'yearly' : 'monthly'))} className="relative h-7 w-13 rounded-full bg-teal-600" aria-label="toggle billing">
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${billing === 'yearly' ? 'left-7' : 'left-1'}`} />
                </button>
                <span className={`text-sm font-bold ${billing === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>နှစ်စဉ် <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">2 လ အခမဲ့</span></span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {PLANS.map((p) => {
                    const price = billing === 'monthly' ? p.monthly : p.yearly;
                    const isCurrent = plan === p.name;
                    return (
                        <article key={p.name} className={`relative flex flex-col rounded-3xl border p-6 dark:border-slate-800 ${p.popular ? 'border-teal-500 bg-white shadow-lg ring-1 ring-teal-500 dark:bg-slate-900' : 'border-slate-200 bg-white dark:bg-slate-900'}`}>
                            {p.popular && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white"><Sparkles className="size-3" /> လူကြိုက်အများဆုံး</span>}
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{p.name}</h2>
                            <p className="mt-2">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{price === 0 ? 'အခမဲ့' : formatKyat(price)}</span>
                                {price > 0 && <span className="text-sm text-slate-500 dark:text-slate-400"> / {billing === 'monthly' ? 'လ' : 'နှစ်'}</span>}
                            </p>
                            <ul className="mt-5 flex-1 space-y-2.5">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"><Check className="mt-0.5 size-4 shrink-0 text-teal-600" /> {f}</li>
                                ))}
                            </ul>
                            <button
                                onClick={() => { setPlan(p.name); setCancelled(false); }}
                                disabled={isCurrent}
                                className={`mt-6 rounded-xl px-5 py-3 text-sm font-bold ${isCurrent ? 'cursor-default bg-slate-100 text-slate-500 dark:bg-slate-800' : p.popular ? 'bg-teal-600 text-white hover:bg-teal-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                            >
                                {isCurrent ? 'လက်ရှိ Plan' : p.name === 'Free' ? 'Free သို့ ပြန်သွားရန်' : `${p.name} သို့ အဆင့်မြှင့်ရန်`}
                            </button>
                        </article>
                    );
                })}
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                ငွေပေးချေမှု မှတ်တမ်းကို <Link href="/student/payments" className="font-bold text-teal-600">ငွေပေးချေမှု စာမျက်နှာ</Link> တွင် ကြည့်နိုင်ပါသည်။
            </p>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatKyat } from '@/lib/format';
import { Copy, Gift, Send, Users } from 'lucide-react';

type Referral = { name: string; when: string; status: 'bought' | 'joined' | 'invited'; reward: number };
type Props = { referrals?: Referral[]; refCode?: string };

/* SAMPLE DATA — fallback only; no Referral model exists yet (from prototype). */
const SAMPLE_REFERRALS: Referral[] = [
    { name: 'Zaw Lin Htet', when: 'နိုဝင်ဘာ 20', status: 'bought', reward: 10000 },
    { name: 'Thiri Nanda', when: 'နိုဝင်ဘာ 12', status: 'bought', reward: 10000 },
    { name: 'Aung Min Khant', when: 'နိုဝင်ဘာ 05', status: 'joined', reward: 0 },
    { name: 'May Thandar', when: 'အောက်တိုဘာ 28', status: 'invited', reward: 0 },
];

function statusBadge(st: Referral['status']) {
    if (st === 'bought') return <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">ဝယ်ယူပြီး · +10,000</span>;
    if (st === 'joined') return <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">စာရင်းသွင်းပြီး</span>;
    return <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">ဖိတ်ထားဆဲ</span>;
}

export default function Index({ referrals, refCode = 'KAUNGHTET10' }: Props) {
    const [list, setList] = useState<Referral[]>(referrals && referrals.length > 0 ? referrals : SAMPLE_REFERRALS);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [copied, setCopied] = useState(false);
    const [claimed, setClaimed] = useState(0);

    const bought = list.filter((r) => r.status === 'bought').length;
    const earned = list.reduce((s, r) => s + r.reward, 0);
    const balance = earned - claimed;
    const link = `https://codexamm.com/?ref=${refCode}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
        } catch {
            /* clipboard unavailable — still show feedback */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };
    const sendInvite = () => {
        if (!/.+@.+\..+/.test(email.trim())) {
            setEmailError('မှန်ကန်တဲ့ email ထည့်ပေးပါ');
            return;
        }
        setEmailError('');
        setList((l) => [{ name: email.trim(), when: 'ယနေ့', status: 'invited', reward: 0 }, ...l]);
        setEmail('');
    };

    return (
        <LmsShell title="သူငယ်ချင်း ဖိတ်ခေါ်ရန်" nav="student">
            <Head title="Referrals" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Users className="size-7 text-teal-600" /> သူငယ်ချင်း ဖိတ်ခေါ်ရန်</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သူငယ်ချင်း တစ်ဦး သင်တန်း ဝယ်ယူတိုင်း သင်ရော သူငယ်ချင်းပါ 10,000 ကျပ် credit ရရှိပါမည်</p>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                    <Gift className="size-8 text-amber-400" />
                    <div>
                        <h2 className="text-xl font-extrabold">သင့် ဖိတ်ခေါ် link</h2>
                        <p className="text-sm text-slate-300">ဤ link ဖြင့် စာရင်းသွင်းသူက 10% လျှော့ဈေး ရပြီး သင်က credit ရမည်</p>
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input readOnly value={link} className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-mono text-sm text-white outline-none" />
                    <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500">
                        <Copy className="size-4" /> {copied ? 'ကူးယူပြီးပါပြီ ✓' : 'Link ကူးယူရန်'}
                    </button>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} placeholder="သူငယ်ချင်း၏ email" type="email" className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
                    <button onClick={sendInvite} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                        <Send className="size-4" /> ဖိတ်ခေါ်စာ ပို့ရန်
                    </button>
                </div>
                {emailError && <p className="mt-2 text-sm text-rose-300">{emailError}</p>}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="ဖိတ်ခေါ်ထားသူ စုစုပေါင်း" value={`${list.length} ဦး`} tone="teal" />
                <StatCard label="သင်တန်း ဝယ်ယူသူ" value={`${bought} ဦး`} tone="blue" />
                <StatCard label="ရရှိပြီး credit" value={formatKyat(earned)} tone="purple" />
                <StatCard label="သုံးလို့ရတဲ့ credit လက်ကျန်" value={formatKyat(balance)} tone="amber" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ဖိတ်ခေါ်ထားသူများ</h2>
                    <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                        {list.map((r, i) => (
                            <li key={i} className="flex items-center gap-3 py-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-600 text-[11px] font-extrabold text-white">
                                    {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{r.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.when} မှာ ဖိတ်ခေါ်ခဲ့</p>
                                </div>
                                {statusBadge(r.status)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Credit ထုတ်ယူရန်</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Credit ကို နောက် သင်တန်း ဝယ်ယူရာတွင် လျှော့ဈေး အဖြစ် သုံးနိုင်ပါသည်။ လက်ကျန် {formatKyat(balance)} ရှိပါသည်။</p>
                    <button onClick={() => setClaimed(earned)} disabled={balance <= 0} className="mt-4 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                        {balance > 0 ? `${formatKyat(balance)} ကို checkout တွင် သုံးရန်` : 'ထုတ်ယူရန် credit မရှိပါ'}
                    </button>
                    {claimed > 0 && <p className="mt-3 text-sm font-bold text-emerald-600">Credit {formatKyat(claimed)} ကို သင့် အကောင့်တွင် ထည့်သွင်းပြီးပါပြီ။</p>}
                    <Link href="/student/cart" className="mt-3 block text-center text-sm font-bold text-teal-600 hover:text-teal-700">ခြင်းတောင်း သို့ သွားရန် →</Link>
                </div>
            </div>
        </LmsShell>
    );
}

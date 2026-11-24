import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat } from '@/lib/format';
import { Gift, Send, Ticket } from 'lucide-react';

type GiftEntry = { who: string; amount: number; when: string; status: string };
type Props = { balance?: number; sent?: GiftEntry[]; received?: GiftEntry[] };

/* SAMPLE DATA — fallback only; no GiftCard model exists yet (from prototype). */
const SAMPLE_SENT: GiftEntry[] = [
    { who: 'thiri@example.com', amount: 25000, when: 'နိုဝင်ဘာ 10', status: 'အသုံးပြုပြီး' },
];
const SAMPLE_RECEIVED: GiftEntry[] = [
    { who: 'Zaw Lin Htet', amount: 20000, when: 'နိုဝင်ဘာ 2', status: 'လက်ကျန် ထဲ ထည့်ပြီး' },
];
const AMOUNTS = [10000, 25000, 50000, 100000];

export default function Index({ balance = 20000, sent, received }: Props) {
    const [credit, setCredit] = useState(balance);
    const [sentList, setSentList] = useState<GiftEntry[]>(sent && sent.length > 0 ? sent : SAMPLE_SENT);
    const [receivedList] = useState<GiftEntry[]>(received && received.length > 0 ? received : SAMPLE_RECEIVED);
    const [code, setCode] = useState('');
    const [codeMsg, setCodeMsg] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [amount, setAmount] = useState(25000);
    const [message, setMessage] = useState('');
    const [sendMsg, setSendMsg] = useState('');
    const [sendError, setSendError] = useState('');

    const redeem = () => {
        if (!code.trim()) return;
        if (code.trim().toUpperCase() === 'GIFT-2026') {
            setCredit((c) => c + 25000);
            setCodeMsg('လက်ဆောင်ကတ် အသုံးပြုပြီးပါပြီ — 25,000 ကျပ် လက်ကျန်ထဲ ထည့်သွင်းပြီးပါပြီ။');
        } else {
            setCodeMsg('ကုဒ် မမှန်ကန်ပါ။ နမူနာ ကုဒ်: GIFT-2026');
        }
        setCode('');
    };

    const sendGift = () => {
        setSendMsg('');
        setSendError('');
        if (!/.+@.+\..+/.test(toEmail.trim())) {
            setSendError('မှန်ကန်တဲ့ email ထည့်ပေးပါ');
            return;
        }
        setSentList((l) => [{ who: toEmail.trim(), amount, when: 'ယနေ့', status: 'ပို့ပြီးပါပြီ' }, ...l]);
        setSendMsg(`${toEmail.trim()} ထံ ${formatKyat(amount)} တန် လက်ဆောင်ကတ် ပို့ပြီးပါပြီ။`);
        setToEmail('');
        setMessage('');
    };

    return (
        <LmsShell title="လက်ဆောင်ကတ်များ" nav="student">
            <Head title="Gift Cards" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Gift className="size-7 text-teal-600" /> လက်ဆောင်ကတ်များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သူငယ်ချင်းတွေကို သင်တန်း လက်ဆောင်ကတ် ပို့ပေးနိုင်ပြီး လက်ခံရရှိသော ကတ်ကို ဤနေရာတွင် အသုံးပြုနိုင်ပါသည်</p>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-wider text-teal-300">လက်ဆောင် လက်ကျန်</p>
                <p className="mt-2 text-4xl font-extrabold">{formatKyat(credit)}</p>
                <p className="mt-1 text-sm text-slate-300">Checkout တွင် သင်တန်း ဝယ်ယူရာတွင် သုံးနိုင်ပါသည်။</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <input value={code} onChange={(e) => { setCode(e.target.value); setCodeMsg(''); }} placeholder="လက်ဆောင်ကတ် ကုဒ် ထည့်ပါ (ဥပမာ: GIFT-2026)" className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
                    <button onClick={redeem} disabled={!code.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50">
                        <Ticket className="size-4" /> ကတ် အသုံးပြုရန်
                    </button>
                </div>
                {codeMsg && <p className="mt-2 text-sm font-semibold text-teal-300">{codeMsg}</p>}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Send className="size-5 text-teal-600" /> လက်ဆောင်ကတ် ပို့ရန်</h2>
                    <div className="mt-4 space-y-3">
                        <input value={toEmail} onChange={(e) => { setToEmail(e.target.value); setSendError(''); }} placeholder="လက်ခံသူ၏ email" type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <div className="flex flex-wrap gap-2">
                            {AMOUNTS.map((a) => (
                                <button key={a} onClick={() => setAmount(a)} className={`rounded-full px-4 py-2 text-sm font-bold ${amount === a ? 'bg-teal-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:text-slate-300'}`}>
                                    {formatKyat(a)}
                                </button>
                            ))}
                        </div>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="လက်ဆောင်စာ ရေးရန် (မဖြစ်မနေ မဟုတ်)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        {sendError && <p className="text-sm text-rose-600">{sendError}</p>}
                        {sendMsg && <p className="text-sm font-bold text-emerald-600">{sendMsg}</p>}
                        <button onClick={sendGift} className="w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">လက်ဆောင်ကတ် ပို့ရန် — {formatKyat(amount)}</button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ပို့ပြီးသော လက်ဆောင်ကတ်များ</h2>
                        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                            {sentList.map((g, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 py-3">
                                    <span><span className="block text-sm font-bold text-slate-900 dark:text-white">{g.who}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{g.when} · {g.status}</span></span>
                                    <span className="font-extrabold text-slate-900 dark:text-white">{formatKyat(g.amount)}</span>
                                </li>
                            ))}
                            {sentList.length === 0 && <p className="py-3 text-sm text-slate-500 dark:text-slate-400">ပို့ပြီးသော လက်ဆောင်ကတ် မရှိပါ။</p>}
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">လက်ခံရရှိသော လက်ဆောင်ကတ်များ</h2>
                        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                            {receivedList.map((g, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 py-3">
                                    <span><span className="block text-sm font-bold text-slate-900 dark:text-white">{g.who} ထံမှ</span><span className="block text-xs text-slate-500 dark:text-slate-400">{g.when} · {g.status}</span></span>
                                    <span className="font-extrabold text-teal-700 dark:text-teal-300">+{formatKyat(g.amount)}</span>
                                </li>
                            ))}
                            {receivedList.length === 0 && <p className="py-3 text-sm text-slate-500 dark:text-slate-400">လက်ခံရရှိသော လက်ဆောင်ကတ် မရှိပါ။</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

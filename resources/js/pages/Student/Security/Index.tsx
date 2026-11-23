import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { AlertTriangle, CheckCircle2, ChevronLeft, History, MonitorSmartphone, ShieldCheck } from 'lucide-react';

type Session = { id: number; device: string; place: string; when: string; current: boolean };
type HistoryEntry = { when: string; device: string; place: string; ok: boolean };

/* SAMPLE DATA — fallback only; no session-history backend exists yet (from prototype). */
const SAMPLE_SESSIONS: Session[] = [
    { id: 1, device: 'Chrome · Windows (ဒီ device)', place: 'Yangon', when: 'လက်ရှိ ဝင်ထားဆဲ', current: true },
    { id: 2, device: 'Safari · iPhone', place: 'Yangon', when: 'ယနေ့ · မနက် 9:12', current: false },
    { id: 3, device: 'Chrome · Android', place: 'Mandalay', when: 'နိုဝင်ဘာ 18 · ည 8:40', current: false },
];
const SAMPLE_HISTORY: HistoryEntry[] = [
    { when: 'ယနေ့ · မနက် 9:12', device: 'Safari · iPhone', place: 'Yangon', ok: true },
    { when: 'မနေ့က · ည 9:03', device: 'Chrome · Windows', place: 'Yangon', ok: true },
    { when: 'နိုဝင်ဘာ 19 · ည 10:21', device: 'Chrome · Android', place: 'Mandalay', ok: true },
    { when: 'နိုဝင်ဘာ 15 · မနက် 7:44', device: 'မသိသော browser', place: '—', ok: false },
];

export default function Index() {
    const [twoFa, setTwoFa] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [sessions, setSessions] = useState<Session[]>(SAMPLE_SESSIONS);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');

    const changePassword = () => {
        setPwMsg('');
        setPwError('');
        if (!currentPw || newPw.length < 8) {
            setPwError('Password အသစ်သည် အနည်းဆုံး 8 လုံး ရှိရပါမည်။');
            return;
        }
        if (newPw !== confirmPw) {
            setPwError('Password အသစ် နှစ်ခု မတူပါ။');
            return;
        }
        setPwMsg('Password ပြောင်းလဲမှု တောင်းဆိုချက် မှတ်တမ်းတင်ပြီးပါပြီ — အကောင့် ဆက်တင်များမှ အတည်ပြုပါ။ (ဤစာမျက်နှာသည် နမူနာသာ ဖြစ်သည်)');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
    };

    const toggle = (on: boolean, set: (v: boolean) => void) => (
        <button onClick={() => set(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`} aria-label="toggle">
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
    );

    return (
        <LmsShell title="လုံခြုံရေး" nav="student">
            <Head title="Security" />
            <Link href="/student/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Profile သို့ ပြန်သွားရန်</Link>
            <div className="mt-3">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><ShieldCheck className="size-7 text-teal-600" /> လုံခြုံရေး (Security)</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Two-factor authentication, ဝင်ရောက်ထားသော device များနဲ့ login မှတ်တမ်းကို စီမံပါ</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အကောင့် ကာကွယ်မှု</h2>
                    <ul className="mt-4 space-y-5">
                        <li className="flex items-start justify-between gap-3">
                            <span>
                                <span className="block font-bold text-slate-900 dark:text-white">Two-factor authentication (2FA)</span>
                                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{twoFa ? 'ဖွင့်ထားပါတယ် — login တိုင်း ဖုန်းထံ ပို့တဲ့ code ထည့်ရပါမယ်' : 'ပိတ်ထားပါတယ် — ဖွင့်ရင် login တိုင်း ဖုန်းထံ ပို့တဲ့ code ထည့်ရပါမယ်'}</span>
                            </span>
                            {toggle(twoFa, setTwoFa)}
                        </li>
                        <li className="flex items-start justify-between gap-3">
                            <span>
                                <span className="block font-bold text-slate-900 dark:text-white">Login သတိပေးချက် email</span>
                                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">Device အသစ်ကနေ ဝင်ရင် email ပို့ အသိပေးပါတယ်</span>
                            </span>
                            {toggle(loginAlerts, setLoginAlerts)}
                        </li>
                    </ul>
                    <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                        <p className="flex items-center gap-2 font-extrabold"><AlertTriangle className="size-4" /> မသိတဲ့ device တွေ့ရင်</p>
                        <p className="mt-1">ချက်ချင်း ဖယ်ရှားပြီး password ပြောင်းပါ။</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Password ပြောင်းရန်</h2>
                    <div className="mt-4 space-y-3">
                        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="လက်ရှိ password" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Password အသစ် (အနည်းဆုံး 8 လုံး)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Password အသစ် အတည်ပြုရန်" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        {pwError && <p className="text-sm text-rose-600">{pwError}</p>}
                        {pwMsg && <p className="text-sm font-semibold text-emerald-600">{pwMsg}</p>}
                        <button onClick={changePassword} className="w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">Password ပြောင်းရန်</button>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><MonitorSmartphone className="size-5 text-teal-600" /> ဝင်ရောက်ထားသော Device များ</h2>
                    <ul className="mt-4 space-y-3">
                        {sessions.map((s) => (
                            <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800">
                                <span>
                                    <span className="block font-bold text-slate-900 dark:text-white">{s.device}</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{s.place} · {s.when}</span>
                                </span>
                                {s.current ? (
                                    <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">လက်ရှိ device</span>
                                ) : (
                                    <button onClick={() => setSessions((l) => l.filter((x) => x.id !== s.id))} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-rose-900/20">ထွက်ရန်</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><History className="size-5 text-teal-600" /> Login မှတ်တမ်း</h2>
                    <ul className="mt-4 space-y-3">
                        {SAMPLE_HISTORY.map((h, i) => (
                            <li key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800">
                                {h.ok ? <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="size-5 shrink-0 text-rose-600" />}
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{h.device} · {h.place}</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{h.when}</span>
                                </span>
                                <span className={`shrink-0 text-xs font-bold ${h.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{h.ok ? 'အောင်မြင်ခဲ့သည်' : 'မအောင်မြင်ပါ'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </LmsShell>
    );
}

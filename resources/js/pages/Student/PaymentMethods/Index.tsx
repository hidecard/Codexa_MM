import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CreditCard, Landmark, Plus, Smartphone, Star, Trash2 } from 'lucide-react';

type SavedMethod = { id: number; methodId: string; detail: string; isDefault: boolean };
type Props = { methods?: SavedMethod[] };

const METHOD_META: Record<string, { name: string; sub: string; icon: typeof Smartphone }> = {
    kbz: { name: 'KBZPay', sub: 'Mobile wallet · ချက်ချင်း အတည်ပြု', icon: Smartphone },
    wave: { name: 'WavePay', sub: 'Mobile wallet · ချက်ချင်း အတည်ပြု', icon: Smartphone },
    cb: { name: 'CB Pay', sub: 'Mobile wallet · ချက်ချင်း အတည်ပြု', icon: CreditCard },
    bank: { name: 'Bank Transfer', sub: 'KBZ / CB / AYA — အတည်ပြုရန် 1 ရက်အထိ ကြာနိုင်ပါတယ်', icon: Landmark },
};

/* SAMPLE DATA — fallback only; no saved-payment backend exists yet (from prototype). */
const SAMPLE_METHODS: SavedMethod[] = [
    { id: 1, methodId: 'kbz', detail: '09771234567', isDefault: true },
    { id: 2, methodId: 'wave', detail: '09771234567', isDefault: false },
    { id: 3, methodId: 'bank', detail: 'KBZ Bank · Kaung Htet · ****4521', isDefault: false },
];

export default function Index({ methods }: Props) {
    const [list, setList] = useState<SavedMethod[]>(methods && methods.length > 0 ? methods : SAMPLE_METHODS);
    const [showForm, setShowForm] = useState(false);
    const [methodId, setMethodId] = useState('kbz');
    const [detail, setDetail] = useState('');
    const [nextId, setNextId] = useState(100);

    const setDefault = (id: number) => setList((l) => l.map((m) => ({ ...m, isDefault: m.id === id })));
    const add = () => {
        if (!detail.trim()) return;
        setList((l) => [...l, { id: nextId, methodId, detail: detail.trim(), isDefault: l.length === 0 }]);
        setNextId((n) => n + 1);
        setDetail('');
        setShowForm(false);
    };

    return (
        <LmsShell title="ငွေပေးချေမှု နည်းလမ်းများ" nav="student">
            <Head title="Payment Methods" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ငွေပေးချေမှု နည်းလမ်းများ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သိမ်းထားသော ငွေပေးချေမှု နည်းလမ်းများကို စီမံပါ — checkout တွင် လျင်မြန်စွာ သုံးနိုင်ပါသည်</p>
                </div>
                <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                    <Plus className="size-4" /> နည်းလမ်း အသစ် ထည့်ရန်
                </button>
            </div>

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">ငွေပေးချေမှု နည်းလမ်း အသစ်</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr_auto]">
                        <select value={methodId} onChange={(e) => setMethodId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {Object.entries(METHOD_META).map(([id, m]) => <option key={id} value={id}>{m.name}</option>)}
                        </select>
                        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={methodId === 'bank' ? 'ဘဏ် · အကောင့် အမည် · အကောင့် နံပါတ်' : 'ဖုန်းနံပါတ် (ဥပမာ: 09xxxxxxxxx)'} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <button onClick={add} disabled={!detail.trim()} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">သိမ်းရန်</button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">မှတ်ချက် — ငွေပေးချေမှု အချက်အလက်များကို ဤ browser တွင်သာ နမူနာ အနေဖြင့် သိမ်းထားသည်။</p>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {list.map((m) => {
                    const meta = METHOD_META[m.methodId] ?? { name: m.methodId, sub: '', icon: CreditCard };
                    const Icon = meta.icon;
                    return (
                        <article key={m.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300"><Icon className="size-6" /></span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-extrabold text-slate-900 dark:text-white">{meta.name}</h2>
                                    {m.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white"><Star className="size-3" /> မူရင်း</span>}
                                </div>
                                <p className="mt-0.5 font-mono text-sm text-slate-600 dark:text-slate-300">{m.detail}</p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{meta.sub}</p>
                            </div>
                            <div className="flex gap-2">
                                {!m.isDefault && (
                                    <button onClick={() => setDefault(m.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">မူရင်း အဖြစ် သတ်မှတ်ရန်</button>
                                )}
                                <button onClick={() => setList((l) => l.filter((x) => x.id !== m.id))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20"><Trash2 className="size-3.5" /> ဖျက်ရန်</button>
                            </div>
                        </article>
                    );
                })}
                {list.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">သိမ်းထားသော နည်းလမ်း မရှိပါ။</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/student/payments" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">ငွေပေးချေမှု မှတ်တမ်း</Link>
                <Link href="/student/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">ဝယ်ယူမှု မှတ်တမ်း</Link>
            </div>
        </LmsShell>
    );
}

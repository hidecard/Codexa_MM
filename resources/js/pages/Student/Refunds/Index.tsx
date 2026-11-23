import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat } from '@/lib/format';
import { RotateCcw } from 'lucide-react';

type Refund = { id: number; course: string; amount: number; method: string; reason: string; detail?: string | null; date: string; watched: number; status: 'pending' | 'approved' | 'rejected' | string; adminNote?: string | null };
type Props = { refunds?: Refund[] };

/* SAMPLE DATA — fallback only; Refund has no student link in the backend yet (from prototype). */
const SAMPLE_REFUNDS: Refund[] = [
    { id: 1, course: 'MySQL & Database Design', amount: 35000, method: 'KBZPay', reason: 'မှားယွင်း ဝယ်ယူမိပါတယ်', detail: 'React သင်တန်းနဲ့ မှားပြီး ဝယ်မိတာပါ။', date: 'နိုဝင်ဘာ 18', watched: 0, status: 'approved', adminNote: 'အတည်ပြုပြီး — နိုဝင်ဘာ 20 မှာ KBZPay သို့ ပြန်ဝင်ပြီးပါပြီ' },
    { id: 2, course: 'Flutter Mobile Development', amount: 90000, method: 'Bank Transfer', reason: 'အချိန် မပေးနိုင်တော့ပါ', detail: 'အလုပ် အချိန်ဇယား ပြောင်းသွားလို့ ဆက် မတက်နိုင်တော့ပါ။', date: 'နိုဝင်ဘာ 22', watched: 8, status: 'pending', adminNote: '' },
];

const REASONS = ['မှားယွင်း ဝယ်ယူမိပါတယ်', 'အချိန် မပေးနိုင်တော့ပါ', 'နည်းပညာ ပြဿနာကြောင့် ကြည့်မရပါ', 'သင်တန်း အကြောင်းအရာ မျှော်လင့်ထားသလို မဟုတ်ပါ', 'အခြား'];
const MY_COURSES = ['React.js Complete Course', 'JavaScript Deep Dive', 'Python for Beginners', 'HTML & CSS Foundations', 'MySQL & Database Design', 'Flutter Mobile Development'];

function statusBadge(status: string) {
    if (status === 'approved') return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">အတည်ပြုပြီးပါပြီ</span>;
    if (status === 'rejected') return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ပယ်ချလိုက်ပါပြီ</span>;
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">စောင့်နေဆဲ</span>;
}

export default function Index({ refunds }: Props) {
    const [list, setList] = useState<Refund[]>(refunds && refunds.length > 0 ? refunds : SAMPLE_REFUNDS);
    const [showForm, setShowForm] = useState(false);
    const [course, setCourse] = useState(MY_COURSES[0]);
    const [reason, setReason] = useState(REASONS[0]);
    const [detail, setDetail] = useState('');
    const [sent, setSent] = useState(false);

    const submit = () => {
        setList((l) => [{ id: 100 + l.length, course, amount: 0, method: '—', reason, detail, date: 'ယနေ့', watched: 0, status: 'pending', adminNote: '' }, ...l]);
        setSent(true);
        setShowForm(false);
        setDetail('');
    };

    return (
        <LmsShell title="ငွေပြန်အမ်းရန် တောင်းဆိုမှု" nav="student">
            <Head title="Refunds" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><RotateCcw className="size-7 text-teal-600" /> ငွေပြန်အမ်းရန် တောင်းဆိုမှု</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်တန်း ဝယ်ပြီး 7 ရက်အတွင်း၊ သင်ခန်းစာ 20% ထက် ပိုမကြည့်ရသေးရင် ငွေအပြည့် ပြန်အမ်းပေးပါတယ်</p>
                </div>
                <button onClick={() => { setShowForm((s) => !s); setSent(false); }} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">တောင်းဆိုမှု အသစ်</button>
            </div>

            {sent && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                    တောင်းဆိုမှု လက်ခံရရှိပါပြီ — Support အဖွဲ့က စစ်ဆေးပြီး 3 ရက် အတွင်း အကြောင်းပြန်ပါမည်။
                </div>
            )}

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">ငွေပြန်အမ်းရန် တောင်းဆိုရန်</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">သင်တန်း</span>
                            <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {MY_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အကြောင်းရင်း</span>
                            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </label>
                    </div>
                    <label className="mt-3 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အသေးစိတ် (မဖြစ်မနေ မဟုတ်)</span>
                        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} placeholder="အကြောင်းရင်း အသေးစိတ် ရေးပါ…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                    <button onClick={submit} className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">တောင်းဆိုမှု တင်ပြရန်</button>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {list.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-extrabold text-slate-900 dark:text-white">{r.course}</h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.date} · {r.method}{r.amount > 0 ? ` · ${formatKyat(r.amount)}` : ''} · ကြည့်ရှုပြီးမှု {r.watched}%</p>
                            </div>
                            {statusBadge(r.status)}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{r.reason}</p>
                        {r.detail && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.detail}</p>}
                        {r.adminNote && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-3.5 text-sm dark:bg-slate-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin မှတ်ချက်</p>
                                <p className="mt-1 text-slate-700 dark:text-slate-200">{r.adminNote}</p>
                            </div>
                        )}
                    </article>
                ))}
                {list.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ငွေပြန်အမ်းရန် တောင်းဆိုမှု မရှိသေးပါ။</p>}
            </div>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                မူဝါဒ အပြည့်အစုံကို <Link href="/student/help" className="font-bold text-teal-600">အကူအညီ စာမျက်နှာ</Link> တွင် ဖတ်နိုင်ပါသည်။
            </p>
        </LmsShell>
    );
}

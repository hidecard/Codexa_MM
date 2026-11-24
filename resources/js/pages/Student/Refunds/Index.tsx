import { useEffect, useState, type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate, formatKyat } from '@/lib/format';
import { RotateCcw } from 'lucide-react';

type Refund = { id: number; course: string; amount: number; method: string; reason: string; detail?: string | null; date?: string | null; status: 'pending' | 'approved' | 'rejected' | 'processed' | string; adminNote?: string | null };
type Payment = { id: number; course: string; amount: number; method: string; date?: string | null };
type Props = { refunds?: Refund[]; payments?: Payment[]; flash?: { success?: string | null } };

const REASONS = ['မှားယွင်း ဝယ်ယူမိပါတယ်', 'အချိန် မပေးနိုင်တော့ပါ', 'နည်းပညာ ပြဿနာကြောင့် ကြည့်မရပါ', 'သင်တန်း အကြောင်းအရာ မျှော်လင့်ထားသလို မဟုတ်ပါ', 'အခြား'];

function statusBadge(status: string) {
    if (status === 'approved' || status === 'processed') return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">အတည်ပြုပြီးပါပြီ</span>;
    if (status === 'rejected') return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ပယ်ချလိုက်ပါပြီ</span>;
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">စောင့်နေဆဲ</span>;
}

export default function Index({ refunds = [], payments = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        course_payment_id: payments[0]?.id ?? 0,
        reason: REASONS[0],
        detail: '',
        amount: payments[0]?.amount ?? 0,
    });

    const selectedPayment = payments.find((p) => p.id === data.course_payment_id);

    // Default the refund amount to the selected payment's full amount.
    useEffect(() => {
        if (selectedPayment) setData('amount', selectedPayment.amount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.course_payment_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.course_payment_id) return;
        post('/student/refunds', {
            onSuccess: () => {
                setShowForm(false);
                setData('detail', '');
            },
        });
    };

    return (
        <LmsShell title="ငွေပြန်အမ်းရန် တောင်းဆိုမှု" nav="student">
            <Head title="Refunds" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><RotateCcw className="size-7 text-teal-600" /> ငွေပြန်အမ်းရန် တောင်းဆိုမှု</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်တန်း ဝယ်ပြီး 7 ရက်အတွင်း၊ သင်ခန်းစာ 20% ထက် ပိုမကြည့်ရသေးရင် ငွေအပြည့် ပြန်အမ်းပေးပါတယ်</p>
                </div>
                <button onClick={() => setShowForm((s) => !s)} disabled={payments.length === 0} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50" title={payments.length === 0 ? 'ငွေပြန်အမ်းရန် တောင်းဆိုနိုင်သော ငွေပေးချေမှု မရှိသေးပါ' : undefined}>
                    တောင်းဆိုမှု အသစ်
                </button>
            </div>

            {flash?.success && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                    {flash.success}
                </div>
            )}

            {showForm && (
                <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">ငွေပြန်အမ်းရန် တောင်းဆိုရန်</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">ငွေပေးချေမှု</span>
                            <select value={data.course_payment_id} onChange={(e) => setData('course_payment_id', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {payments.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.course} · {formatKyat(p.amount)} · {p.method}
                                    </option>
                                ))}
                            </select>
                            {errors.course_payment_id && <p className="mt-1 text-xs text-rose-600">{errors.course_payment_id}</p>}
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အကြောင်းရင်း</span>
                            <select value={data.reason} onChange={(e) => setData('reason', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {errors.reason && <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>}
                        </label>
                    </div>
                    <label className="mt-3 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">တောင်းဆိုငွေ (ကျပ်)</span>
                        <input type="number" min={1} max={selectedPayment?.amount ?? 0} value={data.amount} onChange={(e) => setData('amount', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        {selectedPayment && <p className="mt-1 text-xs text-slate-400">ပေးချေခဲ့သော ငွေ: {formatKyat(selectedPayment.amount)}</p>}
                        {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
                    </label>
                    <label className="mt-3 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အသေးစိတ် (မဖြစ်မနေ မဟုတ်)</span>
                        <textarea value={data.detail} onChange={(e) => setData('detail', e.target.value)} rows={3} placeholder="အကြောင်းရင်း အသေးစိတ် ရေးပါ…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        {errors.detail && <p className="mt-1 text-xs text-rose-600">{errors.detail}</p>}
                    </label>
                    <button type="submit" disabled={processing || !data.course_payment_id} className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">တောင်းဆိုမှု တင်ပြရန်</button>
                </form>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {refunds.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-extrabold text-slate-900 dark:text-white">{r.course}</h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(r.date)} · {r.method}{r.amount > 0 ? ` · ${formatKyat(r.amount)}` : ''}</p>
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
                {refunds.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ငွေပြန်အမ်းရန် တောင်းဆိုမှု မရှိသေးပါ။</p>}
            </div>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                မူဝါဒ အပြည့်အစုံကို <Link href="/student/help" className="font-bold text-teal-600">အကူအညီ စာမျက်နှာ</Link> တွင် ဖတ်နိုင်ပါသည်။
            </p>
        </LmsShell>
    );
}

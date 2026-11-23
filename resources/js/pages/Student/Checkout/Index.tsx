import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatKyat } from '@/lib/format';
import { BadgeCheck, Building2, CheckCircle2, CreditCard, Landmark, ShieldCheck, ShoppingCart, Smartphone, Tag } from 'lucide-react';

type CartCourse = { id: number; slug: string; title: string; price: number; oldPrice?: number | null };
type Props = { courses?: CartCourse[]; gateways?: Record<Method, boolean> };

type CouponResult = { valid: boolean; code?: string; discount_type?: 'percent' | 'fixed'; discount_value?: number };

type Method = 'kbzpay' | 'wavepay' | 'cbpay' | 'bank';
const METHODS: { key: Method; label: string; desc: string; icon: typeof Smartphone }[] = [
    { key: 'kbzpay', label: 'KBZPay', desc: 'KBZPay wallet ဖြင့် ပေးချေရန်', icon: Smartphone },
    { key: 'wavepay', label: 'WavePay', desc: 'Wave Money wallet ဖြင့် ပေးချေရန်', icon: Smartphone },
    { key: 'cbpay', label: 'CB Pay', desc: 'CB Pay wallet ဖြင့် ပေးချေရန်', icon: CreditCard },
    { key: 'bank', label: 'Bank Transfer', desc: 'ဘဏ် လွှဲပြီး ပြေစာ တင်ရန်', icon: Landmark },
];

async function validateCouponCode(code: string): Promise<CouponResult> {
    const res = await fetch(`/student/coupons/validate?code=${encodeURIComponent(code)}`, { headers: { Accept: 'application/json' } });
    return (await res.json()) as CouponResult;
}

export default function Index({ courses = [], gateways }: Props) {
    // Only gateways the admin has enabled are shown (all enabled by default).
    const enabledMethods = METHODS.filter((m) => gateways?.[m.key] !== false);
    const [method, setMethod] = useState<Method>(enabledMethods[0]?.key ?? 'kbzpay');
    const [coupon, setCoupon] = useState('');
    const [applied, setApplied] = useState<CouponResult | null>(null);
    const [couponError, setCouponError] = useState('');
    const [checkingCoupon, setCheckingCoupon] = useState(false);
    const [phone, setPhone] = useState('');
    const [receiptNote, setReceiptNote] = useState('');
    const [done, setDone] = useState(false);
    const [paidTotal, setPaidTotal] = useState(0);
    const [paidMethod, setPaidMethod] = useState<Method>('kbzpay');
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const subtotal = courses.reduce((s, c) => s + c.price, 0);
    const discount = applied?.valid
        ? applied.discount_type === 'fixed'
            ? Math.min(applied.discount_value ?? 0, subtotal)
            : Math.round(subtotal * ((applied.discount_value ?? 0) / 100))
        : 0;
    const total = subtotal - discount;

    // A coupon applied on the cart page arrives as ?coupon=CODE.
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('coupon');
        if (!code) return;
        setCoupon(code);
        setCheckingCoupon(true);
        validateCouponCode(code)
            .then((data) => {
                if (data.valid) setApplied(data);
            })
            .catch(() => undefined)
            .finally(() => setCheckingCoupon(false));
    }, []);

    const applyCoupon = async () => {
        const code = coupon.trim();
        if (!code) return;
        setCheckingCoupon(true);
        setCouponError('');
        try {
            const data = await validateCouponCode(code);
            if (data.valid) {
                setApplied(data);
            } else {
                setApplied(null);
                setCouponError('ကူပွန် ကုဒ် မမှန်ကန်ပါ။');
            }
        } catch {
            setApplied(null);
            setCouponError('ကူပွန် စစ်ဆေးမှု မအောင်မြင်ပါ — ထပ်ကြိုးစားပါ။');
        } finally {
            setCheckingCoupon(false);
        }
    };

    const pay = () => {
        if (method !== 'bank' && phone.trim().length < 7) return;
        if (processing || courses.length === 0) return;
        setProcessing(true);
        setSubmitError('');
        setPaidTotal(total);
        setPaidMethod(method);
        router.post(
            '/student/orders',
            {
                course_ids: courses.map((c) => c.id),
                coupon_code: applied?.valid ? applied.code : null,
                method,
                reference: method === 'bank' ? receiptNote.trim() || null : phone.trim(),
            },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => setDone(true),
                onError: (errors) => setSubmitError(Object.values(errors).flat().join(' ') || 'အော်ဒါ တင်မှု မအောင်မြင်ပါ။'),
            },
        );
    };

    if (done) {
        return (
            <LmsShell title="ငွေပေးချေမှု" nav="student">
                <Head title="Checkout" />
                <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                    <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">ငွေပေးချေမှု လက်ခံရရှိပါပြီ</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {paidMethod === 'bank'
                            ? 'ဘဏ် လွှဲပြေစာ တင်ပြချက် လက်ခံရရှိပါပြီ။ အတည်ပြုပြီးတာနဲ့ သင်တန်းများ ဖွင့်ပေးပါမည် (များသောအားဖြင့် 24 နာရီ အတွင်း)။'
                            : 'ပေးချေမှု အတည်ပြုပြီးတာနဲ့ သင်တန်းကို ချက်ချင်း စတင်သင်ယူနိုင်ပါမယ်။'}
                    </p>
                    <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">ပေးချေငွေ: {formatKyat(paidTotal)} · {METHODS.find((m) => m.key === paidMethod)?.label}</p>
                    <div className="mt-6 flex flex-col gap-2">
                        <Link href="/student/my-courses" className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ သို့ သွားရန်</Link>
                        <Link href="/student/orders" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ဝယ်ယူမှု မှတ်တမ်း ကြည့်ရန်</Link>
                    </div>
                </div>
            </LmsShell>
        );
    }

    if (courses.length === 0) {
        return (
            <LmsShell title="ငွေပေးချေရန်" nav="student">
                <Head title="Checkout" />
                <EmptyState
                    className="mt-8"
                    icon={<ShoppingCart className="size-10" />}
                    title="ခြင်းတောင်း ဗလာဖြစ်နေပါတယ်"
                    description="ငွေပေးချေရန် သင်တန်း အရင် ရွေးပါ။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ရှာဖွေရန်</Link>}
                />
            </LmsShell>
        );
    }

    return (
        <LmsShell title="ငွေပေးချေရန်" nav="student">
            <Head title="Checkout" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ငွေပေးချေရန်</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ပေးချေမှု အတည်ပြုပြီးတာနဲ့ သင်တန်းကို ချက်ချင်း စတင်သင်ယူနိုင်ပါမယ်</p>
            </div>

            {submitError && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                    {submitError}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="space-y-6 lg:col-span-3">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ဝယ်ယူမည့် သင်တန်းများ</h2>
                        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                            {courses.map((c) => (
                                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                                        {c.oldPrice && <p className="text-xs text-slate-400 line-through">{formatKyat(c.oldPrice)}</p>}
                                    </div>
                                    <span className="font-extrabold text-teal-700 dark:text-teal-300">{formatKyat(c.price)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ငွေပေးချေမှု နည်းလမ်း</h2>
                        {enabledMethods.length === 0 && (
                            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                ငွေပေးချေမှု နည်းလမ်း အားလုံး လက်ရှိ ပိတ်ထားပါသည် — နောက်မှ ပြန်ကြိုးစားပါ။
                            </p>
                        )}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {enabledMethods.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => setMethod(m.key)}
                                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${method === m.key ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-900/20' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'}`}
                                >
                                    <m.icon className={`mt-0.5 size-5 shrink-0 ${method === m.key ? 'text-teal-600' : 'text-slate-400'}`} />
                                    <span>
                                        <span className="block font-extrabold text-slate-900 dark:text-white">{m.label}</span>
                                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{m.desc}</span>
                                    </span>
                                    {method === m.key && <BadgeCheck className="ml-auto size-5 shrink-0 text-teal-600" />}
                                </button>
                            ))}
                        </div>

                        {method === 'bank' ? (
                            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <p className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><Building2 className="size-4" /> ဘဏ် အကောင့် အချက်အလက်</p>
                                <p className="mt-2">KBZ Bank — 0045 1234 5678 9012 (Codexa MM)</p>
                                <p>CB Bank — 0012 3456 7890 1234 (Codexa MM)</p>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">ငွေလွှဲပြီးနောက် အောက်တွင် ပြေစာ အမှတ် / မှတ်ချက် ထည့်ပါ။ အတည်ပြုရန် 24 နာရီ အထိ ကြာနိုင်ပါသည်။</p>
                                <input value={receiptNote} onChange={(e) => setReceiptNote(e.target.value)} placeholder="ပြေစာ အမှတ် / လွှဲခဲ့သော ဖုန်း / အမည်" className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                            </div>
                        ) : (
                            <div className="mt-5">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{METHODS.find((m) => m.key === method)?.label} ဖုန်းနံပါတ်</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09-xxxxxxxxx" inputMode="tel" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                <p className="mt-1.5 text-xs text-slate-400">ငွေပေးချေရန် အတည်ပြု link ကို ဤဖုန်းနံပါတ်သို့ ပို့ပေးပါမည်။</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24 lg:col-span-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အနှစ်ချုပ်</h2>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">သင်တန်း {courses.length} ခု</span><span className="font-bold text-slate-900 dark:text-white">{formatKyat(subtotal)}</span></div>
                        {applied?.valid && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">ကူပွန် {applied.code} {applied.discount_type === 'percent' ? `(${applied.discount_value}%)` : ''}</span><span className="font-bold text-emerald-600">−{formatKyat(discount)}</span></div>}
                        <div className="flex justify-between border-t border-slate-200 pt-3 text-base dark:border-slate-700"><span className="font-extrabold text-slate-900 dark:text-white">ပေးရမည့် စုစုပေါင်း</span><span className="font-extrabold text-teal-700 dark:text-teal-300">{formatKyat(total)}</span></div>
                    </div>

                    <div className="mt-5">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"><Tag className="size-4" /> ကူပွန် ကုဒ်</label>
                        <div className="flex gap-2">
                            <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponError(''); }} placeholder="CODEXA10" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                            <button onClick={applyCoupon} disabled={checkingCoupon} className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသုံးပြုရန်</button>
                        </div>
                        {couponError && <p className="mt-1.5 text-xs text-rose-600">{couponError}</p>}
                        {applied?.valid && <p className="mt-1.5 text-xs font-bold text-emerald-600">ကူပွန် အသုံးပြုပြီးပါပြီ — {applied.discount_type === 'percent' ? `${applied.discount_value}%` : formatKyat(applied.discount_value ?? 0)} လျှော့ပေးထားသည်။</p>}
                    </div>

                    <button onClick={pay} disabled={enabledMethods.length === 0 || (method !== 'bank' && phone.trim().length < 7) || processing} className="mt-6 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                        {formatKyat(total)} ပေးချေရန်
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><ShieldCheck className="size-3.5" /> ငွေပေးချေမှု လုံခြုံစွာ ကာကွယ်ထားပါသည် · 7 ရက် ငွေပြန်အမ်းမည်</p>
                </div>
            </div>
        </LmsShell>
    );
}

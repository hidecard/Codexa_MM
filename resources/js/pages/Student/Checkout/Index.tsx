import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat } from '@/lib/format';
import { BadgeCheck, Building2, CheckCircle2, CreditCard, Landmark, ShieldCheck, Smartphone, Tag } from 'lucide-react';

type CartCourse = { id: number; slug: string; title: string; price: number; oldPrice?: number | null };
type Props = { courses?: CartCourse[] };

/* SAMPLE DATA — fallback only; no Cart/Order backend exists yet (prototype CART = [4, 8]). */
const SAMPLE_CART: CartCourse[] = [
    { id: 4, slug: 'react-complete-course', title: 'React.js Complete Course', price: 95000, oldPrice: 180000 },
    { id: 8, slug: 'mysql-database-design', title: 'MySQL & Database Design', price: 35000, oldPrice: 70000 },
];

type Method = 'kbzpay' | 'wavepay' | 'cbpay' | 'bank';
const METHODS: { key: Method; label: string; desc: string; icon: typeof Smartphone }[] = [
    { key: 'kbzpay', label: 'KBZPay', desc: 'KBZPay wallet ဖြင့် ပေးချေရန်', icon: Smartphone },
    { key: 'wavepay', label: 'WavePay', desc: 'Wave Money wallet ဖြင့် ပေးချေရန်', icon: Smartphone },
    { key: 'cbpay', label: 'CB Pay', desc: 'CB Pay wallet ဖြင့် ပေးချေရန်', icon: CreditCard },
    { key: 'bank', label: 'Bank Transfer', desc: 'ဘဏ် လွှဲပြီး ပြေစာ တင်ရန်', icon: Landmark },
];

export default function Index({ courses }: Props) {
    const items = courses && courses.length > 0 ? courses : SAMPLE_CART;
    const [method, setMethod] = useState<Method>('kbzpay');
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [phone, setPhone] = useState('');
    const [receiptNote, setReceiptNote] = useState('');
    const [done, setDone] = useState(false);

    const subtotal = items.reduce((s, c) => s + c.price, 0);
    const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    const applyCoupon = () => {
        if (coupon.trim().toUpperCase() === 'CODEXA10') {
            setCouponApplied(true);
            setCouponError('');
        } else {
            setCouponApplied(false);
            setCouponError('ကူပွန် ကုဒ် မမှန်ကန်ပါ။');
        }
    };

    const pay = () => {
        if (method !== 'bank' && phone.trim().length < 7) return;
        setDone(true);
    };

    if (done) {
        return (
            <LmsShell title="ငွေပေးချေမှု" nav="student">
                <Head title="Checkout" />
                <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                    <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">ငွေပေးချေမှု လက်ခံရရှိပါပြီ</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {method === 'bank'
                            ? 'ဘဏ် လွှဲပြေစာ တင်ပြချက် လက်ခံရရှိပါပြီ။ အတည်ပြုပြီးတာနဲ့ သင်တန်းများ ဖွင့်ပေးပါမည် (များသောအားဖြင့် 24 နာရီ အတွင်း)။'
                            : 'ပေးချေမှု အတည်ပြုပြီးတာနဲ့ သင်တန်းကို ချက်ချင်း စတင်သင်ယူနိုင်ပါမယ်။'}
                    </p>
                    <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">ပေးချေငွေ: {formatKyat(total)} · {METHODS.find((m) => m.key === method)?.label}</p>
                    <div className="mt-6 flex flex-col gap-2">
                        <Link href="/student/my-courses" className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ သို့ သွားရန်</Link>
                        <Link href="/student/orders" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ဝယ်ယူမှု မှတ်တမ်း ကြည့်ရန်</Link>
                    </div>
                </div>
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

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="space-y-6 lg:col-span-3">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ဝယ်ယူမည့် သင်တန်းများ</h2>
                        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map((c) => (
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
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {METHODS.map((m) => (
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
                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">သင်တန်း {items.length} ခု</span><span className="font-bold text-slate-900 dark:text-white">{formatKyat(subtotal)}</span></div>
                        {couponApplied && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">ကူပွန် CODEXA10 (10%)</span><span className="font-bold text-emerald-600">−{formatKyat(discount)}</span></div>}
                        <div className="flex justify-between border-t border-slate-200 pt-3 text-base dark:border-slate-700"><span className="font-extrabold text-slate-900 dark:text-white">ပေးရမည့် စုစုပေါင်း</span><span className="font-extrabold text-teal-700 dark:text-teal-300">{formatKyat(total)}</span></div>
                    </div>

                    <div className="mt-5">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"><Tag className="size-4" /> ကူပွန် ကုဒ်</label>
                        <div className="flex gap-2">
                            <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponError(''); }} placeholder="CODEXA10" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                            <button onClick={applyCoupon} className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">အသုံးပြုရန်</button>
                        </div>
                        {couponError && <p className="mt-1.5 text-xs text-rose-600">{couponError}</p>}
                        {couponApplied && <p className="mt-1.5 text-xs font-bold text-emerald-600">ကူပွန် အသုံးပြုပြီးပါပြီ — 10% လျှော့ပေးထားသည်။</p>}
                    </div>

                    <button onClick={pay} disabled={method !== 'bank' && phone.trim().length < 7} className="mt-6 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                        {formatKyat(total)} ပေးချေရန်
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><ShieldCheck className="size-3.5" /> ငွေပေးချေမှု လုံခြုံစွာ ကာကွယ်ထားပါသည် · 7 ရက် ငွေပြန်အမ်းမည်</p>
                </div>
            </div>
        </LmsShell>
    );
}

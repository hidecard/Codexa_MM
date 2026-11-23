import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatKyat } from '@/lib/format';
import { ShoppingCart, Tag, Trash2 } from 'lucide-react';

type CartCourse = { id: number; slug: string; title: string; instructor?: string | null; price: number; oldPrice?: number | null; lessons?: number | null };
type Props = { courses?: CartCourse[] };

/* SAMPLE DATA — fallback only; no Cart model exists yet (prototype CART = [4, 8]). */
const SAMPLE_CART: CartCourse[] = [
    { id: 4, slug: 'react-complete-course', title: 'React.js Complete Course', instructor: 'Thura Aung', price: 95000, oldPrice: 180000, lessons: 92 },
    { id: 8, slug: 'mysql-database-design', title: 'MySQL & Database Design', instructor: 'Aung Khant', price: 35000, oldPrice: 70000, lessons: 38 },
];

export default function Index({ courses }: Props) {
    const [items, setItems] = useState<CartCourse[]>(courses && courses.length > 0 ? courses : SAMPLE_CART);
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');

    const subtotal = items.reduce((s, c) => s + c.price, 0);
    const oldTotal = items.reduce((s, c) => s + (c.oldPrice ?? c.price), 0);
    const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    const applyCoupon = () => {
        if (coupon.trim().toUpperCase() === 'CODEXA10') {
            setCouponApplied(true);
            setCouponError('');
        } else {
            setCouponApplied(false);
            setCouponError('ကူပွန် ကုဒ် မမှန်ကန်ပါ။ CODEXA10 ကို စမ်းကြည့်ပါ။');
        }
    };

    return (
        <LmsShell title="ခြင်းတောင်း" nav="student">
            <Head title="Cart" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><ShoppingCart className="size-7 text-teal-600" /> ခြင်းတောင်း</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဝယ်ယူရန် ရွေးထားသော သင်တန်း {items.length} ခု</p>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<ShoppingCart className="size-10" />}
                    title="ခြင်းတောင်း ဗလာဖြစ်နေပါတယ်"
                    description="သင်တန်း ရှာဖွေ၍ ခြင်းတောင်းထဲ ထည့်လိုက်ပါ။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ရှာဖွေရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {items.map((c) => (
                            <article key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-slate-950 font-mono text-lg font-bold text-white dark:bg-slate-800">
                                    {c.title.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/courses/${c.slug}`} className="font-extrabold leading-snug text-slate-900 hover:text-teal-700 dark:text-white">{c.title}</Link>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.instructor}{c.lessons ? ` · သင်ခန်းစာ ${c.lessons} ခု` : ''}</p>
                                    <p className="mt-1.5">
                                        <span className="font-extrabold text-teal-700 dark:text-teal-300">{formatKyat(c.price)}</span>
                                        {c.oldPrice && <span className="ml-2 text-sm text-slate-400 line-through">{formatKyat(c.oldPrice)}</span>}
                                    </p>
                                </div>
                                <button onClick={() => setItems((l) => l.filter((x) => x.id !== c.id))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20">
                                    <Trash2 className="size-3.5" /> ဖယ်ရှားရန်
                                </button>
                            </article>
                        ))}
                        <Link href="/courses" className="text-sm font-bold text-teal-600 hover:text-teal-700">← သင်တန်း ထပ်ရှာရန်</Link>
                    </div>

                    <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အနှစ်ချုပ်</h2>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">စုစုပေါင်း (မူရင်းဈေး)</span><span className="font-bold text-slate-900 line-through dark:text-white">{formatKyat(oldTotal)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">လျှော့ဈေး</span><span className="font-bold text-emerald-600">−{formatKyat(oldTotal - subtotal)}</span></div>
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
                            <p className="mt-2 text-xs text-slate-400">စမ်းသုံးရန် ကုဒ်: CODEXA10</p>
                        </div>

                        <Link href="/student/checkout" className="mt-6 block rounded-xl bg-teal-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-teal-700">ငွေပေးချေရန် ဆက်သွားရန်</Link>
                        <p className="mt-3 text-center text-xs text-slate-400">KBZPay · WavePay · CB Pay · Bank Transfer</p>
                    </div>
                </div>
            )}
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatKyat } from '@/lib/format';
import { ShoppingCart, Tag, Trash2 } from 'lucide-react';

type CartCourse = { id: number; slug: string; title: string; instructor?: string | null; price: number; oldPrice?: number | null; lessons?: number | null };
type Props = { courses?: CartCourse[] };

type CouponResult = { valid: boolean; code?: string; discount_type?: 'percent' | 'fixed'; discount_value?: number };

export default function Index({ courses = [] }: Props) {
    const [coupon, setCoupon] = useState('');
    const [applied, setApplied] = useState<CouponResult | null>(null);
    const [couponError, setCouponError] = useState('');
    const [checkingCoupon, setCheckingCoupon] = useState(false);

    const subtotal = courses.reduce((s, c) => s + c.price, 0);
    const oldTotal = courses.reduce((s, c) => s + (c.oldPrice ?? c.price), 0);
    const discount = applied?.valid
        ? applied.discount_type === 'fixed'
            ? Math.min(applied.discount_value ?? 0, subtotal)
            : Math.round(subtotal * ((applied.discount_value ?? 0) / 100))
        : 0;
    const total = subtotal - discount;

    const applyCoupon = async () => {
        const code = coupon.trim();
        if (!code) return;
        setCheckingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch(`/student/coupons/validate?code=${encodeURIComponent(code)}`, { headers: { Accept: 'application/json' } });
            const data: CouponResult = await res.json();
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

    return (
        <LmsShell title="ခြင်းတောင်း" nav="student">
            <Head title="Cart" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><ShoppingCart className="size-7 text-teal-600" /> ခြင်းတောင်း</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဝယ်ယူရန် ရွေးထားသော သင်တန်း {courses.length} ခု</p>
            </div>

            {courses.length === 0 ? (
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
                        {courses.map((c) => (
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
                                <button onClick={() => router.delete(`/student/cart/${c.id}`)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20">
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
                            {applied?.valid && <p className="mt-1.5 text-xs font-bold text-emerald-600">ကူပွန် အသုံးပြုပြီးပါပြီ — ငွေပေးချေမှု စာမျက်နှာမှာ ထပ်ရိုက်ရန် မလိုပါ။</p>}
                        </div>

                        <Link href={applied?.valid ? `/student/checkout?coupon=${encodeURIComponent(applied.code ?? '')}` : '/student/checkout'} className="mt-6 block rounded-xl bg-teal-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-teal-700">ငွေပေးချေရန် ဆက်သွားရန်</Link>
                        <p className="mt-3 text-center text-xs text-slate-400">KBZPay · WavePay · CB Pay · Bank Transfer</p>
                    </div>
                </div>
            )}
        </LmsShell>
    );
}

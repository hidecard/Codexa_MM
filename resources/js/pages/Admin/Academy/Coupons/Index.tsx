import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { type SampleCoupon } from '@/pages/Admin/Academy/_sample';

type CouponRow = SampleCoupon & { id: number };

export default function Index({ coupons }: { coupons: CouponRow[] }) {
    const [notice, setNotice] = useState('');
    const form = useForm({ code: '', discount_value: 10, usage_limit: '100', expires_at: '' });

    const activeCount = coupons.filter((c) => c.active).length;
    const totalUsed = coupons.reduce((s, c) => s + c.used, 0);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const codeText = form.data.code.trim().toUpperCase();
        if (!codeText) return;
        form.transform((data) => ({
            code: data.code,
            discount_value: data.discount_value,
            usage_limit: data.usage_limit === '' ? null : Number(data.usage_limit),
            expires_at: data.expires_at === '' ? null : data.expires_at,
        }));
        form.post('/admin/academy/coupons', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setNotice(`Coupon ${codeText} ဖန်တီးပြီးပါပြီ`);
            },
        });
    };

    const toggle = (c: CouponRow) => {
        router.post(`/admin/academy/coupons/${c.id}/toggle`, {}, { preserveScroll: true, onSuccess: () => setNotice(`Coupon ${c.code} ${c.active ? 'ပိတ်ပြီးပါပြီ' : 'ပြန်ဖွင့်ပြီးပါပြီ'}`) });
    };
    const remove = (c: CouponRow) => {
        router.delete(`/admin/academy/coupons/${c.id}`, { preserveScroll: true, onSuccess: () => setNotice(`Coupon ${c.code} ဖျက်ပြီးပါပြီ`) });
    };

    return (
        <LmsShell title="Coupon & Promotion စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Coupon & Promotion စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Coupon & Promotion စီမံခန့်ခွဲမှု"
                description="လျှော့ဈေး code အသစ် ဖန်တီးရန်၊ အသုံးပြုမှု စောင့်ကြည့်ရန်နဲ့ သက်တမ်း စီမံရန် — Checkout မှာ ချက်ချင်း အသက်ဝင်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <Plus className="size-5" /> Coupon အသစ် ဖန်တီးရန်
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div>
                        <label className={labelCls}>Coupon Code</label>
                        <input className={`${inputCls} font-mono uppercase`} value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} placeholder="CODEXA10" required />
                        {form.errors.code && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.code}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>လျှော့ဈေး (%)</label>
                        <input className={inputCls} type="number" min={1} max={100} value={form.data.discount_value} onChange={(e) => form.setData('discount_value', Number(e.target.value))} />
                        {form.errors.discount_value && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.discount_value}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>အသုံးပြုနိုင်သည့် အများဆုံး အကြိမ်</label>
                        <input className={inputCls} type="number" min={1} value={form.data.usage_limit} onChange={(e) => form.setData('usage_limit', e.target.value)} placeholder="အကန့်အသတ် မရှိ" />
                    </div>
                    <div>
                        <label className={labelCls}>သက်တမ်းကုန်ဆုံးရက်</label>
                        <input className={inputCls} type="date" value={form.data.expires_at} onChange={(e) => form.setData('expires_at', e.target.value)} />
                        <p className={`mt-1 text-xs ${mutedCls}`}>မရွေးချယ်ပါက သက်တမ်း မရှိပါ</p>
                    </div>
                    <div className="sm:col-span-4">
                        <button type="submit" className={btnAccentCls} disabled={form.processing}>
                            Coupon ဖန်တီးရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            <p className={`mt-6 text-sm font-semibold ${mutedCls}`}>
                Active coupon {activeCount} ခု · အသုံးပြုမှု စုစုပေါင်း {formatNumber(totalUsed)} ကြိမ်
            </p>

            {coupons.length === 0 ? (
                <div className="mt-4">
                    <EmptyBox title="Coupon မရှိတော့ပါ" description="အပေါ်က form မှာ coupon အသစ် ဖန်တီးနိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {coupons.map((c) => {
                        const pctUsed = c.limit ? Math.min(100, Math.round((c.used / c.limit) * 100)) : 0;
                        const exhausted = c.limit > 0 && c.used >= c.limit;
                        return (
                            <LmsCard key={c.code} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${c.active ? '' : 'opacity-60'}`}>
                                <span className="grid size-11 flex-none place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                                    <Ticket className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`font-mono text-[.98rem] font-extrabold ${inkCls}`}>{c.code}</p>
                                        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[.7rem] font-extrabold text-amber-950">-{c.pct}%</span>
                                        {c.active && !exhausted ? <Pill tone="teal">ACTIVE</Pill> : <Pill tone="slate">{exhausted ? 'အကြိမ်ပြည့်' : 'ပိတ်ထား'}</Pill>}
                                    </div>
                                    <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                        သက်တမ်း — {c.expiry} · အသုံးပြုပြီး {formatNumber(c.used)} / {c.limit === 0 ? 'အကန့်အသတ် မရှိ' : `${formatNumber(c.limit)} ကြိမ်`}
                                    </p>
                                    {c.limit > 0 && (
                                        <div className="mt-2 max-w-[260px]">
                                            <ProgressBar value={pctUsed} tone="amber" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    <button type="button" className={btnGhostCls} onClick={() => toggle(c)}>
                                        {c.active ? 'ပိတ်ရန်' : 'ပြန်ဖွင့်ရန်'}
                                    </button>
                                    <button type="button" className={btnGhostCls} onClick={() => remove(c)}>
                                        <Trash2 className="size-4" /> ဖျက်ရန်
                                    </button>
                                </div>
                            </LmsCard>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

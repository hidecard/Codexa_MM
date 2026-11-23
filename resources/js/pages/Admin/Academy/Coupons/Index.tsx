import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COUPONS, type SampleCoupon } from '@/pages/Admin/Academy/_sample';

export default function Index({ coupons }: { coupons?: SampleCoupon[] }) {
    // SAMPLE DATA fallback (prototype): no Coupon model exists yet.
    const [items, setItems] = useState<SampleCoupon[]>(coupons ?? SAMPLE_COUPONS);
    const [code, setCode] = useState('');
    const [pct, setPct] = useState(10);
    const [limit, setLimit] = useState(100);
    const [expiry, setExpiry] = useState('2026 ဒီဇင်ဘာ 31');
    const [notice, setNotice] = useState('');

    const activeCount = items.filter((c) => c.active).length;
    const totalUsed = items.reduce((s, c) => s + c.used, 0);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setItems([{ code: code.trim().toUpperCase(), pct, used: 0, limit, expiry, active: true }, ...items]);
        setCode('');
        setNotice(`Coupon ${code.trim().toUpperCase()} ဖန်တီးပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)`);
    };

    const toggle = (codeText: string) => setItems(items.map((c) => (c.code === codeText ? { ...c, active: !c.active } : c)));
    const remove = (codeText: string) => setItems(items.filter((c) => c.code !== codeText));

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
                        <input className={`${inputCls} font-mono uppercase`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODEXA10" required />
                    </div>
                    <div>
                        <label className={labelCls}>လျှော့ဈေး (%)</label>
                        <input className={inputCls} type="number" min={1} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className={labelCls}>အသုံးပြုနိုင်သည့် အများဆုံး အကြိမ်</label>
                        <input className={inputCls} type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className={labelCls}>သက်တမ်းကုန်ဆုံးရက်</label>
                        <select className={inputCls} value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                            <option>2026 ဒီဇင်ဘာ 31</option>
                            <option>2027 ဇန်နဝါရီ 31</option>
                            <option>2027 မတ် 31</option>
                            <option>သက်တမ်း မရှိ</option>
                        </select>
                    </div>
                    <div className="sm:col-span-4">
                        <button type="submit" className={btnAccentCls}>
                            Coupon ဖန်တီးရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            <p className={`mt-6 text-sm font-semibold ${mutedCls}`}>
                Active coupon {activeCount} ခု · အသုံးပြုမှု စုစုပေါင်း {formatNumber(totalUsed)} ကြိမ်
            </p>

            {items.length === 0 ? (
                <div className="mt-4">
                    <EmptyBox title="Coupon မရှိတော့ပါ" description="အပေါ်က form မှာ coupon အသစ် ဖန်တီးနိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {items.map((c) => {
                        const pctUsed = c.limit ? Math.min(100, Math.round((c.used / c.limit) * 100)) : 0;
                        const exhausted = c.used >= c.limit;
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
                                        သက်တမ်း — {c.expiry} · အသုံးပြုပြီး {formatNumber(c.used)} / {formatNumber(c.limit)} ကြိမ်
                                    </p>
                                    <div className="mt-2 max-w-[260px]">
                                        <ProgressBar value={pctUsed} tone="amber" />
                                    </div>
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    <button type="button" className={btnGhostCls} onClick={() => toggle(c.code)}>
                                        {c.active ? 'ပိတ်ရန်' : 'ပြန်ဖွင့်ရန်'}
                                    </button>
                                    <button type="button" className={btnGhostCls} onClick={() => remove(c.code)}>
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

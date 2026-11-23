import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, Download, RotateCcw, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_PAY_MIX, SAMPLE_TXNS, type SampleTxn } from '@/pages/Admin/Academy/_sample';

export default function Index({ payments }: { payments?: SampleTxn[] }) {
    // SAMPLE DATA fallback (prototype): the Payment model is invoice-linked
    // (Solutions), not LMS course payments — no Academy payment controller yet.
    const [items, setItems] = useState<SampleTxn[]>(payments ?? SAMPLE_TXNS);
    const [tab, setTab] = useState<'all' | 'success' | 'pending' | 'refunded'>('all');
    const [notice, setNotice] = useState('');

    const pending = items.filter((t) => t.status === 'pending').length;
    const list = items.filter((t) => tab === 'all' || t.status === tab);

    const approve = (id: string) => {
        setItems(items.map((t) => (t.id === id ? { ...t, status: 'success' } : t)));
        setNotice(`${id} ကို အတည်ပြုပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)`);
    };
    const refund = (id: string) => {
        setItems(items.map((t) => (t.id === id ? { ...t, status: 'refunded' } : t)));
        setNotice(`${id} ကို ငွေပြန်အမ်းအဖြစ် မှတ်သားပြီးပါပြီ (ဤ page မှာသာ)`);
    };

    return (
        <LmsShell title="ငွေပေးချေမှုများ" nav="admin">
            <Head title="ငွေပေးချေမှုများ" />
            <PageIntro
                eyebrow="ADMIN"
                title="ငွေပေးချေမှုများ"
                description="သင်တန်းကြေးနဲ့ Pro Plan ပေးချေမှုအားလုံးကို စစ်ဆေး အတည်ပြုရန်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> လစဉ် အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="ယနေ့ ဝင်ငွေ" value={formatKyat(485000)} sub="ပေးချေမှု 9 ခု အောင်မြင်" icon={Wallet} tone="teal" />
                <StatCard label="ဒီအပတ် ဝင်ငွေ" value={formatKyat(3240000)} sub="ပြီးခဲ့တဲ့အပတ်ထက် 12% ပိုများ" icon={Wallet} tone="blue" />
                <StatCard label="ဒီလ ဝင်ငွေ" value={formatKyat(12450000)} sub="ပေးချေမှု စုစုပေါင်း 214 ခု" icon={Wallet} tone="purple" />
                <StatCard label="အတည်ပြုရန် ကျန်ရှိ" value={`${pending} ခု`} sub="Bank transfer များ — စစ်ဆေးရန် လိုအပ်" icon={Wallet} tone="amber" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'success'} onClick={() => setTab('success')}>
                    အောင်မြင်
                </Chip>
                <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>
                    စောင့်ဆိုင်းဆဲ
                </Chip>
                <Chip active={tab === 'refunded'} onClick={() => setTab('refunded')}>
                    ငွေပြန်အမ်း
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ filter မှာ ပေးချေမှု မရှိပါ" description="တခြား filter ဖြင့် ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((t) => (
                        <LmsCard key={t.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{t.n}</p>
                                    {t.status === 'success' ? <Pill tone="teal">ပေးချေပြီး</Pill> : t.status === 'pending' ? <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill> : <Pill tone="rose">ငွေပြန်အမ်းပြီး</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {t.id} · {t.item} · {t.method} · {t.date}
                                </p>
                            </div>
                            <span className={`text-[.95rem] font-extrabold ${inkCls}`}>{formatKyat(t.amount)}</span>
                            <div className="flex flex-none flex-wrap gap-2">
                                {t.status === 'pending' && (
                                    <button type="button" className={btnGhostCls} onClick={() => approve(t.id)}>
                                        <Check className="size-4" /> အတည်ပြုရန်
                                    </button>
                                )}
                                {t.status === 'success' && (
                                    <button type="button" className={btnGhostCls} onClick={() => refund(t.id)}>
                                        <RotateCcw className="size-4" /> Refund
                                    </button>
                                )}
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}

            <SectionCard title="နည်းလမ်းအလိုက် အနှစ်ချုပ် · နိုဝင်ဘာ 2026">
                <div className="space-y-3">
                    {SAMPLE_PAY_MIX.map((m) => (
                        <div key={m.name}>
                            <div className="flex justify-between text-[.82rem] font-bold">
                                <span className={inkCls}>{m.name}</span>
                                <span className={mutedCls}>
                                    {m.pct}% · {m.amount}
                                </span>
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.col }} />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </LmsShell>
    );
}

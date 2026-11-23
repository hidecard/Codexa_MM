import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, Download, Pause, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatKyat } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_PAYOUTS, type SamplePayout } from '@/pages/Admin/Academy/_sample';

export default function Index({ payouts }: { payouts?: SamplePayout[] }) {
    // SAMPLE DATA fallback (prototype): no Payout model exists yet.
    const [items, setItems] = useState<SamplePayout[]>(payouts ?? SAMPLE_PAYOUTS);
    const [tab, setTab] = useState<'all' | 'pending' | 'paid' | 'hold'>('all');
    const [notice, setNotice] = useState('');

    const pending = items.filter((p) => p.status === 'pending');
    const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
    const paidTotal = items.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const list = items.filter((p) => tab === 'all' || p.status === tab);

    const setStatus = (id: string, status: SamplePayout['status']) => {
        setItems(items.map((p) => (p.id === id ? { ...p, status } : p)));
        setNotice(`${id} အခြေအနေ ပြောင်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)`);
    };

    return (
        <LmsShell title="ဆရာ Payout စီမံရန်" nav="admin">
            <Head title="ဆရာ Payout စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="ဆရာ Payout စီမံရန်"
                description="ဆရာတွေရဲ့ ခွဲဝေငွေ (ဝင်ငွေ 50%) ပေးချေမှုများ — Instructor ဘက်က တောင်းဆိုမှုတွေလည်း ဒီမှာ ဝင်လာပါတယ်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> Payout အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-3">
                <StatCard label="စောင့်ဆိုင်းဆဲ Payout" value={`${pending.length} ခု`} sub={formatKyat(pendingTotal)} icon={Wallet} tone="amber" />
                <StatCard label="ပေးပြီးသော Payout (စုစုပေါင်း)" value={formatKyat(paidTotal)} icon={Wallet} tone="teal" />
                <StatCard label="Payout မှတ်တမ်း စုစုပေါင်း" value={`${items.length} ခု`} icon={Wallet} tone="blue" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>
                    စောင့်ဆိုင်းဆဲ
                </Chip>
                <Chip active={tab === 'paid'} onClick={() => setTab('paid')}>
                    ပေးပြီး
                </Chip>
                <Chip active={tab === 'hold'} onClick={() => setTab('hold')}>
                    ဆိုင်းငံ့ထား
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Payout မှတ်တမ်း မရှိသေးပါ" description="Payout တောင်းဆိုမှု အသစ် ဝင်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((p) => (
                        <LmsCard key={p.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{p.name}</p>
                                    {p.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : p.status === 'hold' ? <Pill tone="rose">ဆိုင်းငံ့ထား</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {p.id} · {p.method} · {p.date}
                                </p>
                            </div>
                            <span className={`text-[.95rem] font-extrabold ${inkCls}`}>{formatKyat(p.amount)}</span>
                            <div className="flex flex-none flex-wrap gap-2">
                                {p.status !== 'paid' && (
                                    <button type="button" className={btnGhostCls} onClick={() => setStatus(p.id, 'paid')}>
                                        <Check className="size-4" /> ပေးချေပြီး မှတ်ရန်
                                    </button>
                                )}
                                {p.status === 'pending' && (
                                    <button type="button" className={btnGhostCls} onClick={() => setStatus(p.id, 'hold')}>
                                        <Pause className="size-4" /> ဆိုင်းငံ့ရန်
                                    </button>
                                )}
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, Download, RotateCcw, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatKyat } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type RefundRow = { id: number; student: string; course: string; amount: number; reason: string; date: string; status: 'pending' | 'approved' | 'rejected' | 'processed' };

// SAMPLE DATA fallback (prototype): Refund model exists (payment-linked) but no
// admin refund controller is wired yet.
const SAMPLE_REFUNDS: RefundRow[] = [
    { id: 1, student: 'Nanda Win', course: 'Git, GitHub & Team Workflow', amount: 25000, reason: 'သင်တန်း ဝယ်ပြီးမှ အလုပ်နဲ့ အချိန် မကိုက်လို့ ဆက်မတက်နိုင်တော့ပါ။', date: 'နိုဝင်ဘာ 21', status: 'pending' },
    { id: 2, student: 'Hein Htet Aung', course: 'MySQL & Database Design', amount: 35000, reason: 'Video တွေ ဖွင့်မရပါ — ဖုန်းမှာ ပြဿနာ ဖြစ်နေပါတယ်။', date: 'နိုဝင်ဘာ 20', status: 'pending' },
    { id: 3, student: 'Phyo Min Khant', course: 'Python for Beginners', amount: 50000, reason: 'မှားယွင်းပြီး ဝယ်မိတာ ဖြစ်ပါတယ်။', date: 'နိုဝင်ဘာ 18', status: 'approved' },
    { id: 4, student: 'Ei Mon Kyaw', course: 'Flutter Mobile Development', amount: 90000, reason: 'သင်တန်း အကြောင်းအရာ မျှော်လင့်ထားသလောက် မဟုတ်ပါ။', date: 'နိုဝင်ဘာ 15', status: 'rejected' },
    { id: 5, student: 'Su Myat Noe', course: 'Pro Plan — လစဉ်', amount: 30000, reason: 'Pro Plan ကို မသုံးဖြစ်တော့ပါ။', date: 'နိုဝင်ဘာ 12', status: 'processed' },
];

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>;
    if (status === 'approved') return <Pill tone="teal">အတည်ပြုပြီး</Pill>;
    if (status === 'processed') return <Pill tone="blue">ငွေပြန်အမ်းပြီး</Pill>;
    return <Pill tone="rose">ပယ်ချပြီး</Pill>;
}

export default function Index({ refunds }: { refunds?: RefundRow[] }) {
    const [items, setItems] = useState<RefundRow[]>(refunds ?? SAMPLE_REFUNDS);
    const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [notice, setNotice] = useState('');

    const pending = items.filter((r) => r.status === 'pending');
    const pendingTotal = pending.reduce((s, r) => s + r.amount, 0);
    const approvedCount = items.filter((r) => r.status === 'approved' || r.status === 'processed').length;
    const rejectedCount = items.filter((r) => r.status === 'rejected').length;
    const list = items.filter((r) => tab === 'all' || r.status === tab || (tab === 'approved' && r.status === 'processed'));

    const setStatus = (id: number, status: RefundRow['status']) => {
        setItems(items.map((r) => (r.id === id ? { ...r, status } : r)));
        setNotice('Refund အခြေအနေ ပြောင်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    return (
        <LmsShell title="Refund စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Refund စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Refund စီမံခန့်ခွဲမှု"
                description="ကျောင်းသားတွေ တောင်းခံတဲ့ refund များကို မူဝါဒနဲ့ ကိုက်ညီမှု စစ်ဆေးပြီး အတည်ပြု / ပယ်ချရန်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> Refund အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="စောင့်ဆိုင်းဆဲ တောင်းခံမှု" value={`${pending.length} ခု`} icon={RotateCcw} tone="amber" />
                <StatCard label="စောင့်ဆိုင်းဆဲ ပမာဏ" value={formatKyat(pendingTotal)} icon={RotateCcw} tone="blue" />
                <StatCard label="အတည်ပြုပြီး (ဒီလ)" value={`${approvedCount} ခု`} icon={Check} tone="teal" />
                <StatCard label="ပယ်ချပြီး" value={`${rejectedCount} ခု`} icon={X} tone="rose" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>
                    စောင့်ဆိုင်းဆဲ
                </Chip>
                <Chip active={tab === 'approved'} onClick={() => setTab('approved')}>
                    အတည်ပြုပြီး
                </Chip>
                <Chip active={tab === 'rejected'} onClick={() => setTab('rejected')}>
                    ပယ်ချပြီး
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အခြေအနေမှာ တောင်းခံမှု မရှိပါ" description="တောင်းခံမှု အသစ် ဝင်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((r) => (
                        <LmsCard key={r.id} className="p-5">
                            <div className="flex flex-wrap items-start gap-3.5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{r.student}</p>
                                        {statusPill(r.status)}
                                    </div>
                                    <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                        {r.course} · {r.date} · {formatKyat(r.amount)}
                                    </p>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{r.reason}</p>
                                </div>
                                {r.status === 'pending' && (
                                    <div className="flex flex-none flex-wrap gap-2">
                                        <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'approved')}>
                                            <Check className="size-4" /> အတည်ပြုရန်
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'rejected')}>
                                            <X className="size-4" /> ပယ်ချရန်
                                        </button>
                                    </div>
                                )}
                                {r.status === 'approved' && (
                                    <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'processed')}>
                                        <RotateCcw className="size-4" /> ငွေပြန်အမ်းပြီး မှတ်ရန်
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

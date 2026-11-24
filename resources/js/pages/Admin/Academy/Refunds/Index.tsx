import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, Download, RotateCcw, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatKyat } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type RefundRow = { id: number; student: string; course: string; amount: number; reason: string; date: string; status: 'pending' | 'approved' | 'rejected' | 'processed' };

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>;
    if (status === 'approved') return <Pill tone="teal">အတည်ပြုပြီး</Pill>;
    if (status === 'processed') return <Pill tone="blue">ငွေပြန်အမ်းပြီး</Pill>;
    return <Pill tone="rose">ပယ်ချပြီး</Pill>;
}

export default function Index({ refunds }: { refunds: RefundRow[] }) {
    const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [notice, setNotice] = useState('');

    const pending = refunds.filter((r) => r.status === 'pending');
    const pendingTotal = pending.reduce((s, r) => s + r.amount, 0);
    const approvedCount = refunds.filter((r) => r.status === 'approved' || r.status === 'processed').length;
    const rejectedCount = refunds.filter((r) => r.status === 'rejected').length;
    const list = refunds.filter((r) => tab === 'all' || r.status === tab || (tab === 'approved' && r.status === 'processed'));

    const approve = (id: number) => {
        router.post(`/admin/academy/refunds/${id}/approve`, {}, { preserveScroll: true, onSuccess: () => setNotice('Refund တောင်းခံမှုကို အတည်ပြုပြီးပါပြီ') });
    };
    const reject = (id: number) => {
        router.post(`/admin/academy/refunds/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => setNotice('Refund တောင်းခံမှုကို ပယ်ချပြီးပါပြီ') });
    };
    const process = (id: number) => {
        router.post(`/admin/academy/refunds/${id}/process`, {}, { preserveScroll: true, onSuccess: () => setNotice('Refund ငွေပြန်အမ်းပြီးအဖြစ် မှတ်သားပြီးပါပြီ') });
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
                                        <button type="button" className={btnGhostCls} onClick={() => approve(r.id)}>
                                            <Check className="size-4" /> အတည်ပြုရန်
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => reject(r.id)}>
                                            <X className="size-4" /> ပယ်ချရန်
                                        </button>
                                    </div>
                                )}
                                {r.status === 'approved' && (
                                    <button type="button" className={btnGhostCls} onClick={() => process(r.id)}>
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

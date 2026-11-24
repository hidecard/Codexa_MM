import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Download, Pause, Plus, Wallet, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatKyat } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { type SamplePayout } from '@/pages/Admin/Academy/_sample';

type PayoutRow = Omit<SamplePayout, 'status'> & { pid: number; status: 'pending' | 'paid' | 'hold' | 'rejected' };
type InstructorOption = { id: number; name: string };

export default function Index({ payouts, instructors }: { payouts: PayoutRow[]; instructors: InstructorOption[] }) {
    const [tab, setTab] = useState<'all' | 'pending' | 'paid' | 'hold'>('all');
    const [notice, setNotice] = useState('');
    const form = useForm({ instructor_id: '', amount: '', method: 'KBZPay', period: '', notes: '' });

    const pending = payouts.filter((p) => p.status === 'pending');
    const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
    const paidTotal = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const list = payouts.filter((p) => tab === 'all' || p.status === tab);

    const approve = (p: PayoutRow) => {
        router.post(`/admin/academy/payouts/${p.pid}/approve`, {}, { preserveScroll: true, onSuccess: () => setNotice(`${p.id} ကို ပေးချေပြီးအဖြစ် မှတ်သားပြီးပါပြီ`) });
    };
    const hold = (p: PayoutRow) => {
        router.post(`/admin/academy/payouts/${p.pid}/hold`, {}, { preserveScroll: true, onSuccess: () => setNotice(`${p.id} ကို ဆိုင်းငံ့ထားပြီးပါပြီ`) });
    };
    const reject = (p: PayoutRow) => {
        router.post(`/admin/academy/payouts/${p.pid}/reject`, {}, { preserveScroll: true, onSuccess: () => setNotice(`${p.id} ကို ပယ်ချပြီးပါပြီ`) });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            instructor_id: Number(data.instructor_id),
            amount: Number(data.amount),
            method: data.method,
            period: data.period === '' ? null : data.period,
            notes: data.notes === '' ? null : data.notes,
        }));
        form.post('/admin/academy/payouts', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setNotice('Payout မှတ်တမ်း ဖန်တီးပြီးပါပြီ');
            },
        });
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
                <StatCard label="Payout မှတ်တမ်း စုစုပေါင်း" value={`${payouts.length} ခု`} icon={Wallet} tone="blue" />
            </div>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <Plus className="size-5" /> Payout အသစ် ဖန်တီးရန်
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div>
                        <label className={labelCls}>ဆရာ</label>
                        <select className={inputCls} value={form.data.instructor_id} onChange={(e) => form.setData('instructor_id', e.target.value)} required>
                            <option value="">ဆရာ ရွေးပါ</option>
                            {instructors.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.instructor_id && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.instructor_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>ပမာဏ (ကျပ်)</label>
                        <input className={inputCls} type="number" min={1} value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} placeholder="100000" required />
                        {form.errors.amount && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.amount}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>ပေးချေမှု နည်းလမ်း</label>
                        <select className={inputCls} value={form.data.method} onChange={(e) => form.setData('method', e.target.value)}>
                            <option>KBZPay</option>
                            <option>WavePay</option>
                            <option>CB Pay</option>
                            <option>Bank Transfer</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>ကာလ (ဥပမာ 2026-11)</label>
                        <input className={inputCls} value={form.data.period} onChange={(e) => form.setData('period', e.target.value)} placeholder="2026-11" />
                    </div>
                    <div className="sm:col-span-4">
                        <button type="submit" className={btnAccentCls} disabled={form.processing}>
                            Payout ဖန်တီးရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

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
                                    {p.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : p.status === 'hold' ? <Pill tone="rose">ဆိုင်းငံ့ထား</Pill> : p.status === 'rejected' ? <Pill tone="rose">ပယ်ချပြီး</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {p.id} · {p.method} · {p.date}
                                </p>
                            </div>
                            <span className={`text-[.95rem] font-extrabold ${inkCls}`}>{formatKyat(p.amount)}</span>
                            <div className="flex flex-none flex-wrap gap-2">
                                {p.status !== 'paid' && p.status !== 'rejected' && (
                                    <button type="button" className={btnGhostCls} onClick={() => approve(p)}>
                                        <Check className="size-4" /> ပေးချေပြီး မှတ်ရန်
                                    </button>
                                )}
                                {p.status === 'pending' && (
                                    <>
                                        <button type="button" className={btnGhostCls} onClick={() => hold(p)}>
                                            <Pause className="size-4" /> ဆိုင်းငံ့ရန်
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => reject(p)}>
                                            <X className="size-4" /> ပယ်ချရန်
                                        </button>
                                    </>
                                )}
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

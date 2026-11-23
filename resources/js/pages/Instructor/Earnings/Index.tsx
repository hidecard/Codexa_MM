import { type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Download, Users, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatDate, formatKyat, formatNumber } from '@/lib/format';
import { PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type PendingPayout = { id: number; amount: number; method: string; period?: string | null; created_at?: string | null };
type CourseEarning = { id: number; title: string; price: number; students: number; revenue: number; share: number };
type MonthHistory = { label: string; sales: number; total: number; share: number; status: string };
type PayoutRow = { id: string; amount: number; method: string; date: string | null; status: string };
type Props = {
    availableBalance?: number;
    pendingPayout?: PendingPayout | null;
    stats: { totalRevenue: number; totalShare: number; thisMonthShare: number; totalStudents: number; coursesCount: number };
    courseEarnings: CourseEarning[];
    monthlyHistory: MonthHistory[];
    payouts: PayoutRow[];
    flash?: { success?: string | null };
};

const PAYOUT_METHODS = [
    { key: 'kbzpay', label: 'KBZPay' },
    { key: 'wavepay', label: 'WavePay' },
    { key: 'cbpay', label: 'CB Pay' },
    { key: 'bank', label: 'Bank Transfer' },
] as const;

export default function Index({ availableBalance = 0, pendingPayout = null, stats, courseEarnings, monthlyHistory, payouts }: Props) {
    const { flash } = usePage<Props>().props;
    const maxRev = Math.max(...courseEarnings.map((c) => c.revenue), 1);
    const months = [...monthlyHistory].reverse();

    const { data, setData, post, processing, errors } = useForm({ amount: availableBalance, method: 'kbzpay' as (typeof PAYOUT_METHODS)[number]['key'] });

    const requestPayout = (e: FormEvent) => {
        e.preventDefault();
        if (data.amount <= 0 || pendingPayout) return;
        post('/instructor/payouts');
    };

    return (
        <LmsShell title="ဆရာ ဝင်ငွေ & Payout" nav="instructor">
            <Head title="ဆရာ ဝင်ငွေ & Payout" />
            <PageIntro
                title="ဆရာ ဝင်ငွေ & Payout"
                description="သင်တန်း ရောင်းရငွေရဲ့ 50% ကို ခွဲဝေငွေ အဖြစ် ရရှိပါတယ် — လစဉ် အသေးစိတ်နဲ့ ထုတ်ယူမှု အခြေအနေကို ဒီမှာ ကြည့်နိုင်ပါတယ်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> ဝင်ငွေ အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="သင်တန်း ရောင်းရငွေ စုစုပေါင်း" value={formatKyat(stats.totalRevenue)} icon={BookOpen} tone="blue" />
                <StatCard label="ခွဲဝေငွေ စုစုပေါင်း" value={formatKyat(stats.totalShare)} sub="50%" icon={Wallet} tone="teal" />
                <StatCard label="ဒီလ ခွဲဝေငွေ" value={formatKyat(stats.thisMonthShare)} icon={Wallet} tone="amber" />
                <StatCard label={`ကျောင်းသား စုစုပေါင်း · သင်တန်း ${stats.coursesCount} ခု`} value={`${formatNumber(stats.totalStudents)} ဦး`} icon={Users} tone="purple" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-6 xl:col-span-2">
                    <SectionCard title="သင်တန်းအလိုက် ဝင်ငွေ ခွဲဝေမှု">
                        {courseEarnings.length === 0 ? (
                            <p className={`text-sm ${mutedCls}`}>သင်တန်း မရှိသေးပါ။</p>
                        ) : (
                            <div className="space-y-5">
                                {courseEarnings.map((c) => (
                                    <div key={c.id}>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <Link href={`/instructor/earnings/${c.id}`} className={`text-[.9rem] font-bold hover:underline ${inkCls}`}>
                                                {c.title}
                                            </Link>
                                            <span className={`text-[.8rem] font-bold ${mutedCls}`}>
                                                ဝင်ငွေ {formatKyat(c.revenue)} · ခွဲဝေ {formatKyat(c.share)}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <ProgressBar value={Math.round((c.revenue / maxRev) * 100)} />
                                        </div>
                                        <p className={`mt-1.5 text-[.76rem] ${mutedCls}`}>
                                            ကျောင်းသား {formatNumber(c.students)} ဦး · ဈေးနှုန်း {formatKyat(c.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="လစဉ် မှတ်တမ်း">
                        <div>
                            {months.map((m) => (
                                <div key={m.label} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                    <div className="min-w-0 flex-1 basis-[130px]">
                                        <p className={`text-[.88rem] font-bold ${inkCls}`}>{m.label}</p>
                                        <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                            ရောင်းရမှု {m.sales} ခု · စုစုပေါင်း {formatKyat(m.total)}
                                        </p>
                                    </div>
                                    <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(m.share)}</span>
                                    {m.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Payout မှတ်တမ်း">
                        {payouts.length === 0 ? (
                            <p className={`text-sm ${mutedCls}`}>Payout မှတ်တမ်း မရှိသေးပါ။</p>
                        ) : (
                            <div>
                                {payouts.map((p) => (
                                    <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[.88rem] font-bold ${inkCls}`}>
                                                {p.id} · {p.method}
                                            </p>
                                            <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>{formatDate(p.date)}</p>
                                        </div>
                                        <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(p.amount)}</span>
                                        {p.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : p.status === 'rejected' ? <Pill tone="rose">ပယ်ချပြီး</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="Payout ထုတ်ယူရန်">
                        <p className={`mt-3 text-[1.3rem] font-extrabold leading-none ${inkCls}`}>
                            {formatKyat(availableBalance)}
                        </p>
                        <p className={`mt-1.5 text-[.8rem] font-semibold ${mutedCls}`}>ထုတ်ယူနိုင်သော ခွဲဝေငွေ (အတည်ပြုပြီး ရောင်းရငွေ၏ 50%)</p>
                        {pendingPayout ? (
                            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-[#12234a]">
                                <p className={`text-[.86rem] font-bold ${inkCls}`}>တောင်းဆိုမှု ပို့ထားပြီး — {formatKyat(pendingPayout.amount)}</p>
                                <p className={`mt-1 text-[.8rem] leading-relaxed ${mutedCls}`}>
                                    {formatDate(pendingPayout.created_at)} တွင် တောင်းဆိုထားသည်။ Admin စစ်ဆေးနေပါတယ်။ အတည်ပြုရင် ဒီ box မှာ အခြေအနေ ပြောင်းသွားပါမယ်။
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={requestPayout} className="mt-4 space-y-3">
                                <div>
                                    <label className={`mb-1.5 block text-[.8rem] font-bold ${inkCls}`}>ထုတ်ယူမည့် ငွေ (ကျပ်)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={availableBalance}
                                        value={data.amount}
                                        onChange={(e) => setData('amount', Number(e.target.value))}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                    />
                                    {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className={`mb-1.5 block text-[.8rem] font-bold ${inkCls}`}>ထုတ်ယူမှု နည်းလမ်း</label>
                                    <select
                                        value={data.method}
                                        onChange={(e) => setData('method', e.target.value as (typeof PAYOUT_METHODS)[number]['key'])}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                    >
                                        {PAYOUT_METHODS.map((m) => (
                                            <option key={m.key} value={m.key}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.method && <p className="mt-1 text-xs text-rose-600">{errors.method}</p>}
                                </div>
                                <button type="submit" className={`${btnAccentCls} w-full py-3 text-[.95rem]`} disabled={processing || availableBalance <= 0}>
                                    Payout တောင်းဆိုရန်
                                </button>
                                {availableBalance <= 0 && <p className={`text-[.78rem] ${mutedCls}`}>ထုတ်ယူနိုင်သော ခွဲဝေငွေ မရှိသေးပါ — ငွေပေးချေမှု အတည်ပြုပြီးမှ ခွဲဝေငွေ ရရှိပါမယ်။</p>}
                            </form>
                        )}
                        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#18264a]">
                            <p className={`text-[.82rem] font-bold ${inkCls}`}>ထုတ်ယူမှု နည်းလမ်း</p>
                            <p className={`mt-1 text-[.78rem] ${mutedCls}`}>
                                Payout တောင်းဆိုမှုတွေကို Admin ဘက် "ဆရာ Payout စီမံရန်" မှာ အတည်ပြုပေးပါတယ်။
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </LmsShell>
    );
}

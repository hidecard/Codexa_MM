import { Head } from '@inertiajs/react';
import { BookOpen, Download, TrendingUp, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { BarChart, PageIntro, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type TopCourse = { id: number; title: string; instructor: string; students: number; rating: number; price: number; revenue: number };
type Share = { name: string; pct: number; amount: number; col: string };

type Props = {
    stats: {
        totalRevenue: number;
        revenueChange: number | null;
        totalEnrollments: number;
        enrollChange: number | null;
        activeStudents: number;
        totalStudents: number;
        avgCompletion: number;
    };
    monthlyRevenue: { label: string; value: number }[];
    monthlyEnrollments: { label: string; value: number }[];
    categoryShare: Share[];
    paymentMix: Share[];
    topCourses: TopCourse[];
    funnel: { label: string; value: number }[];
};

export default function Index({ stats, monthlyRevenue, monthlyEnrollments, categoryShare, paymentMix, topCourses, funnel }: Props) {
    const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));
    const revenueMax = Math.max(1, ...monthlyRevenue.map((m) => m.value));
    const enrollMax = Math.max(1, ...monthlyEnrollments.map((m) => m.value));
    const changeLabel = (v: number | null) => (v === null ? 'ယခင် ကာလ အချက်အလက် မရှိ' : `${v >= 0 ? '▲' : '▼'} ${Math.abs(v)}% · ပြီးခဲ့တဲ့ ကာလနဲ့ ယှဉ်`);
    const completionRate = funnel.length > 0 && funnel[0].value > 0 ? ((funnel[funnel.length - 2]?.value ?? 0) / funnel[0].value) * 100 : 0;

    return (
        <LmsShell title="Reports & Analytics" nav="admin">
            <Head title="Reports & Analytics" />
            <PageIntro
                eyebrow="ADMIN"
                title="Reports & Analytics"
                description="ဝင်ငွေ၊ စာရင်းသွင်းမှုနဲ့ သင်ယူမှု တိုးတက်မှုကို အသေးစိတ် ခွဲခြမ်းစိတ်ဖြာရန် — နောက်ဆုံး 6 လ အချက်အလက်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> CSV ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="စုစုပေါင်း ဝင်ငွေ (6 လ)" value={formatKyat(stats.totalRevenue)} sub={changeLabel(stats.revenueChange)} icon={TrendingUp} tone="teal" />
                <StatCard label="စာရင်းသွင်းမှု အသစ် (6 လ)" value={formatNumber(stats.totalEnrollments)} sub={changeLabel(stats.enrollChange)} icon={Users} tone="blue" />
                <StatCard label="တက်ကြွသော ကျောင်းသား" value={`${formatNumber(stats.activeStudents)} / ${formatNumber(stats.totalStudents)}`} sub={stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active` : 'ကျောင်းသား မရှိသေးပါ'} icon={Users} tone="purple" />
                <StatCard label="ပျမ်းမျှ ပြီးစီးနှုန်း" value={`${stats.avgCompletion}%`} sub="သင်ခန်းစာ ပြီးစီးမှုအပေါ် တွက်ချက်ထားသည်" icon={BookOpen} tone="amber" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="လစဉ် ဝင်ငွေ (သိန်းကျပ်)">
                    <BarChart data={monthlyRevenue} max={Math.ceil(revenueMax)} />
                </SectionCard>
                <SectionCard title="စာရင်းသွင်းမှု Trend (လစဉ် အရေအတွက်)">
                    <BarChart data={monthlyEnrollments} max={Math.ceil(enrollMax)} unit="ဦး" />
                </SectionCard>
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="Category အလိုက် ဝင်ငွေ ဝေစု">
                    {categoryShare.length === 0 ? (
                        <p className={`text-sm ${mutedCls}`}>အတည်ပြုပြီး ဝင်ငွေ မရှိသေးပါ။</p>
                    ) : (
                        <div className="space-y-3">
                            {categoryShare.map((c) => (
                                <div key={c.name}>
                                    <div className="flex justify-between text-[.82rem] font-bold">
                                        <span className={inkCls}>{c.name}</span>
                                        <span className={mutedCls}>
                                            {c.pct}% · {formatKyat(c.amount)}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                        <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.col }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
                <SectionCard title="ပေးချေမှု နည်းလမ်းအလိုက် ဝင်ငွေ">
                    {paymentMix.length === 0 ? (
                        <p className={`text-sm ${mutedCls}`}>အတည်ပြုပြီး ဝင်ငွေ မရှိသေးပါ။</p>
                    ) : (
                        <div className="space-y-3">
                            {paymentMix.map((m) => (
                                <div key={m.name}>
                                    <div className="flex justify-between text-[.82rem] font-bold">
                                        <span className={inkCls}>{m.name}</span>
                                        <span className={mutedCls}>
                                            {m.pct}% · {formatKyat(m.amount)}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                        <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.col }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="အများဆုံး သင်တန်းများ">
                    {topCourses.length === 0 ? (
                        <p className={`text-sm ${mutedCls}`}>သင်တန်း မရှိသေးပါ။</p>
                    ) : (
                        <div>
                            {topCourses.map((c, i) => (
                                <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                    <span className={`w-6 flex-none text-center text-sm font-extrabold ${mutedCls}`}>{i + 1}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-[.9rem] font-bold ${inkCls}`}>{c.title}</p>
                                        <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>ကျောင်းသား {formatNumber(c.students)} ဦး · Rating {c.rating}</p>
                                    </div>
                                    <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(c.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
                <SectionCard title="သင်ယူသူ ခရီးစဉ် (Funnel)">
                    <div className="space-y-3">
                        {funnel.map((f) => (
                            <div key={f.label}>
                                <div className="flex justify-between text-[.82rem] font-bold">
                                    <span className={inkCls}>{f.label}</span>
                                    <span className={mutedCls}>{formatNumber(f.value)}</span>
                                </div>
                                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                    <div className="h-full rounded-full bg-teal-600 dark:bg-teal-400" style={{ width: `${Math.round((f.value / maxFunnel) * 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className={`mt-4 text-[.8rem] ${mutedCls}`}>
                        သင်တန်း ပြီးစီးမှုနှုန်း — စာရင်းသွင်းသူမှ ပြီးဆုံးသူအထိ {completionRate.toFixed(1)}%
                    </p>
                </SectionCard>
            </div>
        </LmsShell>
    );
}

import { Head } from '@inertiajs/react';
import { BookOpen, Download, TrendingUp, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { BarChart, PageIntro, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES, SAMPLE_MONTHLY_REVENUE, SAMPLE_PAY_MIX } from '@/pages/Admin/Academy/_sample';

// SAMPLE DATA fallback (prototype): /admin/reports is a closure route with no props yet.
const ENROLL_TREND = [
    { label: 'ဇွန်', value: 312 },
    { label: 'ဇူလိုင်', value: 386 },
    { label: 'ဩဂုတ်', value: 402 },
    { label: 'စက်တင်ဘာ', value: 455 },
    { label: 'အောက်တိုဘာ', value: 521 },
    { label: 'နိုဝင်ဘာ', value: 588 },
];

const CATEGORY_SHARE = [
    { name: 'Web Development', pct: 42, col: '#0ea892' },
    { name: 'Programming', pct: 24, col: '#2563eb' },
    { name: 'Backend', pct: 18, col: '#7c3aed' },
    { name: 'Design', pct: 9, col: '#ec4899' },
    { name: 'Mobile', pct: 7, col: '#f59e0b' },
];

const FUNNEL = [
    { label: 'Landing page ဝင်ရောက်သူ', value: 48200 },
    { label: 'သင်တန်း ကြည့်ရှုသူ', value: 18400 },
    { label: 'Cart ထည့်သူ', value: 5200 },
    { label: 'ဝယ်ယူပြီး စာရင်းသွင်းသူ', value: 2664 },
    { label: 'သင်တန်း ပြီးဆုံးသူ', value: 1812 },
];

export default function Index() {
    const totalRevenue = SAMPLE_MONTHLY_REVENUE.reduce((s, m) => s + m.value, 0);
    const totalEnroll = ENROLL_TREND.reduce((s, m) => s + m.value, 0);
    const topCourses = [...SAMPLE_COURSES].sort((a, b) => b.price * b.students - a.price * a.students).slice(0, 5);
    const maxFunnel = FUNNEL[0].value;

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
                <StatCard label="စုစုပေါင်း ဝင်ငွေ (6 လ)" value={formatKyat(Math.round(totalRevenue * 100000))} sub="▲ 17% · ပြီးခဲ့တဲ့ ကာလနဲ့ ယှဉ်" icon={TrendingUp} tone="teal" />
                <StatCard label="စာရင်းသွင်းမှု အသစ် (6 လ)" value={formatNumber(totalEnroll)} sub="▲ 12% တက်ကြွသော ကျောင်းသား" icon={Users} tone="blue" />
                <StatCard label="တက်ကြွသော ကျောင်းသား" value="3,214 / 4,280" sub="75% active" icon={Users} tone="purple" />
                <StatCard label="ပျမ်းမျှ ပြီးစီးနှုန်း" value="68%" sub="▼ 2% · Live class နဲ့ ပြန်တက်ရန်" icon={BookOpen} tone="amber" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="လစဉ် ဝင်ငွေ (သိန်းကျပ်)">
                    <BarChart data={SAMPLE_MONTHLY_REVENUE} max={14} />
                </SectionCard>
                <SectionCard title="စာရင်းသွင်းမှု Trend (လစဉ် အရေအတွက်)">
                    <BarChart data={ENROLL_TREND} max={600} unit="ဦး" />
                </SectionCard>
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="Category အလိုက် ဝင်ငွေ ဝေစု">
                    <div className="space-y-3">
                        {CATEGORY_SHARE.map((c) => (
                            <div key={c.name}>
                                <div className="flex justify-between text-[.82rem] font-bold">
                                    <span className={inkCls}>{c.name}</span>
                                    <span className={mutedCls}>{c.pct}%</span>
                                </div>
                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.col }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="ပေးချေမှု နည်းလမ်းအလိုက် ဝင်ငွေ">
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
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="အများဆုံး သင်တန်းများ">
                    <div>
                        {topCourses.map((c, i) => (
                            <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                <span className={`w-6 flex-none text-center text-sm font-extrabold ${mutedCls}`}>{i + 1}</span>
                                <div className="min-w-0 flex-1">
                                    <p className={`truncate text-[.9rem] font-bold ${inkCls}`}>{c.title}</p>
                                    <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>ကျောင်းသား {formatNumber(c.students)} ဦး · Rating {c.rating}</p>
                                </div>
                                <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(c.price * c.students)}</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="သင်ယူသူ ခရီးစဉ် (Funnel)">
                    <div className="space-y-3">
                        {FUNNEL.map((f) => (
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
                        ဝယ်ယူမှု ပြောင်းလဲမှုနှုန်း — Landing မှ ဝယ်ယူအထိ {((FUNNEL[3].value / FUNNEL[0].value) * 100).toFixed(1)}%
                    </p>
                </SectionCard>
            </div>
        </LmsShell>
    );
}

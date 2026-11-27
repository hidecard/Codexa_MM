import { Head, Link } from '@inertiajs/react';
import { BookOpen, Download, Plus, Star, TrendingUp, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { BarChart, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type TopCourse = { id: number; title: string; instructor: string; students: number; rating: number; price: number; revenue: number };
type RecentPayment = { id: string; n: string; item: string; method: string; amount: number; date: string; status: string };
type PayMix = { name: string; pct: number; amount: number; col: string };
type Task = { title: string; desc: string; count: number; href: string };

type Props = {
    stats: {
        monthRevenue: number;
        monthRevenueChange: number | null;
        totalStudents: number;
        newStudentsWeek: number;
        totalCourses: number;
        publishedCourses: number;
        draftCourses: number;
        reviewCourses: number;
        avgCompletion: number;
        activeToday: number;
    };
    monthlyRevenue: { label: string; value: number }[];
    monthlyRevenueTotal: number;
    topCourses: TopCourse[];
    recentPayments: RecentPayment[];
    paymentMix: PayMix[];
    tasks: Task[];
};

const QUICK_LINKS = [
    { label: 'သင်တန်း စီမံရန်', href: '/admin/academy/courses' },
    { label: 'ကျောင်းသား စီမံရန်', href: '/admin/academy/students' },
    { label: 'ငွေပေးချေမှုများ', href: '/admin/academy/payments' },
    { label: 'ဆရာ စီမံရန်', href: '/admin/academy/instructors' },
    { label: 'Review စီမံရန်', href: '/admin/academy/reviews' },
    { label: 'Coupon စီမံရန်', href: '/admin/academy/coupons' },
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'ကြေညာချက် စီမံရန်', href: '/admin/academy/announcements' },
    { label: 'Support Tickets', href: '/admin/academy/tickets' },
    { label: 'Quiz & Assignment', href: '/admin/academy/quizzes' },
    { label: 'သင်ရိုး တည်ဆောက်ရန်', href: '/admin/academy/curriculum' },
    { label: 'Refund စီမံရန်', href: '/admin/academy/refunds' },
    { label: 'Staff & Roles', href: '/admin/academy/staff' },
    { label: 'Platform Settings', href: '/admin/settings' },
    { label: 'Certificate Template', href: '/admin/academy/cert-templates' },
];

const MYANMAR_MONTHS = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];

export default function Dashboard({ stats, monthlyRevenue, monthlyRevenueTotal, topCourses, recentPayments, paymentMix, tasks }: Props) {
    const now = new Date();
    const monthLabel = `${MYANMAR_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const chartMax = Math.max(1, ...monthlyRevenue.map((m) => m.value));
    const revenueChange = stats.monthRevenueChange === null ? 'ယခင်လ အချက်အလက် မရှိ' : `${stats.monthRevenueChange >= 0 ? '▲' : '▼'} ${Math.abs(stats.monthRevenueChange)}%`;

    return (
        <LmsShell title="Admin Dashboard" nav="admin">
            <Head title="Admin Dashboard" />
            <PageIntro
                eyebrow="ADMIN"
                title="Admin Dashboard"
                description={`Codexa MM platform တစ်ခုလုံးရဲ့ ဝင်ငွေ၊ ကျောင်းသားနဲ့ သင်တန်း အခြေအနေကို တစ်နေရာတည်းကနေ ကြည့်ရှု စီမံနိုင်ပါတယ် · ${monthLabel}`}
                actions={
                    <>
                        <button type="button" className={btnGhostCls}>
                            <Download className="size-4" /> အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                        </button>
                        <Link href="/admin/academy/courses" className={btnAccentCls}>
                            <Plus className="size-4" /> သင်တန်း အသစ် ထည့်ရန်
                        </Link>
                    </>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="ဒီလ ဝင်ငွေ · ပြီးခဲ့တဲ့လထက်" value={formatKyat(stats.monthRevenue)} sub={revenueChange} icon={TrendingUp} tone="teal" />
                <StatCard label="ကျောင်းသား စုစုပေါင်း · ဒီအပတ် အသစ်" value={`${formatNumber(stats.totalStudents)} ဦး`} sub={`▲ ${stats.newStudentsWeek} ဦး`} icon={Users} tone="blue" />
                <StatCard label={`သင်တန်း စုစုပေါင်း · Published ${stats.publishedCourses} · Draft ${stats.draftCourses}`} value={`${stats.totalCourses} ခု`} sub={`${stats.reviewCourses} review`} icon={BookOpen} tone="purple" />
                <StatCard label={`ပျမ်းမျှ သင်တန်း ပြီးစီးနှုန်း · ယနေ့ active ${stats.activeToday} ဦး`} value={`${stats.avgCompletion}%`} sub="သင်ခန်းစာ ပြီးစီးမှုအပေါ် တွက်ချက်ထားသည်" icon={Star} tone="amber" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-6 xl:col-span-2">
                    <SectionCard title="လစဉ် ဝင်ငွေ (ကျပ် သိန်းပေါင်း)">
                        <p className={`text-[.83rem] ${mutedCls}`}>နောက်ဆုံး ၆ လ — စုစုပေါင်း {formatKyat(monthlyRevenueTotal)}</p>
                        <BarChart data={monthlyRevenue} max={Math.ceil(chartMax)} />
                    </SectionCard>

                    <SectionCard
                        title="ဝင်ငွေ အများဆုံး သင်တန်းများ"
                        action={
                            <Link href="/admin/academy/courses" className={btnGhostCls}>
                                သင်တန်း အားလုံး စီမံရန်
                            </Link>
                        }
                    >
                        {topCourses.length === 0 ? (
                            <p className={`text-sm ${mutedCls}`}>သင်တန်း မရှိသေးပါ။</p>
                        ) : (
                            <div>
                                {topCourses.map((c, i) => (
                                    <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                        <span className={`w-6 flex-none text-center text-sm font-extrabold ${mutedCls}`}>{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate text-[.9rem] font-bold ${inkCls}`}>{c.title}</p>
                                            <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                                {c.instructor} · ကျောင်းသား {formatNumber(c.students)} ဦး · Rating {c.rating}
                                            </p>
                                        </div>
                                        <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(c.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="လတ်တလော စာရင်းသွင်းမှုများ"
                        action={
                            <Link href="/admin/academy/payments" className={btnGhostCls}>
                                ငွေပေးချေမှု အားလုံး ကြည့်ရန်
                            </Link>
                        }
                    >
                        {recentPayments.length === 0 ? (
                            <p className={`text-sm ${mutedCls}`}>ငွေပေးချေမှု မရှိသေးပါ။</p>
                        ) : (
                            <div>
                                {recentPayments.map((t) => (
                                    <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[.9rem] font-bold ${inkCls}`}>{t.n}</p>
                                            <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                                {t.item} · {t.method} · {t.date}
                                            </p>
                                        </div>
                                        <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(t.amount)}</span>
                                        {t.status === 'success' ? <Pill tone="teal">ပေးချေပြီး</Pill> : t.status === 'pending' ? <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill> : t.status === 'refunded' ? <Pill tone="rose">ငွေပြန်အမ်းပြီး</Pill> : <Pill tone="rose">ပယ်ချပြီး</Pill>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="လုပ်ဆောင်ရန် ကျန်နေသည်များ">
                        <div className="space-y-2">
                            {tasks.map((t) => (
                                <Link key={t.title} href={t.href} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 transition hover:bg-slate-100 dark:bg-[#12234a] dark:hover:bg-[#18264a]">
                                    <span className="grid size-8 flex-none place-items-center rounded-full bg-amber-500/15 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                                        {t.count}
                                    </span>
                                    <span className="min-w-0">
                                        <span className={`block text-[.86rem] font-bold ${inkCls}`}>{t.title}</span>
                                        <span className={`block text-[.76rem] ${mutedCls}`}>{t.desc}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="ငွေပေးချေမှု နည်းလမ်းအလိုက် ဝင်ငွေ">
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

                    <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>Admin အမြန် လင့်ခ်များ</h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                    {QUICK_LINKS.map((l) => (
                        <Link key={l.href} href={l.href} className={btnGhostCls}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </LmsCard>

                </div>
            </div>
        </LmsShell>
    );
}

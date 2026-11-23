import { Head, Link } from '@inertiajs/react';
import { BookOpen, Download, Plus, Star, TrendingUp, Users, Video } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { BarChart, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES, SAMPLE_LIVE, SAMPLE_MONTHLY_REVENUE, SAMPLE_PAY_MIX, SAMPLE_TXNS } from '@/pages/Admin/Academy/_sample';

// SAMPLE DATA fallback (prototype): /admin/dashboard is a closure route with no
// props yet. A future Admin Dashboard controller can supply real stats.
const QUICK_LINKS = [
    { label: 'သင်တန်း စီမံရန်', href: '/admin/academy/courses' },
    { label: 'ကျောင်းသား စီမံရန်', href: '/admin/academy/students' },
    { label: 'ငွေပေးချေမှုများ', href: '/admin/academy/payments' },
    { label: 'ဆရာ စီမံရန်', href: '/admin/academy/instructors' },
    { label: 'Live စီမံရန်', href: '/admin/academy/live-classes' },
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

const TASKS = [
    { title: 'Bank transfer အတည်ပြုရန်', desc: 'စောင့်ဆိုင်းနေသော ပေးချေမှု 2 ခု', count: 2, href: '/admin/academy/payments' },
    { title: 'သင်တန်း review လုပ်ရန်', desc: 'Data Science with Python · Advanced React', count: 2, href: '/admin/academy/courses' },
    { title: 'Assignment အမှတ်ပေးရန်', desc: 'စစ်ဆေးရန် စောင့်နေသော တင်သွင်းမှု 18 ခု', count: 18, href: '/admin/academy/assignments' },
    { title: 'Support ticket ဖြေကြားရန်', desc: 'မဖြေရသေးသော ticket 3 ခု ရှိပါတယ်', count: 3, href: '/admin/academy/tickets' },
];

export default function Dashboard() {
    const topCourses = [...SAMPLE_COURSES].sort((a, b) => b.price * b.students - a.price * a.students).slice(0, 5);
    const liveToday = SAMPLE_LIVE[0];

    return (
        <LmsShell title="Admin Dashboard" nav="admin">
            <Head title="Admin Dashboard" />
            <PageIntro
                eyebrow="ADMIN"
                title="Admin Dashboard"
                description="Codexa MM platform တစ်ခုလုံးရဲ့ ဝင်ငွေ၊ ကျောင်းသားနဲ့ သင်တန်း အခြေအနေကို တစ်နေရာတည်းကနေ ကြည့်ရှု စီမံနိုင်ပါတယ် · နိုဝင်ဘာ 2026"
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
                <StatCard label="ဒီလ ဝင်ငွေ · ပြီးခဲ့တဲ့လထက် ပိုများ" value={formatKyat(12450000)} sub="▲ 18.2%" icon={TrendingUp} tone="teal" />
                <StatCard label="ကျောင်းသား စုစုပေါင်း · ဒီအပတ် အသစ် 124 ဦး" value={`${formatNumber(4280)} ဦး`} sub="▲ 124 ဦး" icon={Users} tone="blue" />
                <StatCard label="သင်တန်း စုစုပေါင်း · Published 10 · Draft 2" value="12 ခု" sub="2 review" icon={BookOpen} tone="purple" />
                <StatCard label="ပျမ်းမျှ သင်တန်း ပြီးစီးနှုန်း · ယနေ့ active 312 ဦး" value="68%" sub="▲ 4%" icon={Star} tone="amber" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-6 xl:col-span-2">
                    <SectionCard title="လစဉ် ဝင်ငွေ (ကျပ် သိန်းပေါင်း)">
                        <p className={`text-[.83rem] ${mutedCls}`}>2026 ခုနှစ် · ဇွန်မှ နိုဝင်ဘာအထိ — နိုဝင်ဘာမှာ အမြင့်ဆုံး ဖြစ်ပါတယ် · စုစုပေါင်း 58.9 သိန်း</p>
                        <BarChart data={SAMPLE_MONTHLY_REVENUE} max={14} />
                    </SectionCard>

                    <SectionCard
                        title="ဝင်ငွေ အများဆုံး သင်တန်းများ"
                        action={
                            <Link href="/admin/academy/courses" className={btnGhostCls}>
                                သင်တန်း အားလုံး စီမံရန်
                            </Link>
                        }
                    >
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
                                    <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(c.price * c.students)}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="လတ်တလော စာရင်းသွင်းမှုများ"
                        action={
                            <Link href="/admin/academy/payments" className={btnGhostCls}>
                                ငွေပေးချေမှု အားလုံး ကြည့်ရန်
                            </Link>
                        }
                    >
                        <div>
                            {SAMPLE_TXNS.slice(0, 4).map((t) => (
                                <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[.9rem] font-bold ${inkCls}`}>{t.n}</p>
                                        <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                            {t.item} · {t.method} · {t.date}
                                        </p>
                                    </div>
                                    <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(t.amount)}</span>
                                    {t.status === 'success' ? <Pill tone="teal">ပေးချေပြီး</Pill> : t.status === 'pending' ? <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill> : <Pill tone="rose">ငွေပြန်အမ်းပြီး</Pill>}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="လုပ်ဆောင်ရန် ကျန်နေသည်များ">
                        <div className="space-y-2">
                            {TASKS.map((t) => (
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

                    <LmsCard className="p-5">
                        <div className="flex items-center gap-2">
                            <Video className="size-4 text-rose-600" />
                            <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>ယနေ့ · LIVE CLASS</h2>
                        </div>
                        <p className={`mt-2 text-[.9rem] font-bold ${inkCls}`}>{liveToday.title}</p>
                        <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                            ဆရာ {liveToday.instructor} · {liveToday.time} · စာရင်းပေးထားသူ {liveToday.joined} ဦး
                        </p>
                        <Link href="/admin/academy/live-classes" className={`${btnGhostCls} mt-4 w-full`}>
                            Session ကြည့်ရန်
                        </Link>
                    </LmsCard>
                </div>
            </div>

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
        </LmsShell>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, MessageCircleQuestion, Star, Users, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatDate, formatKyat, formatNumber } from '@/lib/format';
import { Avatar, BarChart, LmsCard, PageIntro, Stars, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Stats = {
    courses: number;
    publishedCourses: number;
    draftCourses: number;
    students: number;
    newStudents: number;
    shareTotal: number;
    avgRating: number;
    reviewsTotal: number;
};

type Review = { id: number; name: string; init: string; col: string; stars: number; date: string | null; course: string; text: string };
type Question = { id: number; q: string; student: string; lesson: string; time: string | null };

type Props = {
    stats: Stats;
    monthlyShare: { label: string; value: number }[];
    recentReviews: Review[];
    unansweredQuestions: Question[];
    unansweredCount: number;
};

export default function Dashboard({ stats, monthlyShare, recentReviews, unansweredQuestions, unansweredCount }: Props) {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    const name = auth?.user?.name ?? '';
    const shareMax = Math.max(1, ...monthlyShare.map((m) => m.value));

    return (
        <LmsShell title="Instructor Dashboard" nav="instructor">
            <Head title="Instructor Dashboard" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="Instructor Dashboard"
                description={`မင်္ဂလာပါ ဆရာ ${name} — သင့်သင်တန်းများ၊ ကျောင်းသားများနဲ့ ဝင်ငွေကို ဒီ workspace ကနေ စီမံနိုင်ပါတယ်`}
                actions={
                    <>
                        <Link href="/instructor/earnings" className={btnGhostCls}>
                            <Wallet className="size-4" /> ဝင်ငွေ ကြည့်ရန်
                        </Link>
                        <Link href="/instructor/courses/create" className={btnAccentCls}>
                            + သင်တန်း အသစ် ဖန်တီးရန်
                        </Link>
                    </>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    label={`ကိုယ်ပိုင် သင်တန်း · Published ${stats.publishedCourses} ခု`}
                    value={`${formatNumber(stats.courses)} ခု`}
                    sub={`${stats.draftCourses} draft`}
                    icon={BookOpen}
                    tone="purple"
                />
                <StatCard
                    label="သင်တန်း တက်ရောက်သူ စုစုပေါင်း"
                    value={`${formatNumber(stats.students)} ဦး`}
                    sub={`▲ ${formatNumber(stats.newStudents)} ဦး · ဒီအပတ် အသစ်`}
                    icon={Users}
                    tone="blue"
                />
                <StatCard
                    label="ခွဲဝေငွေ စုစုပေါင်း (50%)"
                    value={formatKyat(stats.shareTotal)}
                    sub="အတည်ပြုပြီး ရောင်းရငွေအပေါ် တွက်ချက်ထားသည်"
                    icon={Wallet}
                    tone="teal"
                />
                <StatCard
                    label={`ပျမ်းမျှ Rating · Review ${formatNumber(stats.reviewsTotal)} ခု`}
                    value={stats.avgRating.toFixed(1)}
                    sub={`${unansweredCount} မေးခွန်း`}
                    icon={Star}
                    tone="amber"
                />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-6 xl:col-span-2">
                    <SectionCard
                        title="လစဉ် ခွဲဝေငွေ (ကျပ် သိန်းပေါင်း)"
                        action={
                            <Link href="/instructor/earnings" className={btnGhostCls}>
                                အသေးစိတ်
                            </Link>
                        }
                    >
                        <p className={`text-[.83rem] ${mutedCls}`}>သင်တန်း ဝင်ငွေရဲ့ 50% ကို ဆရာ ခွဲဝေငွေ အဖြစ် လစဉ် တွက်ချက်ထားပါတယ်</p>
                        <BarChart data={monthlyShare} max={Math.ceil(shareMax)} />
                    </SectionCard>

                    <SectionCard
                        title="လတ်တလော Review များ"
                        action={
                            <Link href="/instructor/reviews" className={btnGhostCls}>
                                Review အားလုံး
                            </Link>
                        }
                    >
                        <div>
                            {recentReviews.length === 0 ? (
                                <p className={`text-[.86rem] ${mutedCls}`}>Review မရှိသေးပါ။</p>
                            ) : (
                                recentReviews.map((r) => (
                                    <div key={r.id} className="flex gap-3.5 border-b border-slate-100 py-3.5 last:border-0 dark:border-[#18264a]">
                                        <Avatar init={r.init} color={r.col} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className={`text-[.88rem] font-bold ${inkCls}`}>{r.name}</p>
                                                <Stars value={r.stars} />
                                                <span className={`text-[.74rem] font-semibold ${mutedCls}`}>{formatDate(r.date)}</span>
                                            </div>
                                            <p className={`mt-0.5 text-[.76rem] font-semibold ${mutedCls}`}>{r.course}</p>
                                            <p className={`mt-1 text-[.86rem] leading-relaxed ${mutedCls}`}>{r.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="မဖြေရသေးတဲ့ မေးခွန်းများ">
                        <div className="space-y-3">
                            {unansweredQuestions.length === 0 ? (
                                <p className={`text-[.86rem] ${mutedCls}`}>မဖြေရသေးတဲ့ မေးခွန်း မရှိပါ — အကုန် ဖြေပြီးပါပြီ</p>
                            ) : (
                                unansweredQuestions.map((q) => (
                                    <div key={q.id} className="rounded-xl bg-slate-50 p-3.5 dark:bg-[#12234a]">
                                        <p className={`text-[.86rem] font-bold leading-snug ${inkCls}`}>{q.q}</p>
                                        <p className={`mt-1.5 text-[.76rem] ${mutedCls}`}>
                                            {q.student} · {q.lesson} · {formatDate(q.time)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/instructor/qa" className={`${btnAccentCls} mt-4 w-full`}>
                            <MessageCircleQuestion className="size-4" /> မေးခွန်းများ ဖြေရန်
                        </Link>
                    </SectionCard>
                </div>
            </div>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>အမြန် လုပ်ဆောင်ချက်များ</h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link href="/instructor/students" className={btnGhostCls}>
                        <Users className="size-4" /> ကျောင်းသားများ
                    </Link>
                    <Link href="/instructor/assignments" className={btnGhostCls}>
                        <BookOpen className="size-4" /> Assignments
                    </Link>
                    <Link href="/instructor/quizzes" className={btnGhostCls}>
                        <Star className="size-4" /> Quizzes
                    </Link>
                    <Link href="/instructor/announcements" className={btnGhostCls}>
                        ကြေညာချက်များ
                    </Link>
                </div>
            </LmsCard>
        </LmsShell>
    );
}

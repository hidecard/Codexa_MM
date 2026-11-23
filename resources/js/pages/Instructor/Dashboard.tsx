import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, MessageCircleQuestion, Star, Users, Video, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { Avatar, BarChart, LmsCard, PageIntro, Pill, Stars, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import {
    ME_INSTRUCTOR,
    SAMPLE_INS_MONTHLY,
    SAMPLE_INS_REVIEWS,
    SAMPLE_LIVE,
    SAMPLE_QA,
    mySampleCourses,
} from '@/pages/Admin/Academy/_sample';

type Stats = {
    courses?: number;
    publishedCourses?: number;
    draftCourses?: number;
    students?: number;
    newStudents?: number;
    shareTotal?: number;
    avgRating?: number;
    reviewsTotal?: number;
};

export default function Dashboard({ stats }: { stats?: Stats }) {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    const name = auth?.user?.name ?? ME_INSTRUCTOR;
    // SAMPLE DATA fallback (prototype): used until the dashboard controller supplies real stats.
    const mine = mySampleCourses();
    const students = stats?.students ?? mine.reduce((s, c) => s + c.students, 0);
    const revenue = mine.reduce((s, c) => s + c.price * c.students, 0);
    const share = stats?.shareTotal ?? Math.round(revenue * 0.5);
    const avg = stats?.avgRating ?? (mine.length ? mine.reduce((s, c) => s + c.rating, 0) / mine.length : 0);
    const reviewsTotal = stats?.reviewsTotal ?? mine.reduce((s, c) => s + c.reviews, 0);
    const unanswered = SAMPLE_QA.filter((q) => !q.answer);
    const live = SAMPLE_LIVE.filter((s) => s.instructor === ME_INSTRUCTOR);
    const liveList = live.length ? live : SAMPLE_LIVE.slice(0, 2);

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
                    label={`ကိုယ်ပိုင် သင်တန်း · Published ${stats?.publishedCourses ?? mine.filter((c) => c.status === 'published').length} ခု`}
                    value={`${formatNumber(stats?.courses ?? mine.length)} ခု`}
                    sub={`${stats?.draftCourses ?? mine.filter((c) => c.status === 'draft').length} draft`}
                    icon={BookOpen}
                    tone="purple"
                />
                <StatCard
                    label="သင်တန်း တက်ရောက်သူ စုစုပေါင်း"
                    value={`${formatNumber(students)} ဦး`}
                    sub={`▲ ${formatNumber(stats?.newStudents ?? 86)} ဦး`}
                    icon={Users}
                    tone="blue"
                />
                <StatCard
                    label="ခွဲဝေငွေ စုစုပေါင်း (50%)"
                    value={formatKyat(share)}
                    sub="ဒီလ ▲ 12%"
                    icon={Wallet}
                    tone="teal"
                />
                <StatCard
                    label={`ပျမ်းမျှ Rating · Review ${formatNumber(reviewsTotal)} ခု`}
                    value={avg.toFixed(1)}
                    sub={`${unanswered.length} မေးခွန်း`}
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
                        <BarChart data={SAMPLE_INS_MONTHLY} max={40} />
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
                            {SAMPLE_INS_REVIEWS.map((r) => (
                                <div key={r.id} className="flex gap-3.5 border-b border-slate-100 py-3.5 last:border-0 dark:border-[#18264a]">
                                    <Avatar init={r.init} color={r.col} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-[.88rem] font-bold ${inkCls}`}>{r.name}</p>
                                            <Stars value={r.stars} />
                                            <span className={`text-[.74rem] font-semibold ${mutedCls}`}>{r.date}</span>
                                        </div>
                                        <p className={`mt-0.5 text-[.76rem] font-semibold ${mutedCls}`}>{r.course}</p>
                                        <p className={`mt-1 text-[.86rem] leading-relaxed ${mutedCls}`}>{r.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="မဖြေရသေးတဲ့ မေးခွန်းများ">
                        <div className="space-y-3">
                            {unanswered.length === 0 ? (
                                <p className={`text-[.86rem] ${mutedCls}`}>မဖြေရသေးတဲ့ မေးခွန်း မရှိပါ — အကုန် ဖြေပြီးပါပြီ</p>
                            ) : (
                                unanswered.slice(0, 2).map((q) => (
                                    <div key={q.id} className="rounded-xl bg-slate-50 p-3.5 dark:bg-[#12234a]">
                                        <p className={`text-[.86rem] font-bold leading-snug ${inkCls}`}>{q.q}</p>
                                        <p className={`mt-1.5 text-[.76rem] ${mutedCls}`}>
                                            {q.student} · {q.lesson} · {q.time}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/instructor/qa" className={`${btnAccentCls} mt-4 w-full`}>
                            <MessageCircleQuestion className="size-4" /> မေးခွန်းများ ဖြေရန်
                        </Link>
                    </SectionCard>

                    <SectionCard title="လာမည့် Live Session များ">
                        <div className="space-y-3">
                            {liveList.map((s) => (
                                <div key={s.title} className="rounded-xl bg-slate-50 p-3.5 dark:bg-[#12234a]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`min-w-0 flex-1 text-[.88rem] font-bold leading-snug ${inkCls}`}>{s.title}</p>
                                        {s.liveNow && <Pill tone="rose">LIVE NOW</Pill>}
                                    </div>
                                    <p className={`mt-1.5 text-[.78rem] ${mutedCls}`}>
                                        {s.when} · {s.time} · စာရင်းပေးထားသူ {s.joined} ဦး
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Link href="/instructor/live-host" className={`${btnGhostCls} mt-4 w-full`}>
                            <Video className="size-4" /> Live စီမံရန်
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

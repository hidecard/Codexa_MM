import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatMinutes } from '@/lib/format';
import { BookOpen, CalendarDays, Flame, PlayCircle, Radio, Trophy, Video } from 'lucide-react';

type EnrollmentCard = {
    id: number;
    status: string;
    progress: number;
    completed_lessons: number;
    total_lessons: number;
    course: { id: number; title: string; slug: string; category?: string | null; instructor?: string | null; thumbnail?: string | null };
    continue_lesson: { id: number; title: string } | null;
};

type Props = {
    enrollments?: EnrollmentCard[];
    stats?: { enrolled: number; active: number; completed: number };
    assignments?: { id: number; title: string; due_at?: string | null; course?: { id: number; title: string } | null }[];
    activities?: { id: number; lesson?: string | null; course?: string | null; is_completed: boolean; updated_at?: string | null }[];
    certificates?: { id: number; certificate_number: string; issued_at?: string | null; course?: string | null }[];
    notifications?: { id: number; title: string; message: string; is_read: boolean; created_at?: string | null }[];
    weeklyActivity?: { day: string; minutes: number }[];
    totalWatchMinutes?: number;
};

/* SAMPLE DATA — fallback only, shown when no real data exists yet (from prototype). */
const SAMPLE_WEEK = [
    { day: 'တနင်္လာ', minutes: 35 },
    { day: 'အင်္ဂါ', minutes: 50 },
    { day: 'ဗုဒ္ဓဟူး', minutes: 25 },
    { day: 'ကြာသပတေး', minutes: 45 },
    { day: 'သောကြာ', minutes: 20 },
    { day: 'စနေ', minutes: 41 },
    { day: 'တနင်္ဂနွေ', minutes: 0 },
];
const SAMPLE_LIVE = [
    { id: 1, title: 'React Hooks Deep Dive — Live Session', instructor: 'Thura Aung', time: 'ယနေ့ · ညနေ 7:00 – 8:30', liveNow: true },
    { id: 2, title: 'JavaScript Async Patterns — Q&A Live', instructor: 'May Thazin', time: 'မနက်ဖြန် · ညနေ 7:00 – 8:00', liveNow: false },
];
const SAMPLE_LEADERS = [
    { rank: 1, name: 'May Thandar', xp: 2480 },
    { rank: 2, name: 'Kaung Htet', xp: 2310, you: true },
    { rank: 3, name: 'Thiri Nanda', xp: 2105 },
];
const QUICK_LINKS = [
    { href: '/student/live-classes', label: 'Live Classes', sub: 'တိုက်ရိုက် သင်တန်းများ', icon: Video },
    { href: '/student/community', label: 'Community', sub: 'ဆွေးနွေးမှုများ', icon: BookOpen },
    { href: '/student/leaderboard', label: 'Leaderboard', sub: 'အဆင့်သတ်မှတ်ချက်', icon: Trophy },
    { href: '/student/schedule', label: 'အချိန်ဇယား', sub: 'ဒီအပတ် အစီအစဉ်', icon: CalendarDays },
];

export default function Dashboard({
    enrollments = [],
    stats = { enrolled: 0, active: 0, completed: 0 },
    assignments = [],
    activities = [],
    certificates = [],
    weeklyActivity,
    totalWatchMinutes = 0,
}: Props) {
    const { auth } = usePage<{ auth?: { user?: { name?: string | null } } }>().props;
    const userName = auth?.user?.name?.split(' ')[0] ?? 'ကျောင်းသား';
    const continueItem = enrollments.find((e) => e.continue_lesson && (e.status === 'active' || e.status === 'completed'));
    const week = weeklyActivity && weeklyActivity.length > 0 ? weeklyActivity : SAMPLE_WEEK;
    const maxMinutes = Math.max(1, ...week.map((d) => d.minutes));
    const weekTotal = week.reduce((s, d) => s + d.minutes, 0);

    return (
        <LmsShell title="Dashboard" nav="student">
            <Head title="Dashboard" />
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">မင်္ဂလာပါ, {userName}</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ယနေ့လည်း ဆက်လက်သင်ယူလိုက်ရအောင် — ရည်မှန်းချက်နဲ့ နီးကပ်လာပါပြီ။</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
                    <Flame className="size-4 text-amber-500" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">12 ရက်</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ဆက်တိုက်လေ့လာမှု</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="စာရင်းသွင်းထားသော သင်တန်း" value={stats.enrolled} tone="teal" />
                <StatCard label="စုစုပေါင်း လေ့လာချိန်" value={totalWatchMinutes > 0 ? formatMinutes(totalWatchMinutes) : `${formatMinutes(weekTotal)} (ဒီအပတ်)`} tone="blue" />
                <StatCard label="ရရှိထားသော လက်မှတ်" value={certificates.length} tone="purple" />
                <StatCard label="ပြီးစီးသော သင်တန်း" value={stats.completed} tone="amber" />
            </div>

            {continueItem && continueItem.continue_lesson && (
                <section className="mt-6 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-wider text-teal-300">ဆက်လက်သင်ယူရန်</p>
                    <h2 className="mt-2 text-2xl font-extrabold">{continueItem.course.title}</h2>
                    <p className="mt-1 text-slate-300">နောက်သင်ခန်းစာ: {continueItem.continue_lesson.title}</p>
                    <div className="mt-4"><ProgressBar value={continueItem.progress} tone="teal" /></div>
                    <p className="mt-2 text-sm text-slate-300">{continueItem.completed_lessons}/{continueItem.total_lessons} သင်ခန်းစာ · {continueItem.progress}% ပြီးစီး</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href={`/student/courses/${continueItem.course.id}/lessons/${continueItem.continue_lesson.id}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500">
                            <PlayCircle className="size-5" /> သင်ခန်းစာ ဆက်လုပ်ရန်
                        </Link>
                        <Link href={`/student/courses/${continueItem.course.id}/learn`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">သင်တန်း ကြည့်ရန်</Link>
                    </div>
                </section>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <SectionCard
                        title="ဒီအပတ် လေ့လာချိန်"
                        action={<Link href="/student/progress" className="text-sm font-bold text-teal-600 hover:text-teal-700">အသေးစိတ်</Link>}
                    >
                        <div className="flex h-36 items-end gap-2 pt-2">
                            {week.map((d) => (
                                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{d.minutes > 0 ? d.minutes : ''}</span>
                                    <div className="w-full max-w-8 rounded-t-lg bg-teal-500/80" style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 96)}px` }} />
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{d.day.slice(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">ဒီအပတ် စုစုပေါင်း {formatMinutes(weekTotal)} လေ့လာခဲ့သည်။</p>
                    </SectionCard>
                </div>

                <SectionCard title="လာမည့် Live Class" action={<Link href="/student/live-classes" className="text-sm font-bold text-teal-600 hover:text-teal-700">အားလုံး</Link>}>
                    <ul className="space-y-3">
                        {SAMPLE_LIVE.map((live) => (
                            <li key={live.id}>
                                <Link href={`/student/live-classes/${live.id}`} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40"><Radio className="size-5" /></span>
                                    <span>
                                        <span className="block font-bold text-slate-900 dark:text-white">{live.title}</span>
                                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{live.instructor} · {live.time}</span>
                                        {live.liveNow && <span className="mt-1 inline-block rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">ယခု Live လွှင့်နေသည်</span>}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            <section className="mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">သင်တန်းများ</h2>
                    <Link href="/student/my-courses" className="text-sm font-bold text-teal-600 hover:text-teal-700">အားလုံး ကြည့်ရန်</Link>
                </div>
                {enrollments.length === 0 ? (
                    <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                        <BookOpen className="mx-auto size-10 text-slate-300" />
                        <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">သင်တန်း မရှိသေးပါ။</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်တန်း ရှာဖွေ စာရင်းသွင်းပြီး စတင် သင်ယူလိုက်ပါ။</p>
                        <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-teal-600">သင်တန်းများ ရှာဖွေရန်</Link>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {enrollments.slice(0, 4).map((e) => (
                            <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        {e.course.category && <p className="text-xs font-bold uppercase tracking-wider text-teal-600">{e.course.category}</p>}
                                        <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{e.course.title}</h3>
                                        {e.course.instructor && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{e.course.instructor}</p>}
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${e.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : e.status === 'active' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{e.status}</span>
                                </div>
                                <div className="mt-4"><ProgressBar value={e.progress} tone="teal" /></div>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{e.completed_lessons}/{e.total_lessons} သင်ခန်းစာ · {e.progress}% ပြီးစီး</p>
                                <div className="mt-4">
                                    {e.status === 'active' || e.status === 'completed' ? (
                                        <Link href={`/student/courses/${e.course.id}/learn`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"><PlayCircle className="size-4" /> သင်တန်း ဖွင့်ရန်</Link>
                                    ) : (
                                        <span className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-800">အတည်ပြုရန် စောင့်နေသည်</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <SectionCard title="ပေးရမည့် Assignment" action={<Link href="/student/assignments" className="text-sm font-bold text-teal-600 hover:text-teal-700">အားလုံး</Link>}>
                    {assignments.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Assignment မရှိသေးပါ။</p>
                    ) : (
                        <ul className="space-y-3">
                            {assignments.slice(0, 5).map((a) => (
                                <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.course?.title}{a.due_at ? ` · သတ်မှတ် ${a.due_at}` : ''}</p>
                                    </div>
                                    <Link href={`/student/assignments/${a.id}`} className="shrink-0 text-sm font-bold text-teal-600 hover:text-teal-700">ဖွင့်ရန်</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard title="Leaderboard" action={<Link href="/student/leaderboard" className="text-sm font-bold text-teal-600 hover:text-teal-700">အားလုံး</Link>}>
                    <ul className="space-y-2">
                        {SAMPLE_LEADERS.map((l) => (
                            <li key={l.rank} className={`flex items-center gap-3 rounded-xl p-3 ${'you' in l && l.you ? 'bg-teal-50 ring-1 ring-teal-200 dark:bg-teal-900/20 dark:ring-teal-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                <span className="w-6 text-center text-sm font-extrabold text-amber-500">#{l.rank}</span>
                                <span className="flex-1 font-bold text-slate-900 dark:text-white">{l.name}{'you' in l && l.you && <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">သင်</span>}</span>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{l.xp.toLocaleString()} XP</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-xs text-slate-400">ဤအပတ် အဆင့်သတ်မှတ်ချက် (နမူနာ)</p>
                </SectionCard>

                <SectionCard title="လတ်တလော လုပ်ဆောင်မှု">
                    {activities.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">သင်ယူမှု မှတ်တမ်း ဤနေရာတွင် ပေါ်လာပါမည်။</p>
                    ) : (
                        <ul className="space-y-3">
                            {activities.slice(0, 5).map((a) => (
                                <li key={a.id} className="flex items-start gap-3 text-sm">
                                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.is_completed ? 'bg-emerald-500' : 'bg-teal-500'}`} />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{a.is_completed ? 'ပြီးစီးခဲ့သည်' : 'ဆက်လက် လုပ်ဆောင်နေသည်'}: {a.lesson}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.course}{a.updated_at ? ` · ${a.updated_at}` : ''}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard title="နောက်ထပ် စာမျက်နှာများ">
                    <div className="grid grid-cols-2 gap-3">
                        {QUICK_LINKS.map((q) => (
                            <Link key={q.href} href={q.href} className="rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <q.icon className="size-5 text-teal-600" />
                                <p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">{q.label}</p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{q.sub}</p>
                            </Link>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </LmsShell>
    );
}

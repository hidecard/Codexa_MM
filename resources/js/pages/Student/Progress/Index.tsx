import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatMinutes } from '@/lib/format';
import { BarChart3 } from 'lucide-react';

type CourseProgress = { id: number; title: string; progress: number; completed: number; total: number };
type Props = {
    weeklyActivity?: { day: string; minutes: number }[];
    totalWatchMinutes?: number;
    courses?: CourseProgress[];
    quizAverage?: number;
    assignmentDone?: number;
    assignmentTotal?: number;
};

/* SAMPLE DATA — fallback only (from prototype PROG_WEEK + COURSES progress). */
const SAMPLE_WEEK = [
    { day: 'တနင်္လာ', minutes: 35 },
    { day: 'အင်္ဂါ', minutes: 50 },
    { day: 'ဗုဒ္ဓဟူး', minutes: 25 },
    { day: 'ကြာသပတေး', minutes: 45 },
    { day: 'သောကြာ', minutes: 20 },
    { day: 'စနေ', minutes: 41 },
    { day: 'တနင်္ဂနွေ', minutes: 0 },
];
const SAMPLE_COURSES: CourseProgress[] = [
    { id: 1, title: 'HTML & CSS Foundations', progress: 68, completed: 33, total: 48 },
    { id: 2, title: 'JavaScript Deep Dive', progress: 32, completed: 28, total: 86 },
    { id: 3, title: 'Python for Beginners', progress: 85, completed: 54, total: 64 },
    { id: 7, title: 'UI/UX Design with Figma', progress: 100, completed: 42, total: 42 },
    { id: 10, title: 'Git, GitHub & Team Workflow', progress: 100, completed: 24, total: 24 },
];

export default function Index({ weeklyActivity, totalWatchMinutes = 0, courses, quizAverage = 87, assignmentDone = 14, assignmentTotal = 16 }: Props) {
    const week = weeklyActivity && weeklyActivity.length > 0 ? weeklyActivity : SAMPLE_WEEK;
    const list = courses && courses.length > 0 ? courses : SAMPLE_COURSES;
    const maxMinutes = Math.max(1, ...week.map((d) => d.minutes));
    const weekTotal = week.reduce((s, d) => s + d.minutes, 0);
    const avgProgress = list.length > 0 ? Math.round(list.reduce((s, c) => s + c.progress, 0) / list.length) : 0;

    return (
        <LmsShell title="တိုးတက်မှု အစီရင်ခံစာ" nav="student">
            <Head title="Progress Report" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><BarChart3 className="size-7 text-teal-600" /> တိုးတက်မှု အစီရင်ခံစာ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်ယူမှု တိုးတက်မှုကို သင်တန်းအလိုက် နှင့် အပတ်အလိုက် ပြန်ကြည့်ရန်</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="ပျမ်းမျှ ပြီးစီးမှု" value={`${avgProgress}%`} tone="teal" />
                <StatCard label="ဒီအပတ် လေ့လာချိန်" value={formatMinutes(weekTotal)} tone="blue" />
                <StatCard label="စုစုပေါင်း လေ့လာချိန်" value={totalWatchMinutes > 0 ? formatMinutes(totalWatchMinutes) : '48.5 နာရီ'} tone="purple" />
                <StatCard label="Quiz ပျမ်းမျှ ရမှတ်" value={`${quizAverage}%`} tone="amber" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ဒီအပတ် လေ့လာချိန် (မိနစ်)</h2>
                    <div className="mt-4 flex h-44 items-end gap-2">
                        {week.map((d) => (
                            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.minutes > 0 ? d.minutes : ''}</span>
                                <div className="w-full max-w-10 rounded-t-lg bg-teal-500/80" style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 128)}px` }} />
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{d.day}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">ဒီအပတ် စုစုပေါင်း {formatMinutes(weekTotal)} လေ့လာခဲ့သည်။ နေ့စဉ် ပျမ်းမျှ {formatMinutes(Math.round(weekTotal / 7))} ဖြစ်သည်။</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Assignment &amp; Quiz</h2>
                    <div className="mt-4 space-y-5">
                        <div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">Assignment ပြီးစီးမှု</span>
                                <span className="font-extrabold text-teal-700 dark:text-teal-300">{assignmentDone}/{assignmentTotal}</span>
                            </div>
                            <div className="mt-2"><ProgressBar value={assignmentTotal > 0 ? Math.round((assignmentDone / assignmentTotal) * 100) : 0} tone="teal" /></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">Quiz ပျမ်းမျှ ရမှတ်</span>
                                <span className="font-extrabold text-teal-700 dark:text-teal-300">{quizAverage}%</span>
                            </div>
                            <div className="mt-2"><ProgressBar value={quizAverage} tone="purple" /></div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Link href="/student/assignments" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Assignment များ</Link>
                            <Link href="/student/quizzes" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Quiz များ</Link>
                            <Link href="/student/leaderboard" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Leaderboard</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">သင်တန်းအလိုက် တိုးတက်မှု</h2>
                <ul className="mt-4 space-y-5">
                    {list.map((c) => (
                        <li key={c.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Link href={`/student/courses/${c.id}/learn`} className="font-bold text-slate-900 hover:text-teal-700 dark:text-white">{c.title}</Link>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{c.completed}/{c.total} သင်ခန်းစာ · {c.progress}%</span>
                            </div>
                            <div className="mt-2"><ProgressBar value={c.progress} tone={c.progress >= 100 ? 'green' : 'teal'} /></div>
                        </li>
                    ))}
                </ul>
            </div>
        </LmsShell>
    );
}

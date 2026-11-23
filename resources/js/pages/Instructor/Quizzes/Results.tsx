import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Eye, Trophy, XCircle } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate } from '@/lib/format';
import { Avatar, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Attempt = {
    id: number;
    student: { id: number; name: string; email: string } | null;
    score: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    answers_count: number;
};

type Quiz = { id: number; title: string; pass_mark: number };

// The controller passes `attempts` as a plain mapped array (not the paginator);
// accept both shapes so the page keeps working either way.
type AttemptsProp = Attempt[] | { data: Attempt[]; total: number };

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function statusPill(status: string) {
    if (status === 'passed')
        return (
            <Pill tone="teal">
                <CheckCircle className="mr-1 size-3" /> အောင်မြင်
            </Pill>
        );
    if (status === 'failed')
        return (
            <Pill tone="rose">
                <XCircle className="mr-1 size-3" /> ကျရှုံး
            </Pill>
        );
    if (status === 'in_progress') return <Pill tone="amber">ဖြေဆိုနေဆဲ</Pill>;
    if (status === 'completed') return <Pill tone="slate">ပြီးဆုံး</Pill>;
    return <Pill tone="slate">{status}</Pill>;
}

export default function Results({ quiz, attempts }: { quiz: Quiz; attempts: AttemptsProp }) {
    const list: Attempt[] = Array.isArray(attempts) ? attempts : (attempts?.data ?? []);
    const total = Array.isArray(attempts) ? attempts.length : (attempts?.total ?? list.length);
    const passed = list.filter((a) => a.status === 'passed').length;
    const avg = list.length ? Math.round(list.reduce((s, a) => s + a.score, 0) / list.length) : 0;

    return (
        <LmsShell title="Quiz ရလဒ်များ" nav="instructor">
            <Head title={`Quiz ရလဒ်များ · ${quiz.title}`} />
            <PageIntro
                title="Quiz ရလဒ်များ"
                description={`${quiz.title} · အောင်မှတ် ${quiz.pass_mark}% · ဖြေဆိုမှု ${total} ကြိမ် · အောင်မြင် ${passed} ဦး · ပျမ်းမျှ ${avg}%`}
                actions={
                    <>
                        <Link href="/instructor/quizzes" className={btnGhostCls}>
                            <ArrowLeft className="size-4" /> Quiz အားလုံး
                        </Link>
                        <Link href={`/instructor/quizzes/${quiz.id}`} className={btnGhostCls}>
                            <Eye className="size-4" /> Quiz ပြင်ရန်
                        </Link>
                    </>
                }
            />

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဖြေဆိုမှု မရှိသေးပါ" description="ကျောင်းသားတွေ ဒီ quiz ကို ဖြေဆိုရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <LmsCard className="mt-6 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b border-slate-200 text-left dark:border-[#1e2c52] ${mutedCls}`}>
                                    <th className="px-4 py-3 font-semibold">ကျောင်းသား</th>
                                    <th className="px-4 py-3 font-semibold">အမှတ်</th>
                                    <th className="px-4 py-3 font-semibold">အခြေအနေ</th>
                                    <th className="px-4 py-3 font-semibold">စတင်ချိန်</th>
                                    <th className="px-4 py-3 font-semibold">ပြီးဆုံးချိန်</th>
                                    <th className="px-4 py-3 font-semibold">အဖြေ</th>
                                    <th className="px-4 py-3 text-right font-semibold">လုပ်ဆောင်ချက်</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#18264a]">
                                {list.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-[#12234a]">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar init={initials(attempt.student?.name ?? '?')} color="#0ea892" size="sm" />
                                                <div>
                                                    <p className={`font-medium ${inkCls}`}>{attempt.student?.name || 'Unknown'}</p>
                                                    <p className={`text-xs ${mutedCls}`}>{attempt.student?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 font-bold ${inkCls}`}>{attempt.score}%</td>
                                        <td className="px-4 py-4">{statusPill(attempt.status)}</td>
                                        <td className={`px-4 py-4 ${mutedCls}`}>{formatDate(attempt.started_at)}</td>
                                        <td className={`px-4 py-4 ${mutedCls}`}>{formatDate(attempt.completed_at)}</td>
                                        <td className={`px-4 py-4 ${mutedCls}`}>{attempt.answers_count}</td>
                                        <td className="px-4 py-4 text-right">
                                            <Link href={`/instructor/quizzes/${quiz.id}/attempts/${attempt.id}`} className={btnGhostCls}>
                                                <Eye className="size-4" /> ကြည့်ရန်
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={`flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-sm dark:border-[#18264a] ${mutedCls}`}>
                        <Trophy className="size-4" /> ဖြေဆိုမှု စုစုပေါင်း {total} ကြိမ်
                    </div>
                </LmsCard>
            )}
        </LmsShell>
    );
}

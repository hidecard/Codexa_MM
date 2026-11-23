import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock, ListChecks, Trophy } from 'lucide-react';

type Quiz = {
    id: number;
    title: string;
    description?: string | null;
    pass_mark: number;
    time_limit?: number | null;
    questions_count?: number;
    course?: { id: number; title: string } | null;
};

export default function Index({ quizzes = [] }: { quizzes?: Quiz[] }) {
    return (
        <LmsShell title="Quiz များ" nav="student">
            <Head title="Quizzes" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Quiz များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">စာရင်းသွင်းထားသော သင်တန်းများမှ Quiz များ</p>
            </div>

            {quizzes.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<ListChecks className="size-10" />}
                    title="Quiz မရှိသေးပါ"
                    description="သင်တန်းများတွင် Quiz အသစ်များ ရှိလာပါက ဤနေရာတွင် ပေါ်လာပါမည်။"
                    action={<Link href="/student/my-courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Link key={quiz.id} href={`/student/quizzes/${quiz.id}`} className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"><ListChecks className="size-5" /></span>
                                <Badge variant="outline" className="gap-1"><Trophy className="size-3" /> အောင်မှတ် {quiz.pass_mark}%</Badge>
                            </div>
                            <h2 className="mt-3 text-lg font-extrabold leading-snug text-slate-900 group-hover:text-teal-700 dark:text-white">{quiz.title}</h2>
                            {quiz.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                {quiz.course && <Badge variant="outline">{quiz.course.title}</Badge>}
                                {quiz.time_limit ? <Badge variant="secondary" className="gap-1"><Clock className="size-3" /> {quiz.time_limit} မိနစ်</Badge> : <Badge variant="secondary">အချိန် ကန့်သတ်မရှိ</Badge>}
                                {quiz.questions_count !== undefined && <Badge variant="outline">မေးခွန်း {quiz.questions_count} ခု</Badge>}
                            </div>
                            <span className="mt-4 inline-flex text-sm font-bold text-teal-600 group-hover:text-teal-700">Quiz ဖြေရန် →</span>
                        </Link>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

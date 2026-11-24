import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate } from '@/lib/format';
import { Avatar, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Option = { id: number; text: string; is_correct: boolean };
type Answer = {
    question_id: number;
    question: string;
    question_type: string;
    points: number;
    explanation: string | null;
    answer: string | number | number[];
    is_correct: boolean;
    correct_option: string | null;
    options: Option[];
};
type Attempt = {
    id: number;
    student: { id: number; name: string; email: string } | null;
    score: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    answers: Answer[];
};
type Quiz = { id: number; title: string; pass_mark: number; show_correct_answers: boolean };

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function optionBorder(isSelected: boolean, isCorrect: boolean, showCorrect: boolean) {
    if (isSelected && isCorrect) return 'border-green-500';
    if (isSelected && !isCorrect) return 'border-rose-500';
    if (!isSelected && isCorrect && showCorrect) return 'border-green-500';
    return 'border-slate-200 dark:border-[#1e2c52]';
}

export default function AttemptDetail({ quiz, attempt }: { quiz: Quiz; attempt: Attempt }) {
    const passed = attempt.status === 'passed';
    const correctCount = attempt.answers.filter((a) => a.is_correct).length;
    const totalPoints = attempt.answers.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = attempt.answers.filter((a) => a.is_correct).reduce((sum, a) => sum + a.points, 0);

    return (
        <LmsShell title="ဖြေဆိုမှု အသေးစိတ်" nav="instructor">
            <Head title={`ဖြေဆိုမှု အသေးစိတ် · ${quiz.title}`} />
            <PageIntro
                title="ဖြေဆိုမှု အသေးစိတ်"
                description={`${quiz.title} · ${attempt.student?.name ?? 'Unknown'}`}
                actions={
                    <Link href={`/instructor/quizzes/${quiz.id}/results`} className={btnGhostCls}>
                        <ArrowLeft className="size-4" /> ရလဒ်များ ပြန်ကြည့်ရန်
                    </Link>
                }
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`text-lg font-extrabold ${inkCls}`}>ကျောင်းသား အဖြေများ</h2>
                        <div className="mt-4 space-y-6">
                            {attempt.answers.map((answer, index) => (
                                <div key={answer.question_id} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#1e2c52] dark:bg-[#12234a]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${inkCls}`}>
                                                မေးခွန်း {index + 1} <span className={cn('font-normal', mutedCls)}>({answer.points} မှတ်)</span>
                                            </h4>
                                            <p className={`mt-1 ${inkCls}`}>{answer.question}</p>
                                        </div>
                                        {answer.is_correct ? (
                                            <Pill tone="teal">
                                                <CheckCircle className="mr-1 size-3" /> မှန်ပါတယ်
                                            </Pill>
                                        ) : (
                                            <Pill tone="rose">
                                                <XCircle className="mr-1 size-3" /> မှားပါတယ်
                                            </Pill>
                                        )}
                                    </div>

                                    <div className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-[#1e2c52]">
                                        {answer.question_type === 'single_choice' || answer.question_type === 'true_false' ? (
                                            answer.options.map((option) => {
                                                const isSelected = answer.answer === option.id;
                                                const isCorrect = option.is_correct;
                                                return (
                                                    <div key={option.id} className={cn('flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-[#0d1730]', optionBorder(isSelected, isCorrect, quiz.show_correct_answers))}>
                                                        <span className={cn('flex size-5 flex-none items-center justify-center rounded-full border-2', isCorrect ? 'border-green-600 text-green-600' : isSelected ? 'border-rose-600 text-rose-600' : 'border-slate-300 text-slate-300')}>
                                                            {isCorrect ? <CheckCircle className="size-4" /> : isSelected ? <XCircle className="size-4" /> : null}
                                                        </span>
                                                        <span className={inkCls}>{option.text}</span>
                                                        {quiz.show_correct_answers && isCorrect && <Pill tone="teal">အဖြေမှန်</Pill>}
                                                    </div>
                                                );
                                            })
                                        ) : answer.question_type === 'multiple_choice' ? (
                                            answer.options.map((option) => {
                                                const selectedIds = Array.isArray(answer.answer) ? answer.answer : [];
                                                const isSelected = selectedIds.includes(option.id);
                                                const isCorrect = option.is_correct;
                                                return (
                                                    <div key={option.id} className={cn('flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-[#0d1730]', optionBorder(isSelected, isCorrect, quiz.show_correct_answers))}>
                                                        <span className={cn('flex size-5 flex-none items-center justify-center rounded-full border-2', isCorrect ? 'border-green-600 text-green-600' : isSelected ? 'border-rose-600 text-rose-600' : 'border-slate-300 text-slate-300')}>
                                                            {isCorrect ? <CheckCircle className="size-4" /> : isSelected ? <XCircle className="size-4" /> : null}
                                                        </span>
                                                        <span className={inkCls}>{option.text}</span>
                                                        {quiz.show_correct_answers && isCorrect && <Pill tone="teal">အဖြေမှန်</Pill>}
                                                    </div>
                                                );
                                            })
                                        ) : answer.question_type === 'short_answer' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-[#1e2c52] dark:bg-[#0d1730]">
                                                    <span className={cn('font-mono text-sm', inkCls)}>{(answer.answer as string) || '(အဖြေ မရှိ)'}</span>
                                                    {answer.is_correct ? <CheckCircle className="size-5 text-green-600" /> : <XCircle className="size-5 text-rose-600" />}
                                                </div>
                                                {quiz.show_correct_answers && answer.correct_option && (
                                                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                                                        <CheckCircle className="size-5 text-green-600" />
                                                        <span className={inkCls}>
                                                            အဖြေမှန်: <span className="font-mono">{answer.correct_option}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className={`text-sm ${mutedCls}`}>မပံ့ပိုးသော မေးခွန်း အမျိုးအစား</p>
                                        )}
                                    </div>

                                    {answer.explanation && quiz.show_correct_answers && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                <strong>ရှင်းလင်းချက်:</strong> {answer.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </LmsCard>
                </div>

                <div className="space-y-4">
                    <LmsCard className="p-5">
                        <h2 className={`text-lg font-extrabold ${inkCls}`}>ကျောင်းသား အချက်အလက်</h2>
                        <div className="mt-3 flex items-center gap-3">
                            <Avatar init={initials(attempt.student?.name ?? '?')} color="#0ea892" />
                            <div>
                                <p className={`font-medium ${inkCls}`}>{attempt.student?.name || 'Unknown'}</p>
                                <p className={`text-sm ${mutedCls}`}>{attempt.student?.email}</p>
                            </div>
                        </div>
                    </LmsCard>

                    <LmsCard className="p-5">
                        <h2 className={`text-lg font-extrabold ${inkCls}`}>ဖြေဆိုမှု အကျဉ်းချုပ်</h2>
                        <div className="mt-4 text-center">
                            <div className={`text-4xl font-extrabold ${inkCls}`}>{attempt.score}%</div>
                            <div className={`text-sm ${mutedCls}`}>
                                {earnedPoints} / {totalPoints} မှတ်
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className={mutedCls}>အခြေအနေ</span>
                                <span className={cn('font-medium', passed ? 'text-green-600' : 'text-rose-600')}>{passed ? 'အောင်မြင်' : 'ကျရှုံး'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={mutedCls}>အဖြေမှန်</span>
                                <span className={cn('font-medium', inkCls)}>
                                    {correctCount} / {attempt.answers.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className={mutedCls}>စတင်ချိန်</span>
                                <span className={cn('font-medium', inkCls)}>{formatDate(attempt.started_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={mutedCls}>ပြီးဆုံးချိန်</span>
                                <span className={cn('font-medium', inkCls)}>{formatDate(attempt.completed_at)}</span>
                            </div>
                        </div>
                    </LmsCard>
                </div>
            </div>
        </LmsShell>
    );
}

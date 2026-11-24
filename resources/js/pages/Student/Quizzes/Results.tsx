import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { ArrowLeft, CheckCircle2, Clock, Trophy, XCircle } from 'lucide-react';

type Option = { id: number; text: string; is_correct: boolean };
type Answer = {
    question_id: number;
    question?: string | null;
    question_type?: string | null;
    points: number;
    explanation?: string | null;
    answer: string | number | number[];
    is_correct: boolean;
    correct_option?: string | null;
    options: Option[];
};
type Attempt = { id: number; score: number; status: string; started_at?: string | null; completed_at?: string | null; answers: Answer[] };
type Quiz = { id: number; title: string; pass_mark: number; show_correct_answers: boolean };

type Props = { quiz: Quiz; attempt: Attempt };

function optionRowClass(isSelected: boolean, isCorrect: boolean, showAnswers: boolean) {
    if (isSelected && isCorrect) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    if (isSelected && !isCorrect) return 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
    if (!isSelected && isCorrect && showAnswers) return 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/10';
    return 'border-slate-200 dark:border-slate-700';
}

export default function Results({ quiz, attempt }: Props) {
    const passed = attempt.status === 'passed';
    const correctCount = attempt.answers.filter((a) => a.is_correct).length;
    const totalPoints = attempt.answers.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = attempt.answers.filter((a) => a.is_correct).reduce((sum, a) => sum + a.points, 0);

    return (
        <LmsShell title="Quiz ရလဒ်" nav="student">
            <Head title={`Quiz ရလဒ် · ${quiz.title}`} />
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Quiz ရလဒ်</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{quiz.title}</h1>
                </div>
                <Badge variant={passed ? 'success' : 'danger'} className="gap-2 px-4 py-2 text-base">
                    {passed ? <><CheckCircle2 className="size-4" /> အောင်မြင်ပါသည်</> : <><XCircle className="size-4" /> မအောင်ပါ</>}
                </Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1"><Trophy className="size-3" /> ရမှတ် {attempt.score}%</Badge>
                <Badge variant="outline">အောင်မှတ် {quiz.pass_mark}%</Badge>
                <Badge variant="outline" className="gap-1"><Clock className="size-3" /> မှန်ကန်မှု {correctCount}/{attempt.answers.length}</Badge>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အဖြေများ ပြန်လည်ကြည့်ရန်</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အစိမ်းရောင် = မှန်ကန်သော အဖြေ၊ အနီရောင် = မှားယွင်းသော အဖြေ</p>
                        <div className="mt-5 space-y-6">
                            {attempt.answers.map((answer, index) => (
                                <div key={answer.question_id} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                မေးခွန်း {index + 1} <span className="font-normal text-slate-500 dark:text-slate-400">({answer.points} မှတ်)</span>
                                            </h4>
                                            <p className="mt-1 text-slate-700 dark:text-slate-200">{answer.question}</p>
                                        </div>
                                        <Badge variant={answer.is_correct ? 'success' : 'danger'} className="shrink-0 gap-1">
                                            {answer.is_correct ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                                            {answer.is_correct ? 'မှန်ကန်သည်' : 'မှားယွင်းသည်'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                                        {answer.question_type === 'single_choice' || answer.question_type === 'true_false' || answer.question_type === 'multiple_choice' ? (
                                            answer.options.map((option) => {
                                                const selectedIds = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
                                                const isSelected = selectedIds.map(String).includes(String(option.id));
                                                const isCorrect = option.is_correct;
                                                return (
                                                    <div key={option.id} className={`flex items-center gap-3 rounded-lg border p-3 ${optionRowClass(isSelected, isCorrect, quiz.show_correct_answers)}`}>
                                                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${isCorrect ? 'border-emerald-600 text-emerald-600' : isSelected ? 'border-rose-600 text-rose-600' : 'border-slate-300 text-slate-300'}`}>
                                                            {isCorrect ? <CheckCircle2 className="size-4" /> : isSelected ? <XCircle className="size-4" /> : null}
                                                        </span>
                                                        <span className="text-slate-700 dark:text-slate-200">{option.text}</span>
                                                        {quiz.show_correct_answers && isCorrect && <Badge variant="success" className="ml-auto shrink-0">မှန်ကန်သော အဖြေ</Badge>}
                                                    </div>
                                                );
                                            })
                                        ) : answer.question_type === 'short_answer' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                                                    <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{(answer.answer as string) || '(အဖြေ မရှိ)'}</span>
                                                    {answer.is_correct ? <CheckCircle2 className="size-5 text-emerald-600" /> : <XCircle className="size-5 text-rose-600" />}
                                                </div>
                                                {quiz.show_correct_answers && answer.correct_option && (
                                                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                        <CheckCircle2 className="size-5 text-emerald-600" />
                                                        <span className="text-slate-700 dark:text-slate-200">မှန်ကန်သော အဖြေ: <span className="font-mono">{answer.correct_option}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">ဤမေးခွန်း အမျိုးအစားကို မပံ့ပိုးပါ</p>
                                        )}
                                    </div>

                                    {answer.explanation && quiz.show_correct_answers && (
                                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                                            <p className="text-sm text-teal-900 dark:text-teal-100"><strong>ရှင်းလင်းချက်:</strong> {answer.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အနှစ်ချုပ်</h2>
                        <div className="mt-4 text-center">
                            <div className={`text-4xl font-extrabold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{attempt.score}%</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{earnedPoints} / {totalPoints} မှတ်</div>
                        </div>
                        <div className="mt-5 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">အခြေအနေ</span><span className={`font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{passed ? 'အောင်မြင်ပါသည်' : 'မအောင်ပါ'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">မှန်ကန်သော အဖြေ</span><span className="font-bold text-slate-900 dark:text-white">{correctCount} / {attempt.answers.length}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">စတင်ခဲ့သည်</span><span className="font-bold text-slate-900 dark:text-white">{formatDate(attempt.started_at)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">ပြီးစီးခဲ့သည်</span><span className="font-bold text-slate-900 dark:text-white">{formatDate(attempt.completed_at)}</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {!passed && (
                            <Link href={`/student/quizzes/${quiz.id}`} className="rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-teal-700">ပြန်လည် ဖြေဆိုရန်</Link>
                        )}
                        <Link href="/student/quizzes" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            <ArrowLeft className="size-4" /> Quiz အားလုံး သို့ ပြန်သွားရန်
                        </Link>
                        <Link href="/student/dashboard" className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Dashboard</Link>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

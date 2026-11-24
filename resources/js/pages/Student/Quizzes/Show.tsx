import { Head, Link, useForm } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, ListChecks, PlayCircle, Trophy } from 'lucide-react';

type Question = {
    id: number;
    question: string;
    type: string;
    points: number;
    options: { id: number; text: string }[];
};

type Quiz = {
    id: number;
    title: string;
    description?: string | null;
    pass_mark: number;
    time_limit?: number | null;
    shuffle_questions: boolean;
    show_correct_answers: boolean;
    course?: { id: number; title: string } | null;
    questions: Question[];
};

type Props = {
    quiz: Quiz;
    activeAttempt?: { id: number; started_at: string } | null;
};

export default function Show({ quiz, activeAttempt = null }: Props) {
    const { data, setData, post, processing } = useForm({
        answers: [] as { question_id: number; answer: string | number | number[] }[],
    });

    const handleOptionChange = (questionId: number, optionId: number | string, type: string) => {
        const currentAnswers = [...data.answers];
        const existingIndex = currentAnswers.findIndex((a) => a.question_id === questionId);

        if (type === 'multiple_choice') {
            const selected = (currentAnswers[existingIndex]?.answer as number[]) || [];
            const newSelected = selected.includes(optionId as number)
                ? selected.filter((id) => id !== optionId)
                : [...selected, optionId as number];

            if (existingIndex >= 0) {
                currentAnswers[existingIndex] = { question_id: questionId, answer: newSelected };
            } else {
                currentAnswers.push({ question_id: questionId, answer: newSelected });
            }
        } else {
            if (existingIndex >= 0) {
                currentAnswers[existingIndex] = { question_id: questionId, answer: optionId };
            } else {
                currentAnswers.push({ question_id: questionId, answer: optionId });
            }
        }

        setData('answers', currentAnswers);
    };

    const handleShortAnswerChange = (questionId: number, value: string) => {
        const currentAnswers = [...data.answers];
        const existingIndex = currentAnswers.findIndex((a) => a.question_id === questionId);

        if (existingIndex >= 0) {
            currentAnswers[existingIndex] = { question_id: questionId, answer: value };
        } else {
            currentAnswers.push({ question_id: questionId, answer: value });
        }

        setData('answers', currentAnswers);
    };

    const handleStart = () => {
        post(`/student/quizzes/${quiz.id}/start`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/student/quizzes/${quiz.id}/submit`);
    };

    const isAnswered = (questionId: number) => {
        const answer = data.answers.find((a) => a.question_id === questionId);
        if (!answer) return false;
        if (typeof answer.answer === 'string') return answer.answer.trim() !== '';
        if (Array.isArray(answer.answer)) return answer.answer.length > 0;
        return true;
    };

    const answeredCount = quiz.questions.filter((q) => isAnswered(q.id)).length;
    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

    return (
        <LmsShell title="Quiz" nav="student">
            <Head title={quiz.title} />
            <Link href="/student/quizzes" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Quiz အားလုံး</Link>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    {quiz.course && <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">{quiz.course.title}</p>}
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{quiz.title}</h1>
                    {quiz.description && <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {quiz.time_limit ? (
                    <Badge variant="secondary" className="gap-1"><Clock className="size-3" /> {quiz.time_limit} မိနစ်</Badge>
                ) : (
                    <Badge variant="secondary">အချိန် ကန့်သတ်မရှိ</Badge>
                )}
                <Badge variant="outline" className="gap-1"><Trophy className="size-3" /> အောင်မှတ် {quiz.pass_mark}%</Badge>
                <Badge variant="outline" className="gap-1"><ListChecks className="size-3" /> မေးခွန်း {quiz.questions.length} ခု · စုစုပေါင်း {totalPoints} မှတ်</Badge>
            </div>

            {!activeAttempt ? (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">စတင် ဖြေဆိုရန် အဆင်သင့်ဖြစ်ပြီလား?</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        ဤ Quiz တွင် မေးခွန်း {quiz.questions.length} ခု ပါဝင်သည်။
                        {quiz.time_limit ? ` အချိန်ကန့်သတ်ချက် ${quiz.time_limit} မိနစ် ဖြစ်သည်။` : ' အချိန် ကန့်သတ်ချက် မရှိပါ။'}
                        {' '}အောင်မြင်ရန် အနည်းဆုံး {quiz.pass_mark}% ရရှိရမည်။
                    </p>
                    <Button onClick={handleStart} size="lg" className="mt-5 bg-teal-600 hover:bg-teal-700" disabled={processing}>
                        <PlayCircle className="mr-2 size-4" />
                        Quiz စတင်ရန်
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <span>ဖြေပြီးသား {answeredCount}/{quiz.questions.length} ခု</span>
                            <Badge variant="secondary">ဖြေဆိုနေဆဲ</Badge>
                        </div>
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-teal-600" style={{ width: `${quiz.questions.length > 0 ? (answeredCount / quiz.questions.length) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-8">
                            {quiz.questions.map((question, index) => (
                                <div key={question.id} className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                မေးခွန်း {index + 1} <span className="font-normal text-slate-500 dark:text-slate-400">({question.points} မှတ်)</span>
                                            </h4>
                                            <p className="mt-1 text-slate-700 dark:text-slate-200">{question.question}</p>
                                        </div>
                                        <Badge variant={isAnswered(question.id) ? 'default' : 'outline'} className="shrink-0">
                                            {isAnswered(question.id) ? 'ဖြေပြီးပါပြီ' : 'မဖြေရသေး'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                                        {question.type === 'single_choice' || question.type === 'true_false' ? (
                                            question.options.map((option) => {
                                                const answer = data.answers.find((a) => a.question_id === question.id);
                                                const isSelected = answer && answer.answer === option.id;
                                                return (
                                                    <label
                                                        key={option.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                                            isSelected ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question_${question.id}`}
                                                            value={option.id}
                                                            checked={!!isSelected}
                                                            onChange={() => handleOptionChange(question.id, option.id, question.type)}
                                                            className="size-4 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <span className="text-slate-700 dark:text-slate-200">{option.text}</span>
                                                    </label>
                                                );
                                            })
                                        ) : question.type === 'multiple_choice' ? (
                                            question.options.map((option) => {
                                                const answer = data.answers.find((a) => a.question_id === question.id);
                                                const selected = (answer?.answer as number[]) || [];
                                                const isSelected = selected.includes(option.id);
                                                return (
                                                    <label
                                                        key={option.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                                            isSelected ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            value={option.id}
                                                            checked={isSelected}
                                                            onChange={() => handleOptionChange(question.id, option.id, question.type)}
                                                            className="size-4 rounded text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <span className="text-slate-700 dark:text-slate-200">{option.text}</span>
                                                    </label>
                                                );
                                            })
                                        ) : question.type === 'short_answer' ? (
                                            <input
                                                type="text"
                                                value={(data.answers.find((a) => a.question_id === question.id)?.answer as string) || ''}
                                                onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                                                placeholder="သင်၏ အဖြေကို ရေးပါ…"
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-500">ဤမေးခွန်း အမျိုးအစားကို မပံ့ပိုးပါ</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/student/quizzes" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300">
                            နောက်မှ ဖြေရန်
                        </Link>
                        <Button type="submit" disabled={processing || answeredCount === 0} className="bg-teal-600 hover:bg-teal-700">
                            Quiz တင်ပြရန်
                        </Button>
                    </div>
                </form>
            )}
        </LmsShell>
    );
}

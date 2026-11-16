import { usePage, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, PlayCircle } from 'lucide-react';

interface Question {
    id: number;
    question: string;
    type: string;
    points: number;
    options: { id: number; text: string }[];
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    pass_mark: number;
    time_limit: number | null;
    shuffle_questions: boolean;
    show_correct_answers: boolean;
    course: { id: number; title: string } | null;
    questions: Question[];
}

interface ActiveAttempt {
    id: number;
    started_at: string;
}

type ActiveAttemptNullable = ActiveAttempt | null;

interface PageProps {
    quiz: Quiz;
    activeAttempt: ActiveAttemptNullable;
    [key: string]: unknown;
}

export default function Show() {
    const { quiz, activeAttempt } = usePage<PageProps>().props;
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
        post(route('student.quizzes.start', quiz.id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('student.quizzes.submit', quiz.id));
    };

    const isAnswered = (questionId: number) => {
        const answer = data.answers.find((a) => a.question_id === questionId);
        if (!answer) return false;
        if (typeof answer.answer === 'string') return answer.answer.trim() !== '';
        if (Array.isArray(answer.answer)) return answer.answer.length > 0;
        return true;
    };

    const answeredCount = quiz.questions.filter((q) => isAnswered(q.id)).length;

    const headerActions = (
        <div className="flex flex-wrap items-center gap-3 mt-4">
            {quiz.course && (
                <Badge variant="outline">{quiz.course.title}</Badge>
            )}
            {quiz.time_limit && (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{quiz.time_limit} min</span>
                </Badge>
            )}
            <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                <span>Pass: {quiz.pass_mark}%</span>
            </Badge>
            <Badge variant="outline" className="gap-1">
                <span>{quiz.questions.length} questions</span>
            </Badge>
        </div>
    );

    return (
        <AppShell>
            <PageHeader
                eyebrow="Codexa MM"
                title={quiz.title}
                description={quiz.description || undefined}
                actions={headerActions}
            />

            {!activeAttempt ? (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Ready to start?</CardTitle>
                        <CardDescription>
                            This quiz has {quiz.questions.length} question(s). {quiz.time_limit ? `Time limit: ${quiz.time_limit} minutes.` : 'No time limit.'}
                            You need at least {quiz.pass_mark}% to pass.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleStart} size="lg" className="w-full sm:w-auto" disabled={processing}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Quiz
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Question {answeredCount} of {quiz.questions.length} answered</span>
                            {activeAttempt && (
                                <Badge variant="secondary">
                                    In Progress
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-8">
                                {quiz.questions.map((question, index) => (
                                    <div key={question.id} className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900">
                                                    Question {index + 1} <span className="font-normal text-slate-500">({question.points} pts)</span>
                                                </h4>
                                                <p className="mt-1 text-slate-700">{question.question}</p>
                                            </div>
                                            <Badge variant={isAnswered(question.id) ? 'default' : 'outline'} className="flex-shrink-0">
                                                {isAnswered(question.id) ? 'Answered' : 'Not answered'}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                                            {question.type === 'single_choice' || question.type === 'true_false' ? (
                                                question.options.map((option) => {
                                                    const answer = data.answers.find((a) => a.question_id === question.id);
                                                    const isSelected = answer && answer.answer === option.id;
                                                    return (
                                                        <label
                                                            key={option.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                                                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question_${question.id}`}
                                                                value={option.id}
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(question.id, option.id, question.type)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-slate-700">{option.text}</span>
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
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                                                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                value={option.id}
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(question.id, option.id, question.type)}
                                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-slate-700">{option.text}</span>
                                                        </label>
                                                    );
                                                })
                                            ) : question.type === 'short_answer' ? (
                                                <input
                                                    type="text"
                                                    value={(data.answers.find((a) => a.question_id === question.id)?.answer as string) || ''}
                                                    onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-500">Unsupported question type</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/student/quizzes" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing || answeredCount === 0}>
                            Submit Quiz
                        </Button>
                    </div>
                </form>
            )}
        </AppShell>
    );
}

import { usePage, Link, Head } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, User, ArrowLeft } from 'lucide-react';

interface Option {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Answer {
    question_id: number;
    question: string;
    question_type: string;
    points: number;
    explanation: string | null;
    answer: string | number | number[];
    is_correct: boolean;
    correct_option: string | null;
    options: Option[];
}

interface Attempt {
    id: number;
    student: { id: number; name: string; email: string } | null;
    score: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    answers: Answer[];
}

interface Quiz {
    id: number;
    title: string;
    pass_mark: number;
    show_correct_answers: boolean;
}

interface PageProps {
    quiz: Quiz;
    attempt: Attempt;
    [key: string]: unknown;
}

export default function AttemptDetail() {
    const { quiz, attempt } = usePage<PageProps>().props;
    const passed = attempt.status === 'passed';
    const correctCount = attempt.answers.filter((a) => a.is_correct).length;
    const totalPoints = attempt.answers.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = attempt.answers.filter((a) => a.is_correct).reduce((sum, a) => sum + a.points, 0);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString();
    };

    const headerActions = (
        <Link href={`/instructor/quizzes/${quiz.id}/results`}>
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Results</Button>
        </Link>
    );

    return (
        <AppShell>
            <Head title={`Attempt Details: ${quiz.title}`} />
            <PageHeader
                eyebrow="Codexa MM"
                title="Attempt Details"
                description={quiz.title}
                actions={headerActions}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Answers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            {attempt.answers.map((answer, index) => (
                                <div key={answer.question_id} className="space-y-4 p-4 rounded-lg border bg-slate-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-slate-900">
                                                Question {index + 1} <span className="font-normal text-slate-500">({answer.points} pts)</span>
                                            </h4>
                                            <p className="mt-1 text-slate-700">{answer.question}</p>
                                        </div>
                                        <Badge variant={answer.is_correct ? 'default' : 'danger'} className="flex-shrink-0 gap-1">
                                            {answer.is_correct ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : (
                                                <XCircle className="h-3 w-3" />
                                            )}
                                            {answer.is_correct ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                                        {answer.question_type === 'single_choice' || answer.question_type === 'true_false' ? (
                                            answer.options.map((option) => {
                                                const isSelected = answer.answer === option.id;
                                                const isCorrect = option.is_correct;

                                                let borderColor = '#e2e8f0';
                                                if (isSelected && isCorrect) borderColor = '#22c55e';
                                                else if (isSelected && !isCorrect) borderColor = '#ef4444';
                                                else if (!isSelected && isCorrect && quiz.show_correct_answers) borderColor = '#22c55e';

                                                return (
                                                    <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor }}>
                                                        <span className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center ${
                                                            isCorrect ? 'text-green-600 border-green-600' : isSelected ? 'text-red-600 border-red-600' : 'text-slate-300 border-slate-300'
                                                        }`}>
                                                            {isCorrect ? <CheckCircle className="h-4 w-4" /> : isSelected ? <XCircle className="h-4 w-4" /> : null}
                                                        </span>
                                                        <span className="text-slate-700">{option.text}</span>
                                                        {quiz.show_correct_answers && isCorrect && (
                                                            <Badge variant="success" className="ml-auto">Correct answer</Badge>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : answer.question_type === 'multiple_choice' ? (
                                            answer.options.map((option) => {
                                                const selectedIds = Array.isArray(answer.answer) ? answer.answer : [];
                                                const isSelected = selectedIds.includes(option.id);
                                                const isCorrect = option.is_correct;

                                                let borderColor = '#e2e8f0';
                                                if (isSelected && isCorrect) borderColor = '#22c55e';
                                                else if (isSelected && !isCorrect) borderColor = '#ef4444';
                                                else if (!isSelected && isCorrect && quiz.show_correct_answers) borderColor = '#22c55e';

                                                return (
                                                    <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor }}>
                                                        <span className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center ${
                                                            isCorrect ? 'text-green-600 border-green-600' : isSelected ? 'text-red-600 border-red-600' : 'text-slate-300 border-slate-300'
                                                        }`}>
                                                            {isCorrect ? <CheckCircle className="h-4 w-4" /> : isSelected ? <XCircle className="h-4 w-4" /> : null}
                                                        </span>
                                                        <span className="text-slate-700">{option.text}</span>
                                                        {quiz.show_correct_answers && isCorrect && (
                                                            <Badge variant="success" className="ml-auto">Correct answer</Badge>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : answer.question_type === 'short_answer' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                                                    <span className="text-slate-700 font-mono text-sm">{answer.answer as string || '(empty)'}</span>
                                                    {answer.is_correct ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-600" />
                                                    )}
                                                </div>
                                                {quiz.show_correct_answers && answer.correct_option && (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                        <span className="text-slate-700">Correct answer: <span className="font-mono">{answer.correct_option}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">Unsupported question type</p>
                                        )}
                                    </div>

                                    {answer.explanation && quiz.show_correct_answers && (
                                        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                            <p className="text-sm text-blue-800"><strong>Explanation:</strong> {answer.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="flex items-center gap-3">
                                <User className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600" />
                                <div>
                                    <p className="font-medium text-slate-900">{attempt.student?.name || 'Unknown'}</p>
                                    <p className="text-sm text-slate-500">{attempt.student?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attempt Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-slate-900">{attempt.score}%</div>
                                <div className="text-sm text-slate-500">{earnedPoints} / {totalPoints} points</div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Status</span>
                                    <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Correct Answers</span>
                                    <span className="font-medium">{correctCount} / {attempt.answers.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Started</span>
                                    <span className="font-medium">{formatDate(attempt.started_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Completed</span>
                                    <span className="font-medium">{formatDate(attempt.completed_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
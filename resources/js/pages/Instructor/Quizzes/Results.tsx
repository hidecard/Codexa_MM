import { usePage, Link, Head } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, XCircle, User, ArrowLeft, Eye } from 'lucide-react';

interface Attempt {
    id: number;
    student: { id: number; name: string; email: string } | null;
    score: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    answers_count: number;
}

interface Quiz {
    id: number;
    title: string;
    pass_mark: number;
}

interface PageProps {
    quiz: Quiz;
    attempts: {
        data: Attempt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    [key: string]: unknown;
}

export default function Results() {
    const { quiz, attempts } = usePage<PageProps>().props;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed':
                return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" /> Passed</Badge>;
            case 'failed':
                return <Badge variant="danger"><XCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
            case 'completed':
                return <Badge variant="secondary">Completed</Badge>;
            case 'in_progress':
                return <Badge variant="outline">In Progress</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const headerActions = (
        <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link href="/instructor/quizzes">
                <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes</Button>
            </Link>
            <Link href={`/instructor/quizzes/${quiz.id}`}>
                <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Edit Quiz</Button>
            </Link>
        </div>
    );

    return (
        <AppShell>
            <Head title={`Quiz Results: ${quiz.title}`} />
            <PageHeader
                eyebrow="Codexa MM"
                title="Quiz Results"
                description={quiz.title}
                actions={headerActions}
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Attempts ({attempts.total})</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="font-medium">Pass Mark: {quiz.pass_mark}%</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {attempts.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">No attempts yet</h3>
                            <p className="mt-2 text-slate-500">Students haven't attempted this quiz yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Student</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Score</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Started</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Completed</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Answers</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {attempts.data.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-slate-50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{attempt.student?.name || 'Unknown'}</p>
                                                        <p className="text-sm text-slate-500">{attempt.student?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-slate-900">{attempt.score}%</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(attempt.status)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {formatDate(attempt.started_at)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {formatDate(attempt.completed_at)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {attempt.answers_count}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link href={`/instructor/quizzes/${quiz.id}/attempts/${attempt.id}`}>
                                                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /> View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppShell>
    );
}
import { usePage, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    pass_mark: number;
    time_limit: number | null;
    course: { id: number; title: string } | null;
}

interface PageProps {
    quizzes: Quiz[];
    [key: string]: unknown;
}

export default function Index() {
    const { quizzes } = usePage<PageProps>().props;

    return (
        <AppShell>
            <PageHeader eyebrow="Codexa MM" title="Quizzes" description="Available quizzes for your enrolled courses." />

            {quizzes.length === 0 ? (
                <div className="mt-8 text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">No quizzes available</h3>
                    <p className="mt-2 text-slate-500">Quizzes will appear here when your enrolled courses have quizzes.</p>
                </div>
            ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Link key={quiz.id} href={`/student/quizzes/${quiz.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl">
                            <Card className="h-full transition hover:border-blue-300 hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    {quiz.description && <p className="text-sm text-slate-600 line-clamp-2">{quiz.description}</p>}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        {quiz.course && (
                                            <Badge variant="outline" className="gap-1">
                                                <span>{quiz.course.title}</span>
                                            </Badge>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
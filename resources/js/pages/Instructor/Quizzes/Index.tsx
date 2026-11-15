import { usePage, Link, useForm, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trophy, Clock, Eye, BarChart2 } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    pass_mark: number;
    time_limit: number | null;
    questions_count: number;
    attempts_count: number;
    course: { id: number; title: string } | null;
}

interface Course {
    id: number;
    title: string;
}

interface PageProps {
    quizzes: Quiz[];
    courses: Course[];
    [key: string]: unknown;
}

export default function Index() {
    const { quizzes, courses } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: '',
        course_id: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('instructor.quizzes.index'), { preserveState: true, preserveScroll: true });
    };

    const headerActions = (
        <Link href="/instructor/quizzes/create">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
            </Button>
        </Link>
    );

    return (
        <AppShell>
            <Head title="Quizzes" />
            <PageHeader
                eyebrow="Codexa MM"
                title="Quizzes"
                description="Manage quizzes for your courses."
                actions={headerActions}
            />

            <Card className="mt-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
                                Search
                            </label>
                            <Input
                                id="search"
                                placeholder="Search quizzes..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                            />
                        </div>
                        <div className="min-w-[200px]">
                            <label htmlFor="course_id" className="block text-sm font-medium text-slate-700 mb-1">
                                Course
                            </label>
                            <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Search className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {quizzes.length === 0 ? (
                <div className="mt-8 text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">No quizzes found</h3>
                    <p className="mt-2 text-slate-500">Create your first quiz to get started.</p>
                    <Link href="/instructor/quizzes/create" className="mt-4 inline-block">
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Quiz</Button>
                    </Link>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-md transition">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">{quiz.title}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                            {quiz.course && (
                                                <Badge variant="outline" className="gap-1">
                                                    {quiz.course.title}
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="gap-1">
                                                <Trophy className="h-3 w-3" />
                                                <span>Pass: {quiz.pass_mark}%</span>
                                            </Badge>
                                            {quiz.time_limit && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{quiz.time_limit} min</span>
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="gap-1">
                                                <span>{quiz.questions_count} questions</span>
                                            </Badge>
                                            <Badge variant="outline" className="gap-1">
                                                <BarChart2 className="h-3 w-3" />
                                                <span>{quiz.attempts_count} attempts</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/instructor/quizzes/${quiz.id}`}>
                                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                        </Link>
                                        <Link href={`/instructor/quizzes/${quiz.id}/results`}>
                                            <Button variant="ghost" size="icon"><BarChart2 className="h-4 w-4" /></Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
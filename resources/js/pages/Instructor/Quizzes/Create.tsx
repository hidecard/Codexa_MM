import { usePage, useForm, Link, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';

interface Course {
    id: number;
    title: string;
}

interface PageProps {
    courses: Course[];
    [key: string]: unknown;
}

export default function Create() {
    const { courses } = usePage<PageProps>().props;
    const { data, setData, post, processing } = useForm({
        course_id: '',
        title: '',
        description: '',
        pass_mark: 60,
        time_limit: '' as string | number,
        shuffle_questions: false,
        show_correct_answers: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('instructor.quizzes.store'));
    };

    const headerActions = (
        <Link href="/instructor/quizzes">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes</Button>
        </Link>
    );

    return (
        <AppShell>
            <Head title="Create Quiz" />
            <PageHeader
                eyebrow="Codexa MM"
                title="Create Quiz"
                description="Create a new quiz for your course."
                actions={headerActions}
            />

            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Enter the quiz details and select the course.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        <div>
                            <label htmlFor="course_id" className="block text-sm font-medium text-slate-700 mb-1">
                                Course *
                            </label>
                            <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                                Quiz Title *
                            </label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter quiz title"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Optional description for students"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="pass_mark" className="block text-sm font-medium text-slate-700 mb-1">
                                    Pass Mark (%) *
                                </label>
                                <Input
                                    id="pass_mark"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.pass_mark}
                                    onChange={(e) => setData('pass_mark', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="time_limit" className="block text-sm font-medium text-slate-700 mb-1">
                                    Time Limit (minutes, optional)
                                </label>
                                <Input
                                    id="time_limit"
                                    type="number"
                                    min="1"
                                    max="600"
                                    value={data.time_limit}
                                    onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="e.g., 30"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Configure how the quiz behaves for students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Shuffle Questions</p>
                                <p className="text-sm text-slate-500">Randomize question order for each attempt.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.shuffle_questions}
                                onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Show Correct Answers</p>
                                <p className="text-sm text-slate-500">Allow students to see correct answers after submission.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.show_correct_answers}
                                onChange={(e) => setData('show_correct_answers', e.target.checked)}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Link href="/instructor/quizzes">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Quiz
                    </Button>
                </div>
            </form>
        </AppShell>
    );
}
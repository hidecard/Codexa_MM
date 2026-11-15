import { usePage, useForm, Link, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical, ArrowLeft, Save, Eye } from 'lucide-react';

interface Option {
    id: number;
    text: string;
    is_correct: boolean;
    position: number;
}

interface Question {
    id: number;
    question: string;
    type: string;
    points: number;
    position: number;
    explanation: string | null;
    options: Option[];
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

interface PageProps {
    quiz: Quiz;
    [key: string]: unknown;
}

const questionTypes = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
] as const;

export default function Show() {
    const { quiz } = usePage<PageProps>().props;
    const questions = [...quiz.questions].sort((a, b) => a.position - b.position);

    const { data, setData, put, delete: destroy, processing } = useForm({
        title: quiz.title,
        description: quiz.description || '',
        pass_mark: quiz.pass_mark,
        time_limit: quiz.time_limit || '',
        shuffle_questions: quiz.shuffle_questions,
        show_correct_answers: quiz.show_correct_answers,
        questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            points: q.points,
            position: q.position,
            explanation: q.explanation || '',
            options: q.options.map((o) => ({
                id: o.id,
                text: o.text,
                is_correct: o.is_correct,
                position: o.position,
            })),
        })),
    });

    const addQuestion = () => {
        const newPosition = questions.length > 0 ? Math.max(...questions.map((q) => q.position)) + 1 : 1;
        const newQuestion = {
            id: Date.now(),
            question: '',
            type: 'single_choice' as const,
            points: 1,
            position: newPosition,
            explanation: '',
            options: [
                { id: Date.now(), text: '', is_correct: true, position: 1 },
                { id: Date.now() + 1, text: '', is_correct: false, position: 2 },
            ],
        };
        setData('questions', [...data.questions, newQuestion]);
    };

    const removeQuestion = (questionId: number) => {
        setData('questions', data.questions.filter((q: any) => q.id !== questionId));
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...data.questions];
        const newPosition = newQuestions[questionIndex].options.length + 1;
        newQuestions[questionIndex].options.push({
            id: Date.now(),
            text: '',
            is_correct: false,
            position: newPosition,
        });
        setData('questions', newQuestions);
    };

    const removeOption = (questionIndex: number, optionId: number) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((o: any) => o.id !== optionId);
        setData('questions', newQuestions);
    };

    const updateQuestion = (questionIndex: number, field: string, value: any) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex] = { ...newQuestions[questionIndex], [field]: value };
        setData('questions', newQuestions);
    };

    const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex].options = [...newQuestions[questionIndex].options];
        newQuestions[questionIndex].options[optionIndex] = { ...newQuestions[questionIndex].options[optionIndex], [field]: value };
        setData('questions', newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('instructor.quizzes.update', quiz.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            destroy(route('instructor.quizzes.destroy', quiz.id));
        }
    };

    const headerActions = (
        <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link href="/instructor/quizzes">
                <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </Link>
            <Link href={`/instructor/quizzes/${quiz.id}/results`}>
                <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> View Results</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </div>
    );

    return (
        <AppShell>
            <Head title={`Edit Quiz: ${quiz.title}`} />
            <PageHeader
                eyebrow="Codexa MM"
                title={quiz.title}
                description={quiz.course?.title}
                actions={headerActions}
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Quiz Details</TabsTrigger>
                        <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Edit the quiz title, description, and passing criteria.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
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
                    </TabsContent>

                    <TabsContent value="questions" className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <CardTitle className="text-lg">Questions</CardTitle>
                            <Button variant="outline" onClick={addQuestion}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>
                        </div>

                        {data.questions.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-slate-500">No questions yet. Click "Add Question" to create your first question.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {data.questions.map((question: any, qIndex: number) => (
                                    <Card key={question.id} className="overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                                                    <span className="font-medium text-slate-900">Question {qIndex + 1}</span>
                                                    <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
                                                    <Badge variant="outline">{question.points} pts</Badge>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                                        Question Text *
                                                    </label>
                                                    <Textarea
                                                        value={question.question}
                                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                        placeholder="Enter your question"
                                                        rows={2}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:grid-cols-3 sm:col-span-2">
                                                    <Select value={question.type} onValueChange={(v) => updateQuestion(qIndex, 'type', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Question type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {questionTypes.map((t) => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                                            Points
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={question.points}
                                                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                                            Explanation (shown after submission)
                                                        </label>
                                                        <Textarea
                                                            value={question.explanation}
                                                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                            placeholder="Optional explanation"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-200">
                                                <h5 className="font-medium text-slate-700 mb-3">Options</h5>
                                                <div className="space-y-2">
                                                    {question.options.map((option: any, oIndex: number) => (
                                                        <div key={option.id} className="flex items-center gap-2">
                                                            <Input
                                                                placeholder="Option text"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                                className="flex-1"
                                                                required
                                                            />
                                                            {(question.type === 'single_choice' || question.type === 'true_false') ? (
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct_${question.id}`}
                                                                        checked={option.is_correct}
                                                                        onChange={() => {
                                                                            const newQuestions = [...data.questions];
                                                                            newQuestions[qIndex].options.forEach((_, i: number) => {
                                                                                newQuestions[qIndex].options[i].is_correct = i === oIndex;
                                                                            });
                                                                            setData('questions', newQuestions);
                                                                        }}
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-sm text-slate-700">Correct</span>
                                                                </label>
                                                            ) : (
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={option.is_correct}
                                                                        onChange={(e) => updateOption(qIndex, oIndex, 'is_correct', e.target.checked)}
                                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-sm text-slate-700">Correct</span>
                                                                </label>
                                                            )}
                                                            <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, option.id)} disabled={question.options.length <= 1}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Option
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Settings</CardTitle>
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

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button variant="danger" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Quiz
                                </Button>
                                <p className="mt-2 text-sm text-slate-500">This will permanently delete the quiz and all its questions, options, and student attempts.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </AppShell>
    );
}
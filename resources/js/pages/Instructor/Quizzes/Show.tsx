import { useState, type FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip, LmsCard, PageIntro, Pill, btnAccentCls, btnDangerCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Option = { id: number; text: string; is_correct: boolean; position: number };
type Question = { id: number; question: string; type: string; points: number; position: number; explanation: string | null; options: Option[] };
type Quiz = {
    id: number;
    title: string;
    description: string | null;
    pass_mark: number;
    time_limit: number | null;
    shuffle_questions: boolean;
    show_correct_answers: boolean;
    course: { id: number; title: string } | null;
    questions: Question[];
};

const questionTypes = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
] as const;

type FormQuestion = {
    id: number;
    question: string;
    type: string;
    points: number;
    position: number;
    explanation: string;
    options: { id: number; text: string; is_correct: boolean; position: number }[];
};

export default function Show({ quiz }: { quiz: Quiz }) {
    const [tab, setTab] = useState<'details' | 'questions' | 'settings'>('details');
    const questions = [...(quiz.questions ?? [])].sort((a, b) => a.position - b.position);

    const { data, setData, put, delete: destroy, processing } = useForm({
        title: quiz.title,
        description: quiz.description || '',
        pass_mark: quiz.pass_mark,
        time_limit: quiz.time_limit || ('' as string | number),
        shuffle_questions: quiz.shuffle_questions,
        show_correct_answers: quiz.show_correct_answers,
        questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            points: q.points,
            position: q.position,
            explanation: q.explanation || '',
            options: q.options.map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, position: o.position })),
        })) as FormQuestion[],
    });

    const addQuestion = () => {
        const newPosition = data.questions.length > 0 ? Math.max(...data.questions.map((q) => q.position)) + 1 : 1;
        const now = Date.now();
        setData('questions', [
            ...data.questions,
            {
                id: now,
                question: '',
                type: 'single_choice',
                points: 1,
                position: newPosition,
                explanation: '',
                options: [
                    { id: now, text: '', is_correct: true, position: 1 },
                    { id: now + 1, text: '', is_correct: false, position: 2 },
                ],
            },
        ]);
    };

    const removeQuestion = (questionId: number) => setData('questions', data.questions.filter((q) => q.id !== questionId));

    const addOption = (questionIndex: number) => {
        const next = [...data.questions];
        next[questionIndex] = {
            ...next[questionIndex],
            options: [...next[questionIndex].options, { id: Date.now(), text: '', is_correct: false, position: next[questionIndex].options.length + 1 }],
        };
        setData('questions', next);
    };

    const removeOption = (questionIndex: number, optionId: number) => {
        const next = [...data.questions];
        next[questionIndex] = { ...next[questionIndex], options: next[questionIndex].options.filter((o) => o.id !== optionId) };
        setData('questions', next);
    };

    const updateQuestion = (questionIndex: number, field: keyof Omit<FormQuestion, 'id' | 'options'>, value: string | number) => {
        const next = [...data.questions];
        next[questionIndex] = { ...next[questionIndex], [field]: value };
        setData('questions', next);
    };

    const updateOption = (questionIndex: number, optionIndex: number, field: 'text' | 'is_correct', value: string | boolean) => {
        const next = [...data.questions];
        const options = [...next[questionIndex].options];
        options[optionIndex] = { ...options[optionIndex], [field]: value };
        next[questionIndex] = { ...next[questionIndex], options };
        setData('questions', next);
    };

    const markSingleCorrect = (questionIndex: number, optionIndex: number) => {
        const next = [...data.questions];
        next[questionIndex] = {
            ...next[questionIndex],
            options: next[questionIndex].options.map((o, i) => ({ ...o, is_correct: i === optionIndex })),
        };
        setData('questions', next);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/instructor/quizzes/${quiz.id}`);
    };

    const handleDelete = () => {
        if (confirm('ဒီ quiz ကို ဖျက်မှာ သေချာပါသလား? မေးခွန်းနဲ့ ကျောင်းသား ဖြေဆိုမှုတွေပါ ပျက်သွားပါမယ်။')) {
            destroy(`/instructor/quizzes/${quiz.id}`);
        }
    };

    return (
        <LmsShell title={quiz.title} nav="instructor">
            <Head title={`Quiz ပြင်ဆင်ရန် · ${quiz.title}`} />
            <PageIntro
                title={quiz.title}
                description={quiz.course?.title}
                actions={
                    <>
                        <Link href="/instructor/quizzes" className={btnGhostCls}>
                            <ArrowLeft className="size-4" /> Quiz အားလုံး
                        </Link>
                        <Link href={`/instructor/quizzes/${quiz.id}/results`} className={btnGhostCls}>
                            <Eye className="size-4" /> ရလဒ် ကြည့်ရန်
                        </Link>
                        <button type="button" className={btnAccentCls} disabled={processing} onClick={handleSubmit}>
                            <Save className="size-4" /> သိမ်းရန်
                        </button>
                    </>
                }
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'details'} onClick={() => setTab('details')}>
                        Quiz အသေးစိတ်
                    </Chip>
                    <Chip active={tab === 'questions'} onClick={() => setTab('questions')}>
                        မေးခွန်းများ ({data.questions.length})
                    </Chip>
                    <Chip active={tab === 'settings'} onClick={() => setTab('settings')}>
                        ချိန်ညှိမှုများ
                    </Chip>
                </div>

                {tab === 'details' && (
                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`text-lg font-extrabold ${inkCls}`}>အခြေခံ အချက်အလက်</h2>
                        <div className="mt-4 space-y-4">
                            <Input label="Quiz ခေါင်းစဉ် *" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                            <div>
                                <label className={labelCls}>ဖော်ပြချက်</label>
                                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="အောင်မှတ် (%) *" type="number" min={0} max={100} value={data.pass_mark} onChange={(e) => setData('pass_mark', parseInt(e.target.value) || 0)} required />
                                <Input
                                    label="အချိန်ကန့်သတ်ချက် (မိနစ်, optional)"
                                    type="number"
                                    min={1}
                                    max={600}
                                    value={data.time_limit}
                                    onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                />
                            </div>
                        </div>
                    </LmsCard>
                )}

                {tab === 'questions' && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className={`text-lg font-extrabold ${inkCls}`}>မေးခွန်းများ</h2>
                            <button type="button" className={btnGhostCls} onClick={addQuestion}>
                                <Plus className="size-4" /> မေးခွန်း ထည့်ရန်
                            </button>
                        </div>
                        {data.questions.length === 0 ? (
                            <LmsCard className="p-12 text-center">
                                <p className={mutedCls}>မေးခွန်း မရှိသေးပါ — "မေးခွန်း ထည့်ရန်" နဲ့ ပထမဆုံး မေးခွန်း ဖန်တီးပါ။</p>
                            </LmsCard>
                        ) : (
                            <div className="space-y-4">
                                {data.questions.map((question, qIndex) => (
                                    <LmsCard key={question.id} className="overflow-hidden p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <GripVertical className="size-5 text-slate-400" />
                                                <span className={`font-medium ${inkCls}`}>မေးခွန်း {qIndex + 1}</span>
                                                <Pill tone="slate">{question.type.replace('_', ' ')}</Pill>
                                                <Pill tone="blue">{question.points} မှတ်</Pill>
                                            </div>
                                            <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => removeQuestion(question.id)}>
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className={labelCls}>မေးခွန်း *</label>
                                                <Textarea value={question.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} rows={2} required />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div>
                                                    <label className={labelCls}>အမျိုးအစား</label>
                                                    <select className={inputCls} value={question.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}>
                                                        {questionTypes.map((t) => (
                                                            <option key={t.value} value={t.value}>
                                                                {t.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <Input label="အမှတ်" type="number" min={1} max={100} value={question.points} onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)} />
                                                <div>
                                                    <label className={labelCls}>ရှင်းလင်းချက် (တင်သွင်းပြီးနောက် ပြရန်)</label>
                                                    <Textarea value={question.explanation} onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)} rows={2} />
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-100 pt-4 dark:border-[#18264a]">
                                                <h5 className={`mb-3 font-medium ${inkCls}`}>ရွေးချယ်စရာများ</h5>
                                                <div className="space-y-2">
                                                    {question.options.map((option, oIndex) => (
                                                        <div key={option.id} className="flex items-center gap-2">
                                                            <Input
                                                                placeholder="ရွေးချယ်မှု စာသား"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                                className="flex-1"
                                                                required
                                                            />
                                                            {question.type === 'single_choice' || question.type === 'true_false' ? (
                                                                <label className={cn('flex cursor-pointer items-center gap-2 text-sm', mutedCls)}>
                                                                    <input type="radio" name={`correct_${question.id}`} checked={option.is_correct} onChange={() => markSingleCorrect(qIndex, oIndex)} className="size-4 accent-teal-700" />
                                                                    အဖြေမှန်
                                                                </label>
                                                            ) : (
                                                                <label className={cn('flex cursor-pointer items-center gap-2 text-sm', mutedCls)}>
                                                                    <input type="checkbox" checked={option.is_correct} onChange={(e) => updateOption(qIndex, oIndex, 'is_correct', e.target.checked)} className="size-4 accent-teal-700" />
                                                                    အဖြေမှန်
                                                                </label>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-40 dark:hover:bg-rose-950/40"
                                                                onClick={() => removeOption(qIndex, option.id)}
                                                                disabled={question.options.length <= 1}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button type="button" className={btnGhostCls} onClick={() => addOption(qIndex)}>
                                                        <Plus className="size-4" /> ရွေးချယ်မှု ထည့်ရန်
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </LmsCard>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="space-y-6">
                        <LmsCard className="p-5 sm:p-6">
                            <h2 className={`text-lg font-extrabold ${inkCls}`}>Quiz ချိန်ညှိမှုများ</h2>
                            <div className="mt-4 space-y-4">
                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <span>
                                        <span className={cn('block font-medium', inkCls)}>မေးခွန်း အစီအစဉ် ကျပန်းလုပ်ရန်</span>
                                        <span className={cn('text-sm', mutedCls)}>ဖြေဆိုမှု တစ်ကြိမ်ချင်းမှာ မေးခွန်း အစီအစဉ် ပြောင်းလဲပေးပါမယ်။</span>
                                    </span>
                                    <input type="checkbox" checked={data.shuffle_questions} onChange={(e) => setData('shuffle_questions', e.target.checked)} className="size-5 accent-teal-700" />
                                </label>
                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <span>
                                        <span className={cn('block font-medium', inkCls)}>အဖြေမှန် ပြရန်</span>
                                        <span className={cn('text-sm', mutedCls)}>တင်သွင်းပြီးနောက် ကျောင်းသားတွေ အဖြေမှန်ကို ကြည့်နိုင်ပါမယ်။</span>
                                    </span>
                                    <input type="checkbox" checked={data.show_correct_answers} onChange={(e) => setData('show_correct_answers', e.target.checked)} className="size-5 accent-teal-700" />
                                </label>
                            </div>
                        </LmsCard>

                        <LmsCard className="border-rose-200 p-5 sm:p-6 dark:border-rose-900/50">
                            <h2 className="text-lg font-extrabold text-rose-600">အန္တရာယ် ဇုန်</h2>
                            <p className={`mt-1 text-sm ${mutedCls}`}>Quiz ကို ဖျက်ရင် မေးခွန်း၊ ရွေးချယ်မှုနဲ့ ကျောင်းသား ဖြေဆိုမှုတွေပါ အပြီးတိုင် ပျက်သွားပါမယ်။</p>
                            <button type="button" className={`${btnDangerCls} mt-4`} onClick={handleDelete}>
                                <Trash2 className="size-4" /> Quiz ဖျက်ရန်
                            </button>
                        </LmsCard>
                    </div>
                )}
            </form>
        </LmsShell>
    );
}

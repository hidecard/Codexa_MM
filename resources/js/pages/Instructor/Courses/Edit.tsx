import { useState, type FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronDown, Eye, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip, LmsCard, PageIntro, Pill, btnAccentCls, btnDangerCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Category = { id: number; name: string };
type Lesson = { id: number; title: string; content?: string | null; duration: number; position: number; type: string; is_free: boolean };
type Module = { id: number; title: string; description?: string | null; position: number; lessons: Lesson[] };
type Course = {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    price: string | number;
    sale_price?: string | number | null;
    pricing_type: string;
    status: string;
    level: string;
    language: string;
    duration: number;
    modules: Module[];
};

function LessonRow({ courseId, moduleId, lesson }: { courseId: number; moduleId: number; lesson: Lesson }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ title: lesson.title, content: lesson.content ?? '', duration: lesson.duration, position: lesson.position, type: lesson.type, is_free: lesson.is_free });
    const save = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) });
    };
    const del = () => {
        if (confirm('ဒီ သင်ခန်းစာကို ဖျက်မှာ သေချာပါသလား?')) router.delete(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`, { preserveScroll: true });
    };
    if (!editing) {
        return (
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f]">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold ${inkCls}`}>{lesson.title}</span>
                    <Pill tone="slate">{lesson.type}</Pill>
                    {lesson.is_free && <Pill tone="teal">အခမဲ့ ကြည့်ရန်</Pill>}
                    <span className={mutedCls}>{lesson.duration} မိနစ်</span>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" onClick={() => setEditing(true)}>
                        ပြင်ရန်
                    </button>
                    <button type="button" className="font-semibold text-rose-600 hover:text-rose-700" onClick={del}>
                        ဖျက်ရန်
                    </button>
                </div>
            </li>
        );
    }
    return (
        <li className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 dark:border-teal-900 dark:bg-teal-950/20">
            <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
                <Input label="သင်ခန်းစာ ခေါင်းစဉ်" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                <div>
                    <label className={labelCls}>အမျိုးအစား</label>
                    <select className={inputCls} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                    </select>
                </div>
                <Input label="ကြာချိန် (မိနစ်)" type="number" min={0} value={form.data.duration} onChange={(e) => form.setData('duration', Number(e.target.value))} />
                <Input label="အစီအစဉ်" type="number" min={1} value={form.data.position} onChange={(e) => form.setData('position', Number(e.target.value))} />
                <div className="sm:col-span-2">
                    <label className={labelCls}>အကြောင်းအရာ / Video URL</label>
                    <Textarea rows={2} value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} />
                </div>
                <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                    <input type="checkbox" checked={form.data.is_free} onChange={(e) => form.setData('is_free', e.target.checked)} /> အခမဲ့ ကြည့်ခွင့်
                </label>
                <div className="flex gap-2 sm:col-span-2">
                    <button type="submit" className={btnAccentCls} disabled={form.processing}>
                        သိမ်းရန်
                    </button>
                    <button type="button" className={btnGhostCls} onClick={() => setEditing(false)}>
                        မလုပ်တော့ပါ
                    </button>
                </div>
            </form>
        </li>
    );
}

function ModuleBlock({ courseId, module }: { courseId: number; module: Module }) {
    const [open, setOpen] = useState(true);
    const modForm = useForm({ title: module.title, description: module.description ?? '', position: module.position });
    const lessonForm = useForm({ title: '', content: '', duration: 0, position: (module.lessons.length || 0) + 1, type: 'video', is_free: false });
    const saveModule = (e: FormEvent) => {
        e.preventDefault();
        modForm.put(`/instructor/courses/${courseId}/modules/${module.id}`, { preserveScroll: true });
    };
    const addLesson = (e: FormEvent) => {
        e.preventDefault();
        lessonForm.post(`/instructor/courses/${courseId}/modules/${module.id}/lessons`, { preserveScroll: true, onSuccess: () => lessonForm.reset('title', 'content') });
    };
    const delModule = () => {
        if (confirm('ဒီ အခန်းနဲ့ သင်ခန်းစာတွေကို ဖျက်မှာ သေချာပါသလား?')) router.delete(`/instructor/courses/${courseId}/modules/${module.id}`, { preserveScroll: true });
    };
    return (
        <LmsCard className="p-5">
            <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 text-left">
                    <ChevronDown className={cn('size-4 transition', mutedCls, !open && '-rotate-90')} />
                    <span>
                        <span className={`block text-sm font-semibold ${mutedCls}`}>အခန်း {module.position}</span>
                        <span className={`text-lg font-extrabold ${inkCls}`}>{module.title}</span>
                    </span>
                </button>
                <button type="button" className={btnDangerCls} onClick={delModule}>
                    <Trash2 className="size-4" /> ဖျက်ရန်
                </button>
            </div>
            {open && (
                <div className="mt-4 space-y-5">
                    <form onSubmit={saveModule} className="grid gap-3 sm:grid-cols-2">
                        <Input label="အခန်း ခေါင်းစဉ်" value={modForm.data.title} onChange={(e) => modForm.setData('title', e.target.value)} error={modForm.errors.title} />
                        <Input label="အစီအစဉ်" type="number" min={1} value={modForm.data.position} onChange={(e) => modForm.setData('position', Number(e.target.value))} />
                        <div className="sm:col-span-2">
                            <label className={labelCls}>ဖော်ပြချက်</label>
                            <Textarea rows={2} value={modForm.data.description} onChange={(e) => modForm.setData('description', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <button type="submit" className={btnAccentCls} disabled={modForm.processing}>
                                အခန်း သိမ်းရန်
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-slate-100 pt-4 dark:border-[#18264a]">
                        <p className={`text-sm font-bold ${inkCls}`}>သင်ခန်းစာများ ({module.lessons.length} ခု)</p>
                        {module.lessons.length === 0 ? (
                            <p className={`mt-2 text-sm ${mutedCls}`}>သင်ခန်းစာ မရှိသေးပါ။</p>
                        ) : (
                            <ul className="mt-2 space-y-2">
                                {module.lessons.map((l) => (
                                    <LessonRow key={l.id} courseId={courseId} moduleId={module.id} lesson={l} />
                                ))}
                            </ul>
                        )}
                        <form onSubmit={addLesson} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 dark:bg-[#12234a]">
                            <p className={`text-sm font-bold sm:col-span-2 ${inkCls}`}>သင်ခန်းစာ အသစ် ထည့်ရန်</p>
                            <Input label="ခေါင်းစဉ်" value={lessonForm.data.title} onChange={(e) => lessonForm.setData('title', e.target.value)} error={lessonForm.errors.title} required />
                            <div>
                                <label className={labelCls}>အမျိုးအစား</label>
                                <select className={inputCls} value={lessonForm.data.type} onChange={(e) => lessonForm.setData('type', e.target.value)}>
                                    <option value="video">Video</option>
                                    <option value="text">Text</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="assignment">Assignment</option>
                                </select>
                            </div>
                            <Input label="ကြာချိန် (မိနစ်)" type="number" min={0} value={lessonForm.data.duration} onChange={(e) => lessonForm.setData('duration', Number(e.target.value))} />
                            <Input label="အစီအစဉ်" type="number" min={1} value={lessonForm.data.position} onChange={(e) => lessonForm.setData('position', Number(e.target.value))} />
                            <div className="sm:col-span-2">
                                <label className={labelCls}>အကြောင်းအရာ / Video URL</label>
                                <Textarea rows={2} value={lessonForm.data.content} onChange={(e) => lessonForm.setData('content', e.target.value)} />
                            </div>
                            <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                                <input type="checkbox" checked={lessonForm.data.is_free} onChange={(e) => lessonForm.setData('is_free', e.target.checked)} /> အခမဲ့ ကြည့်ခွင့်
                            </label>
                            <div className="sm:col-span-2">
                                <button type="submit" className={btnAccentCls} disabled={lessonForm.processing}>
                                    သင်ခန်းစာ ထည့်ရန်
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LmsCard>
    );
}

export default function Edit({ course, categories = [] }: { course: Course; categories: Category[] }) {
    const [tab, setTab] = useState<'details' | 'curriculum'>('details');
    const { data, setData, put, processing, errors } = useForm({
        category_id: course.category_id,
        title: course.title,
        slug: course.slug,
        short_description: course.short_description ?? '',
        description: course.description ?? '',
        price: Number(course.price ?? 0),
        sale_price: course.sale_price ?? '',
        pricing_type: course.pricing_type,
        status: course.status,
        level: course.level,
        language: course.language ?? 'en',
        duration: course.duration ?? 0,
    });
    const moduleForm = useForm({ title: '', description: '', position: (course.modules?.length || 0) + 1 });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/instructor/courses/${course.id}`);
    };
    const addModule = (e: FormEvent) => {
        e.preventDefault();
        moduleForm.post(`/instructor/courses/${course.id}/modules`, { preserveScroll: true, onSuccess: () => moduleForm.reset('title', 'description') });
    };

    return (
        <LmsShell title="သင်တန်း ပြင်ဆင်ရန်" nav="instructor">
            <Head title={`ပြင်ဆင်ရန် · ${course.title}`} />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="သင်တန်း ပြင်ဆင်ရန်"
                description={course.title}
                actions={
                    <>
                        {course.status === 'published' ? <Pill tone="teal">PUBLISHED</Pill> : course.status === 'archived' ? <Pill tone="slate">ARCHIVED</Pill> : <Pill tone="amber">DRAFT</Pill>}
                        <Link href={`/courses/${course.slug}`} className={btnGhostCls}>
                            <Eye className="size-4" /> ကြည့်ရန်
                        </Link>
                        <Link href="/instructor/courses" className={btnGhostCls}>
                            <ChevronLeft className="size-4" /> သင်တန်းများ
                        </Link>
                    </>
                }
            />

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'details'} onClick={() => setTab('details')}>
                    အခြေခံ အချက်အလက်
                </Chip>
                <Chip active={tab === 'curriculum'} onClick={() => setTab('curriculum')}>
                    သင်ရိုး (Curriculum) · {(course.modules ?? []).length} အခန်း
                </Chip>
            </div>

            {tab === 'details' && (
                <LmsCard className="mt-6 p-5 sm:p-6">
                    <form onSubmit={submit} className="grid gap-5">
                        <Input label="သင်တန်း ခေါင်းစဉ်" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                            <div>
                                <label className={labelCls}>Category</label>
                                <select className={inputCls} value={data.category_id} onChange={(e) => setData('category_id', Number(e.target.value))}>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input label="အကျဉ်းချုပ် ဖော်ပြချက်" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} error={errors.short_description} />
                        <div>
                            <label className={labelCls}>အသေးစိတ် ဖော်ပြချက်</label>
                            <Textarea rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className={labelCls}>ဈေးနှုန်း အမျိုးအစား</label>
                                <select className={inputCls} value={data.pricing_type} onChange={(e) => setData('pricing_type', e.target.value)}>
                                    <option value="free">အခမဲ့ (Free)</option>
                                    <option value="paid">ပေးချေရမည် (Paid)</option>
                                    <option value="package">Package</option>
                                </select>
                            </div>
                            <Input label="ဈေးနှုန်း (ကျပ်)" type="number" min={0} value={data.price} onChange={(e) => setData('price', Number(e.target.value))} error={errors.price} />
                            <div>
                                <label className={labelCls}>အခြေအနေ</label>
                                <select className={inputCls} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className={labelCls}>အဆင့်</label>
                                <select className={inputCls} value={data.level} onChange={(e) => setData('level', e.target.value)}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <Input label="ဘာသာစကား" value={data.language} onChange={(e) => setData('language', e.target.value)} />
                            <Input label="ကြာချိန် (နာရီ)" type="number" min={0} value={data.duration} onChange={(e) => setData('duration', Number(e.target.value))} />
                        </div>
                        <div>
                            <button type="submit" className={btnAccentCls} disabled={processing}>
                                ပြောင်းလဲမှု သိမ်းရန်
                            </button>
                        </div>
                    </form>
                </LmsCard>
            )}

            {tab === 'curriculum' && (
                <section className="mt-6">
                    <h2 className={`text-xl font-extrabold ${inkCls}`}>သင်ရိုး (Curriculum)</h2>
                    <p className={`mt-1 text-sm ${mutedCls}`}>အခန်း (Module) နဲ့ သင်ခန်းစာတွေကို စီမံရန် — သင်ခန်းစာတိုင်းမှာ YouTube link ချိတ်နိုင်ပါတယ်။</p>
                    <div className="mt-5 space-y-4">
                        {(course.modules ?? []).map((m) => (
                            <ModuleBlock key={m.id} courseId={course.id} module={m} />
                        ))}
                    </div>
                    <LmsCard className="mt-4 p-5">
                        <p className={`text-sm font-bold ${inkCls}`}>အခန်း (Module) အသစ် ထည့်ရန်</p>
                        <form onSubmit={addModule} className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Input label="ခေါင်းစဉ်" value={moduleForm.data.title} onChange={(e) => moduleForm.setData('title', e.target.value)} error={moduleForm.errors.title} required />
                            <Input label="အစီအစဉ်" type="number" min={1} value={moduleForm.data.position} onChange={(e) => moduleForm.setData('position', Number(e.target.value))} />
                            <div className="sm:col-span-2">
                                <label className={labelCls}>ဖော်ပြချက်</label>
                                <Textarea rows={2} value={moduleForm.data.description} onChange={(e) => moduleForm.setData('description', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <button type="submit" className={btnAccentCls} disabled={moduleForm.processing}>
                                    <Plus className="size-4" /> အခန်း ထည့်ရန်
                                </button>
                            </div>
                        </form>
                    </LmsCard>
                </section>
            )}
        </LmsShell>
    );
}

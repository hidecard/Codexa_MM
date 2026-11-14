import { Head, Link, router, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, type FormEvent } from 'react';

type Category = { id: number; name: string };
type Lesson = { id: number; title: string; content?: string | null; duration: number; position: number; type: string; is_free: boolean };
type Module = { id: number; title: string; description?: string | null; position: number; lessons: Lesson[] };
type Course = { id: number; category_id: number; title: string; slug: string; short_description?: string | null; description?: string | null; price: string | number; sale_price?: string | number | null; pricing_type: string; status: string; level: string; language: string; duration: number; modules: Module[] };
const nav = [
    { label: 'Dashboard', href: '/instructor/dashboard' },
    { label: 'Courses', href: '/instructor/courses' },
];

function ModuleBlock({ courseId, module }: { courseId: number; module: Module }) {
    const [open, setOpen] = useState(true);
    const modForm = useForm({ title: module.title, description: module.description ?? '', position: module.position });
    const lessonForm = useForm({ title: '', content: '', duration: 0, position: (module.lessons.length || 0) + 1, type: 'video', is_free: false });
    const saveModule = (e: FormEvent) => { e.preventDefault(); modForm.put(`/instructor/courses/${courseId}/modules/${module.id}`, { preserveScroll: true }); };
    const addLesson = (e: FormEvent) => { e.preventDefault(); lessonForm.post(`/instructor/courses/${courseId}/modules/${module.id}/lessons`, { preserveScroll: true, onSuccess: () => lessonForm.reset('title', 'content') }); };
    const delModule = () => { if (confirm('Remove this module and its lessons?')) router.delete(`/instructor/courses/${courseId}/modules/${module.id}`, { preserveScroll: true }); };
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setOpen(!open)} className="text-left"><p className="text-sm font-semibold text-slate-500">Module {module.position}</p><h3 className="text-lg font-black text-slate-950">{module.title}</h3></button>
                    <Button type="button" variant="outline" size="sm" className="text-rose-600" onClick={delModule}>Remove</Button>
                </div>
                {open && (
                    <div className="mt-4 space-y-5">
                        <form onSubmit={saveModule} className="grid gap-3 sm:grid-cols-2">
                            <Input label="Module title" value={modForm.data.title} onChange={(e) => modForm.setData('title', e.target.value)} error={modForm.errors.title} />
                            <Input label="Position" type="number" min={1} value={modForm.data.position} onChange={(e) => modForm.setData('position', Number(e.target.value))} />
                            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={2} value={modForm.data.description} onChange={(e) => modForm.setData('description', e.target.value)} /></div>
                            <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={modForm.processing}>Save module</Button></div>
                        </form>

                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-sm font-bold text-slate-900">Lessons</p>
                            {module.lessons.length === 0 ? <p className="mt-2 text-sm text-slate-500">No lessons yet.</p> : (
                                <ul className="mt-2 space-y-2">
                                    {module.lessons.map((l) => (
                                        <LessonRow key={l.id} courseId={courseId} moduleId={module.id} lesson={l} />
                                    ))}
                                </ul>
                            )}
                            <form onSubmit={addLesson} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                                <p className="sm:col-span-2 text-sm font-bold text-slate-900">Add lesson</p>
                                <Input label="Title" value={lessonForm.data.title} onChange={(e) => lessonForm.setData('title', e.target.value)} error={lessonForm.errors.title} required />
                                <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={lessonForm.data.type} onChange={(e) => lessonForm.setData('type', e.target.value)}><option value="video">Video</option><option value="text">Text</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></div>
                                <Input label="Duration (min)" type="number" min={0} value={lessonForm.data.duration} onChange={(e) => lessonForm.setData('duration', Number(e.target.value))} />
                                <Input label="Position" type="number" min={1} value={lessonForm.data.position} onChange={(e) => lessonForm.setData('position', Number(e.target.value))} />
                                <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label><textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={2} value={lessonForm.data.content} onChange={(e) => lessonForm.setData('content', e.target.value)} /></div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={lessonForm.data.is_free} onChange={(e) => lessonForm.setData('is_free', e.target.checked)} /> Free preview</label>
                                <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={lessonForm.processing}>Add lesson</Button></div>
                            </form>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LessonRow({ courseId, moduleId, lesson }: { courseId: number; moduleId: number; lesson: Lesson }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ title: lesson.title, content: lesson.content ?? '', duration: lesson.duration, position: lesson.position, type: lesson.type, is_free: lesson.is_free });
    const save = (e: FormEvent) => { e.preventDefault(); form.put(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) }); };
    const del = () => { if (confirm('Remove this lesson?')) router.delete(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`, { preserveScroll: true }); };
    if (!editing) {
        return (
            <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{lesson.title}</span><Badge variant="outline">{lesson.type}</Badge>{lesson.is_free && <Badge variant="success">free</Badge>}<span className="text-slate-500">{lesson.duration} min</span></div>
                <div className="flex gap-2"><button type="button" className="font-semibold text-blue-600 hover:text-blue-700" onClick={() => setEditing(true)}>Edit</button><button type="button" className="font-semibold text-rose-600 hover:text-rose-700" onClick={del}>Remove</button></div>
            </li>
        );
    }
    return (
        <li className="rounded-xl border border-blue-200 bg-blue-50/30 p-3">
            <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
                <Input label="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}><option value="video">Video</option><option value="text">Text</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></div>
                <Input label="Duration (min)" type="number" min={0} value={form.data.duration} onChange={(e) => form.setData('duration', Number(e.target.value))} />
                <Input label="Position" type="number" min={1} value={form.data.position} onChange={(e) => form.setData('position', Number(e.target.value))} />
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.data.is_free} onChange={(e) => form.setData('is_free', e.target.checked)} /> Free preview</label>
                <div className="sm:col-span-2 flex gap-2"><Button type="submit" size="sm" disabled={form.processing}>Save</Button><Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button></div>
            </form>
        </li>
    );
}

export default function Edit({ course, categories = [] }: { course: Course; categories: Category[] }) {
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
    const submit = (e: FormEvent) => { e.preventDefault(); put(`/instructor/courses/${course.id}`); };
    const addModule = (e: FormEvent) => { e.preventDefault(); moduleForm.post(`/instructor/courses/${course.id}/modules`, { preserveScroll: true, onSuccess: () => moduleForm.reset('title', 'description') }); };

    return (
        <AppShell navItems={nav}>
            <Head title={`Edit · ${course.title}`} />
            <div className="mb-6 flex items-center justify-between gap-4"><Link href="/instructor/courses" className="text-sm font-semibold text-slate-600 hover:text-blue-700">← Back to courses</Link><Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'secondary'}>{course.status}</Badge></div>
            <h1 className="text-3xl font-black text-slate-950">Edit course</h1>

            <Card className="mt-6">
                <CardContent className="p-6">
                    <form onSubmit={submit} className="grid gap-5">
                        <Input label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.category_id} onChange={(e) => setData('category_id', Number(e.target.value))}>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <Input label="Short description" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} error={errors.short_description} />
                        <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} /></div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Pricing type</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.pricing_type} onChange={(e) => setData('pricing_type', e.target.value)}><option value="free">Free</option><option value="paid">Paid</option><option value="package">Package</option></select></div>
                            <Input label="Price (MMK)" type="number" min={0} value={data.price} onChange={(e) => setData('price', Number(e.target.value))} error={errors.price} />
                            <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Level</label><select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.level} onChange={(e) => setData('level', e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                            <Input label="Language" value={data.language} onChange={(e) => setData('language', e.target.value)} />
                            <Input label="Duration (hours)" type="number" min={0} value={data.duration} onChange={(e) => setData('duration', Number(e.target.value))} />
                        </div>
                        <div><Button type="submit" disabled={processing}>Save changes</Button></div>
                    </form>
                </CardContent>
            </Card>

            <section className="mt-10">
                <h2 className="text-2xl font-black text-slate-950">Curriculum</h2>
                <p className="mt-1 text-slate-600">Manage modules and lessons for this course.</p>
                <div className="mt-5 space-y-4">
                    {(course.modules ?? []).map((m) => <ModuleBlock key={m.id} courseId={course.id} module={m} />)}
                </div>
                <Card className="mt-4">
                    <CardContent className="p-5">
                        <p className="text-sm font-bold text-slate-900">Add module</p>
                        <form onSubmit={addModule} className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Input label="Title" value={moduleForm.data.title} onChange={(e) => moduleForm.setData('title', e.target.value)} error={moduleForm.errors.title} required />
                            <Input label="Position" type="number" min={1} value={moduleForm.data.position} onChange={(e) => moduleForm.setData('position', Number(e.target.value))} />
                            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={2} value={moduleForm.data.description} onChange={(e) => moduleForm.setData('description', e.target.value)} /></div>
                            <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={moduleForm.processing}>Add module</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </section>
        </AppShell>
    );
}

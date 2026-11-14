import { Head, Link, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FormEvent } from 'react';

type Category = { id: number; name: string };
const nav = [
    { label: 'Dashboard', href: '/instructor/dashboard' },
    { label: 'Courses', href: '/instructor/courses' },
];

export default function Create({ categories = [] }: { categories: Category[] }) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id ?? '',
        title: '',
        slug: '',
        short_description: '',
        description: '',
        price: 0,
        sale_price: '',
        pricing_type: 'free',
        status: 'draft',
        level: 'beginner',
        language: 'en',
        duration: 0,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/instructor/courses');
    };

    return (
        <AppShell navItems={nav}>
            <Head title="Create Course" />
            <div className="mb-6"><Link href="/instructor/courses" className="text-sm font-semibold text-slate-600 hover:text-blue-700">← Back to courses</Link></div>
            <h1 className="text-3xl font-black text-slate-950">Create course</h1>
            <Card className="mt-6">
                <CardContent className="p-6">
                    <form onSubmit={submit} className="grid gap-5">
                        <Input label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="Slug (optional)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.category_id} onChange={(e) => setData('category_id', Number(e.target.value))}>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="mt-1.5 text-sm text-rose-600">{errors.category_id}</p>}
                            </div>
                        </div>
                        <Input label="Short description" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} error={errors.short_description} />
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                            <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            {errors.description && <p className="mt-1.5 text-sm text-rose-600">{errors.description}</p>}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Pricing type</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.pricing_type} onChange={(e) => setData('pricing_type', e.target.value)}>
                                    <option value="free">Free</option><option value="paid">Paid</option><option value="package">Package</option>
                                </select>
                            </div>
                            <Input label="Price (MMK)" type="number" min={0} value={data.price} onChange={(e) => setData('price', Number(e.target.value))} error={errors.price} />
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Level</label>
                                <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={data.level} onChange={(e) => setData('level', e.target.value)}>
                                    <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <Input label="Language" value={data.language} onChange={(e) => setData('language', e.target.value)} error={errors.language} />
                            <Input label="Duration (hours)" type="number" min={0} value={data.duration} onChange={(e) => setData('duration', Number(e.target.value))} error={errors.duration} />
                        </div>
                        <div className="flex gap-3"><Button type="submit" disabled={processing}>Create course</Button><Link href="/instructor/courses" className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link></div>
                    </form>
                </CardContent>
            </Card>
        </AppShell>
    );
}

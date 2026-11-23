import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ClipboardList, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Assignment = { id: number; title: string; due_at?: string | null; max_score: number; submissions_count: number; course?: { id: number; title: string } | null };
type Course = { id: number; title: string };

export default function Index({ assignments = [], courses = [] }: { assignments: Assignment[]; courses: Course[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ course_id: courses[0]?.id ?? '', title: '', instructions: '', max_score: 100, due_at: '', allow_late_submission: false });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/instructor/assignments', { onSuccess: () => reset('title', 'instructions') });
    };

    return (
        <LmsShell title="Assignments" nav="instructor">
            <Head title="Assignments" />
            <PageIntro
                title="Assignments"
                description="သင်တန်းတွေအတွက် assignment ဖန်တီးပြီး ကျောင်းသားတွေ တင်သွင်းတာကို အမှတ်ပေးရန်"
            />

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3">
                    {assignments.length === 0 ? (
                        <EmptyBox title="Assignment မရှိသေးပါ" description="ညာဘက် form ကနေ ပထမဆုံး assignment ဖန်တီးနိုင်ပါတယ်" />
                    ) : (
                        assignments.map((a) => (
                            <Link key={a.id} href={`/instructor/assignments/${a.id}`} className="block">
                                <LmsCard className="p-5 transition hover:border-teal-300 dark:hover:border-teal-700">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <ClipboardList className={`size-4 flex-none ${mutedCls}`} />
                                                <h2 className={`text-lg font-extrabold ${inkCls}`}>{a.title}</h2>
                                            </div>
                                            <p className={`mt-1 text-sm ${mutedCls}`}>
                                                {a.course?.title}
                                                {a.due_at ? ` · နောက်ဆုံးရက် ${formatDate(a.due_at)}` : ''} · အမှတ်ပြည့် {a.max_score}
                                            </p>
                                        </div>
                                        <Pill tone="blue">{a.submissions_count} တင်သွင်းမှု</Pill>
                                    </div>
                                </LmsCard>
                            </Link>
                        ))
                    )}
                </div>

                <LmsCard className="h-fit p-5">
                    <h2 className={`flex items-center gap-2 text-lg font-extrabold ${inkCls}`}>
                        <Plus className="size-5" /> Assignment အသစ်
                    </h2>
                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div>
                            <label className={labelCls}>သင်တန်း</label>
                            <select className={inputCls} value={data.course_id} onChange={(e) => setData('course_id', Number(e.target.value))}>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                            {errors.course_id && <p className="mt-1 text-sm text-rose-600">{errors.course_id}</p>}
                        </div>
                        <Input label="ခေါင်းစဉ်" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                        <div>
                            <label className={labelCls}>ညွှန်ကြားချက်</label>
                            <Textarea rows={4} value={data.instructions} onChange={(e) => setData('instructions', e.target.value)} required />
                            {errors.instructions && <p className="mt-1 text-sm text-rose-600">{errors.instructions}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="အမှတ်ပြည့်" type="number" min={1} value={data.max_score} onChange={(e) => setData('max_score', Number(e.target.value))} error={errors.max_score} />
                            <Input label="နောက်ဆုံးရက်" type="datetime-local" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} error={errors.due_at} />
                        </div>
                        <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                            <input type="checkbox" checked={data.allow_late_submission} onChange={(e) => setData('allow_late_submission', e.target.checked)} /> နောက်ကျပြီး
                            တင်သွင်းခွင့် ပြုရန်
                        </label>
                        <button type="submit" className={`${btnAccentCls} w-full`} disabled={processing || courses.length === 0}>
                            ဖန်တီးရန်
                        </button>
                        {courses.length === 0 && <p className={`text-sm ${mutedCls}`}>အရင် သင်တန်း တစ်ခု ဖန်တီးပါ။</p>}
                    </form>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

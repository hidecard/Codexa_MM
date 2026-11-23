import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Announcement = {
    id: number;
    title: string;
    content: string;
    course_id: number | null;
    courseTitle?: string | null;
    is_published: boolean;
    published_at?: string | null;
    date?: string | null;
};

type Course = { id: number; title: string };

type Props = {
    announcements?: Announcement[];
    courses?: Course[];
    flash?: { success?: string | null };
};

export default function Index({ announcements = [], courses = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [courseId, setCourseId] = useState<number | ''>('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const resetForm = () => {
        setCourseId('');
        setTitle('');
        setContent('');
        setEditingId(null);
    };

    const startEdit = (a: Announcement) => {
        setEditingId(a.id);
        setCourseId(a.course_id ?? '');
        setTitle(a.title);
        setContent(a.content);
    };

    const submit = (publish: boolean) => (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!courseId || !title.trim() || !content.trim() || processing) return;
        setProcessing(true);
        const payload = { course_id: courseId, title: title.trim(), content: content.trim(), publish };
        const opts = {
            onFinish: () => setProcessing(false),
            onSuccess: () => resetForm(),
        };
        if (editingId) {
            router.put(`/instructor/announcements/${editingId}`, { course_id: courseId, title: title.trim(), content: content.trim() }, opts);
        } else {
            router.post('/instructor/announcements', payload, opts);
        }
    };

    const remove = (id: number) => {
        if (!window.confirm('ဤကြေညာချက်ကို ဖျက်မှာလား?')) return;
        router.delete(`/instructor/announcements/${id}`);
    };

    return (
        <LmsShell title="ကြေညာချက်များ" nav="instructor">
            <Head title="ကြေညာချက်များ" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="ကြေညာချက်များ"
                description="ကျောင်းသားတွေထံ ကြေညာချက် အသစ် ထုတ်ပြန်ရန် — ထုတ်ပြန်ပြီးတာနဲ့ ကျောင်းသားတွေရဲ့ ကြေညာချက် page မှာ ချက်ချင်း ပေါ်ပါတယ်"
            />

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3.5">
                    {announcements.length === 0 ? (
                        <EmptyBox title="ကြေညာချက် မရှိသေးပါ" description="ညာဘက် form မှာ ကြေညာချက် အသစ် ရေးနိုင်ပါတယ်" />
                    ) : (
                        announcements.map((a) => (
                            <LmsCard key={a.id} className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Megaphone className="size-4 text-teal-700 dark:text-teal-300" />
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{a.title}</p>
                                    {a.is_published ? <Pill tone="teal">ထုတ်ပြန်ပြီး</Pill> : <Pill tone="amber">Draft</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {a.courseTitle ? `${a.courseTitle} · ` : ''}
                                    {formatDate(a.date)}
                                </p>
                                <p className={`mt-2 text-[.88rem] leading-relaxed ${mutedCls}`}>{a.content}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button type="button" className={btnGhostCls} onClick={() => startEdit(a)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                    {a.is_published ? (
                                        <button type="button" className={btnGhostCls} onClick={() => router.post(`/instructor/announcements/${a.id}/unpublish`)}>
                                            Draft ပြန်လုပ်ရန်
                                        </button>
                                    ) : (
                                        <button type="button" className={btnGhostCls} onClick={() => router.post(`/instructor/announcements/${a.id}/publish`)}>
                                            ထုတ်ပြန်ရန်
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                                        onClick={() => remove(a.id)}
                                    >
                                        <Trash2 className="size-4" /> ဖျက်ရန်
                                    </button>
                                </div>
                            </LmsCard>
                        ))
                    )}
                </div>

                <LmsCard className="h-fit p-5">
                    <h2 className={`flex items-center gap-2 text-lg font-extrabold ${inkCls}`}>
                        <Plus className="size-5" /> {editingId ? 'ကြေညာချက် ပြင်ဆင်ရန်' : 'ကြေညာချက် အသစ် ရေးရန်'}
                    </h2>
                    <form onSubmit={submit(true)} className="mt-4 space-y-3">
                        <div>
                            <label className={labelCls}>သင်တန်း</label>
                            <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')} required>
                                <option value="">သင်တန်း ရွေးပါ</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input label="ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div>
                            <label className={labelCls}>အကြောင်းအရာ</label>
                            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                        </div>
                        <button type="submit" className={`${btnAccentCls} w-full`} disabled={processing}>
                            {editingId ? 'ပြင်ဆင်မှု သိမ်းရန်' : 'ထုတ်ပြန်ရန်'}
                        </button>
                        {!editingId && (
                            <button type="button" className={`${btnGhostCls} w-full`} disabled={processing} onClick={submit(false)}>
                                Draft အဖြစ် သိမ်းရန်
                            </button>
                        )}
                        {editingId && (
                            <button type="button" className={`${btnGhostCls} w-full`} onClick={resetForm}>
                                ပယ်ဖျက်ရန်
                            </button>
                        )}
                    </form>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

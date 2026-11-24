import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { Megaphone, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type AnnouncementRow = { id: number; title: string; content: string; course_id: number; course_title?: string | null; type: string; type_label?: string; audience: string; audience_label?: string; pinned: boolean; date: string; draft?: boolean };
type CourseOption = { id: number; title: string };

const TYPE_OPTIONS = [
    { value: 'general', label: 'အထွေထွေ' },
    { value: 'course', label: 'သင်တန်း' },
    { value: 'live', label: 'Live Class' },
    { value: 'promo', label: 'ပရိုမိုးရှင်း' },
    { value: 'system', label: 'စနစ်' },
];

const AUDIENCE_OPTIONS = [
    { value: 'all', label: 'ကျောင်းသား အားလုံး' },
    { value: 'students', label: 'ကျောင်းသားများ' },
    { value: 'instructors', label: 'ဆရာများ (ကျောင်းသား မမြင်ရ)' },
];

export default function Index({ announcements = [], courses = [] }: { announcements?: AnnouncementRow[]; courses?: CourseOption[] }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [courseId, setCourseId] = useState<number | ''>('');
    const [type, setType] = useState('general');
    const [audience, setAudience] = useState('all');
    const [pinned, setPinned] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [notice, setNotice] = useState('');

    const resetForm = () => {
        setTitle('');
        setContent('');
        setCourseId('');
        setType('general');
        setAudience('all');
        setPinned(false);
        setEditingId(null);
    };

    const startEdit = (a: AnnouncementRow) => {
        setTitle(a.title);
        setContent(a.content);
        setCourseId(a.course_id);
        setType(a.type);
        setAudience(a.audience);
        setPinned(a.pinned);
        setEditingId(a.id);
        setNotice('');
    };

    const submit = (e: FormEvent | React.MouseEvent, draft: boolean) => {
        e.preventDefault();
        if (!title.trim() || !courseId) return;
        const fields = { title: title.trim(), content: content.trim(), course_id: courseId, type, audience, is_pinned: pinned };
        const data = editingId ? fields : { ...fields, publish: !draft };
        const done = () => {
            resetForm();
            setNotice(editingId ? 'ကြေညာချက် ပြင်ဆင်ပြီးပါပြီ' : draft ? 'Draft အဖြစ် သိမ်းပြီးပါပြီ' : 'ကြေညာချက် ထုတ်ပြန်ပြီးပါပြီ');
        };
        if (editingId) {
            router.put(`/admin/academy/announcements/${editingId}`, data, { preserveScroll: true, onSuccess: done });
        } else {
            router.post('/admin/academy/announcements', data, { preserveScroll: true, onSuccess: done });
        }
    };

    const remove = (id: number) => {
        if (confirm('ဒီ ကြေညာချက်ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/announcements/${id}`, { preserveScroll: true, onSuccess: () => setNotice('ကြေညာချက် ဖျက်ပြီးပါပြီ') });
        }
    };

    return (
        <LmsShell title="ကြေညာချက် စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="ကြေညာချက် စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="ကြေညာချက် စီမံခန့်ခွဲမှု"
                description="ကြေညာချက် အသစ် ထုတ်ပြန်ရန် — ထုတ်ပြန်ပြီးတာနဲ့ ကျောင်းသားတွေရဲ့ ကြေညာချက် page မှာ ချက်ချင်း ပေါ်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3.5">
                    {announcements.length === 0 ? (
                        <EmptyBox title="ကြေညာချက် မရှိတော့ပါ" description="အပေါ်က form မှာ ကြေညာချက် အသစ် ရေးနိုင်ပါတယ်" />
                    ) : (
                        announcements.map((a) => (
                            <LmsCard key={a.id} className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Megaphone className="size-4 text-teal-700 dark:text-teal-300" />
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{a.title}</p>
                                    <Pill tone="blue">{a.type_label ?? a.type}</Pill>
                                    {a.pinned && (
                                        <Pill tone="amber">
                                            <Pin className="mr-1 size-3" /> Pin
                                        </Pill>
                                    )}
                                    {a.draft && <Pill tone="slate">မူကြမ်း</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {a.course_title ?? a.audience_label ?? a.audience} · {a.audience_label ?? a.audience} · {a.date}
                                </p>
                                <p className={`mt-2 text-[.88rem] leading-relaxed ${mutedCls}`}>{a.content}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {a.draft ? (
                                        <button
                                            type="button"
                                            className={btnGhostCls}
                                            onClick={() => router.post(`/admin/academy/announcements/${a.id}/publish`, {}, { preserveScroll: true, onSuccess: () => setNotice('ကြေညာချက် ထုတ်ပြန်ပြီးပါပြီ') })}
                                        >
                                            ထုတ်ပြန်ရန်
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className={btnGhostCls}
                                            onClick={() => router.post(`/admin/academy/announcements/${a.id}/unpublish`, {}, { preserveScroll: true, onSuccess: () => setNotice('ကြေညာချက် ပြန်ဖြုတ်ပြီးပါပြီ') })}
                                        >
                                            ပြန်ဖြုတ်ရန်
                                        </button>
                                    )}
                                    <button type="button" className={btnGhostCls} onClick={() => startEdit(a)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                    <button type="button" className={btnGhostCls} onClick={() => remove(a.id)}>
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
                    <form className="mt-4 space-y-3" onSubmit={(e) => submit(e, false)}>
                        <Input label="ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div>
                            <label className={labelCls}>အကြောင်းအရာ</label>
                            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>သင်တန်း (ကြေညာချက်က သင်တန်း တစ်ခုချင်းစီအတွက်ပါ)</label>
                            <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')} required>
                                <option value="">သင်တန်း ရွေးပါ</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>အမျိုးအစား</label>
                                <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
                                    {TYPE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>ပရိသတ်</label>
                                <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)}>
                                    {AUDIENCE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-5 accent-teal-700" />
                            အပေါ်ဆုံး မှာ Pin လုပ်ထားရန်
                        </label>
                        <button type="submit" className={`${btnAccentCls} w-full`}>
                            {editingId ? 'သိမ်းဆည်းရန်' : 'ထုတ်ပြန်ရန်'}
                        </button>
                        {!editingId && (
                            <button type="button" className={`${btnGhostCls} w-full`} onClick={(e) => submit(e, true)}>
                                Draft အဖြစ် သိမ်းရန်
                            </button>
                        )}
                        {editingId && (
                            <button type="button" className={`${btnGhostCls} w-full`} onClick={resetForm}>
                                ပြင်ဆင်မှု ပယ်ဖျက်ရန်
                            </button>
                        )}
                    </form>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

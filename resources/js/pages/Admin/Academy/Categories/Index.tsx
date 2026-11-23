import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type CategoryRow = { id: number; name: string; slug: string; description: string | null; is_active: boolean; courses: number; students: number };

export default function Index({ categories = [] }: { categories?: CategoryRow[] }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [notice, setNotice] = useState('');

    const resetForm = () => {
        setName('');
        setDescription('');
        setEditingId(null);
    };

    const startEdit = (c: CategoryRow) => {
        setName(c.name);
        setDescription(c.description ?? '');
        setEditingId(c.id);
        setNotice('');
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const data = { name: name.trim(), description: description.trim() || null };
        const done = () => {
            resetForm();
            setNotice(editingId ? 'Category ပြင်ဆင်ပြီးပါပြီ' : 'Category ထည့်ပြီးပါပြီ');
        };
        if (editingId) {
            router.put(`/admin/academy/categories/${editingId}`, data, { preserveScroll: true, onSuccess: done });
        } else {
            router.post('/admin/academy/categories', data, { preserveScroll: true, onSuccess: done });
        }
    };

    const remove = (id: number) => {
        if (confirm('ဒီ category ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/categories/${id}`, { preserveScroll: true, onSuccess: () => setNotice('Category ဖျက်ပြီးပါပြီ') });
        }
    };

    return (
        <LmsShell title="Category စီမံရန်" nav="admin">
            <Head title="Category စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="Category စီမံရန်"
                description="သင်တန်း နယ်ပယ်များ — အသစ် ထည့်ရင် သင်တန်းများ page ရဲ့ filter မှာပါ ချက်ချင်း ပေါ်လာပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    {notice}
                </div>
            )}

            <LmsCard className="mt-6 p-5">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <Plus className="size-5" /> {editingId ? 'Category ပြင်ဆင်ရန်' : 'Category အသစ် ထည့်ရန်'}
                </h2>
                <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
                    <input className={`${inputCls} min-w-[220px] flex-1 sm:max-w-sm`} placeholder="Category အမည် (English)" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input className={`${inputCls} min-w-[220px] flex-1 sm:max-w-sm`} placeholder="ဖော်ပြချက် (မထည့်လည်း ရပါတယ်)" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <button type="submit" className={btnAccentCls}>
                        {editingId ? 'သိမ်းဆည်းရန်' : 'ထည့်ရန်'}
                    </button>
                    {editingId && (
                        <button type="button" className={btnGhostCls} onClick={resetForm}>
                            ပယ်ဖျက်ရန်
                        </button>
                    )}
                </form>
                <p className={`mt-3 text-[.8rem] ${mutedCls}`}>သင်တန်းတွေ ချိတ်ထားတဲ့ category ကို ဖျက်လို့ မရပါ။ သင်တန်း မရှိတဲ့ category ကိုတော့ ဖျက်နိုင်ပါတယ်။</p>
            </LmsCard>

            {categories.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Category မရှိသေးပါ" description="အပေါ်က form မှာ category အသစ် ထည့်နိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {categories.map((c) => (
                        <LmsCard key={c.id} className="flex items-center gap-3.5 p-5">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                <FolderOpen className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`truncate text-[.95rem] font-extrabold ${inkCls}`}>{c.name}</p>
                                    {c.is_active ? <Pill tone="teal">Active</Pill> : <Pill tone="slate">ပိတ်ထား</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    သင်တန်း {c.courses} ခု · ကျောင်းသား {formatNumber(c.students)} ဦး
                                </p>
                                {c.description && <p className={`mt-1 truncate text-[.8rem] ${mutedCls}`}>{c.description}</p>}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className={btnGhostCls}
                                        onClick={() =>
                                            router.post(`/admin/academy/categories/${c.id}/toggle`, {}, { preserveScroll: true, onSuccess: () => setNotice(c.is_active ? 'Category ပိတ်ထားပြီးပါပြီ' : 'Category ဖွင့်ပြီးပါပြီ') })
                                        }
                                    >
                                        {c.is_active ? 'ပိတ်ရန်' : 'ဖွင့်ရန်'}
                                    </button>
                                    <button type="button" className={btnGhostCls} onClick={() => startEdit(c)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                    {c.courses === 0 && (
                                        <button type="button" className={btnGhostCls} onClick={() => remove(c.id)}>
                                            <Trash2 className="size-4" /> ဖျက်ရန်
                                        </button>
                                    )}
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

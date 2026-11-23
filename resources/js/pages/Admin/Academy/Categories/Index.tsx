import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_CATEGORIES } from '@/pages/Admin/Academy/_sample';

type CategoryRow = { id: number; name: string; slug: string; courses: number; students: number; custom?: boolean };

export default function Index({ categories }: { categories?: CategoryRow[] }) {
    // SAMPLE DATA fallback (prototype): used until Admin/Academy/CategoryController is wired.
    const [items, setItems] = useState<CategoryRow[]>(
        categories ??
            SAMPLE_CATEGORIES.map((c, i) => ({ id: i + 1, name: c.name, slug: c.name.toLowerCase().replace(/\s+/g, '-'), courses: c.courses, students: c.students })),
    );
    const [name, setName] = useState('');
    const [notice, setNotice] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setItems([...items, { id: Date.now(), name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-'), courses: 0, students: 0, custom: true }]);
        setName('');
        setNotice('Category ထည့်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const remove = (id: number) => {
        const cat = items.find((c) => c.id === id);
        if (!cat?.custom) {
            setNotice('မူလ category တွေကို ဖျက်လို့ မရပါ (သင်တန်းတွေ ချိတ်ထားလို့ပါ)');
            return;
        }
        setItems(items.filter((c) => c.id !== id));
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
                    <Plus className="size-5" /> Category အသစ် ထည့်ရန်
                </h2>
                <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
                    <input className={`${inputCls} min-w-[220px] flex-1 sm:max-w-sm`} placeholder="Category အမည် (English)" value={name} onChange={(e) => setName(e.target.value)} required />
                    <button type="submit" className={btnAccentCls}>
                        ထည့်ရန်
                    </button>
                </form>
                <p className={`mt-3 text-[.8rem] ${mutedCls}`}>
                    မူလ category တွေကို ဖျက်လို့ မရပါ (သင်တန်းတွေ ချိတ်ထားလို့ပါ)။ ကိုယ် ထည့်ထားတဲ့ category ကိုတော့ သင်တန်း မရှိရင် ဖျက်နိုင်ပါတယ်။
                </p>
            </LmsCard>

            {items.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Category မရှိသေးပါ" description="အပေါ်က form မှာ category အသစ် ထည့်နိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((c) => (
                        <LmsCard key={c.id} className="flex items-center gap-3.5 p-5">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                <FolderOpen className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`truncate text-[.95rem] font-extrabold ${inkCls}`}>{c.name}</p>
                                    {c.custom && <Pill tone="violet">အသစ်</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    သင်တန်း {c.courses} ခု · ကျောင်းသား {formatNumber(c.students)} ဦး
                                </p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(c.id)}>
                                <Trash2 className="size-4" />
                            </button>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

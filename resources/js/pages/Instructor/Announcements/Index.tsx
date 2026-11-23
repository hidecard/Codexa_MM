import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Megaphone, Pin, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Announcement = {
    id: number;
    title: string;
    content: string;
    type: string;
    courseTitle?: string | null;
    pinned?: boolean;
    date: string;
};

// SAMPLE DATA fallback (prototype): route is a closure with no props yet, and
// there is no instructor announcement store endpoint yet — creating here is
// local-only until the coordinator wires POST /instructor/announcements.
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'React Hooks Deep Dive — Live Session ညနေ 7:00', content: 'ယနေ့ ညနေ 7:00 မှာ useState, useEffect နဲ့ custom hooks တွေကို live coding နဲ့တကွ ရှင်းပြပါမယ်။ မေးခွန်းတွေ ကြိုတင် ပြင်ဆင်ထားပါ။', type: 'Live', courseTitle: 'React.js Complete Course', pinned: true, date: 'ယနေ့' },
    { id: 2, title: 'Assignment 3 — Portfolio Project နောက်ဆုံးရက် တိုးပေးခြင်း', content: 'Portfolio project တင်သွင်းရမယ့် နောက်ဆုံးရက်ကို နိုဝင်ဘာ 30 အထိ တိုးပေးလိုက်ပါတယ်။ GitHub repo link နဲ့အတူ တင်ပေးပါ။', type: 'သင်တန်း', courseTitle: 'HTML & CSS Foundations', date: 'မနေ့က' },
    { id: 3, title: 'Quiz 2 ရလဒ်များ ထွက်ပါပြီ', content: 'JavaScript Quiz 2 ရဲ့ ရလဒ်တွေကို ကြည့်နိုင်ပါပြီ။ ပျမ်းမျှ 78% ရရှိပါတယ် — Async အခန်းကို ပြန်လေ့လာဖို့ အကြံပေးပါတယ်။', type: 'သင်တန်း', courseTitle: 'React.js Complete Course', date: 'နိုဝင်ဘာ 20' },
];

export default function Index({ announcements }: { announcements?: Announcement[] }) {
    const [items, setItems] = useState<Announcement[]>(announcements ?? SAMPLE_ANNOUNCEMENTS);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('သင်တန်း');
    const [pinned, setPinned] = useState(false);
    const [notice, setNotice] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setItems([{ id: Date.now(), title: title.trim(), content: content.trim(), type, pinned, date: 'ယနေ့' }, ...items]);
        setTitle('');
        setContent('');
        setPinned(false);
        setNotice('ကြေညာချက် ထည့်ပြီးပါပြီ (ဤ page မှာသာ မြင်ရပါမယ် — backend သိမ်းဆည်းမှု မရှိသေးပါ)');
    };

    return (
        <LmsShell title="ကြေညာချက်များ" nav="instructor">
            <Head title="ကြေညာချက်များ" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="ကြေညာချက်များ"
                description="ကျောင်းသားတွေထံ ကြေညာချက် အသစ် ထုတ်ပြန်ရန် — ထုတ်ပြန်ပြီးတာနဲ့ ကျောင်းသားတွေရဲ့ ကြေညာချက် page မှာ ချက်ချင်း ပေါ်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3.5">
                    {items.length === 0 ? (
                        <EmptyBox title="ကြေညာချက် မရှိသေးပါ" description="ညာဘက် form မှာ ကြေညာချက် အသစ် ရေးနိုင်ပါတယ်" />
                    ) : (
                        items.map((a) => (
                            <LmsCard key={a.id} className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Megaphone className="size-4 text-teal-700 dark:text-teal-300" />
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{a.title}</p>
                                    <Pill tone="blue">{a.type}</Pill>
                                    {a.pinned && (
                                        <Pill tone="amber">
                                            <Pin className="mr-1 size-3" /> Pin လုပ်ထား
                                        </Pill>
                                    )}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {a.courseTitle ? `${a.courseTitle} · ` : ''}
                                    {a.date}
                                </p>
                                <p className={`mt-2 text-[.88rem] leading-relaxed ${mutedCls}`}>{a.content}</p>
                            </LmsCard>
                        ))
                    )}
                </div>

                <LmsCard className="h-fit p-5">
                    <h2 className={`flex items-center gap-2 text-lg font-extrabold ${inkCls}`}>
                        <Plus className="size-5" /> ကြေညာချက် အသစ် ရေးရန်
                    </h2>
                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <Input label="ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div>
                            <label className={labelCls}>အကြောင်းအရာ</label>
                            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>အမျိုးအစား</label>
                            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="သင်တန်း">သင်တန်း</option>
                                <option value="Live">Live</option>
                                <option value="ပရိုမိုးရှင်း">ပရိုမိုးရှင်း</option>
                                <option value="စနစ်">စနစ်</option>
                            </select>
                        </div>
                        <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-4 accent-teal-700" />
                            ထိပ်ဆုံးမှာ Pin လုပ်ရန်
                        </label>
                        <button type="submit" className={`${btnAccentCls} w-full`}>
                            ထုတ်ပြန်ရန်
                        </button>
                        <button type="button" className={`${btnGhostCls} w-full`} onClick={() => setNotice('Draft အဖြစ် သိမ်းခြင်း — backend သိမ်းဆည်းမှု မရှိသေးပါ')}>
                            Draft အဖြစ် သိမ်းရန်
                        </button>
                    </form>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

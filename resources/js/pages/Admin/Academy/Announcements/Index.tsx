import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Megaphone, Pin, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type AnnouncementRow = { id: number; title: string; content: string; type: string; audience: string; pinned: boolean; date: string; draft?: boolean };

// SAMPLE DATA fallback (prototype): CourseAnnouncement model exists (per-course),
// but platform-wide announcements have no admin controller yet.
const SAMPLE_ANNOUNCEMENTS: AnnouncementRow[] = [
    { id: 1, title: 'နိုဝင်ဘာ လျှော့ဈေး — သင်တန်း အားလုံး 50% OFF', content: 'CODEXA10 code နဲ့ သင်တန်း အားလုံးကို 50% လျှော့ဈေးနဲ့ ဝယ်နိုင်ပါပြီ။ ဒီဇင်ဘာ 31 အထိ အကျုံးဝင်ပါတယ်။', type: 'ပရိုမိုးရှင်း', audience: 'ကျောင်းသား အားလုံး', pinned: true, date: 'နိုဝင်ဘာ 22' },
    { id: 2, title: 'React Hooks Deep Dive — Live Session ယနေ့ ညနေ 7:00', content: 'ဆရာ Thura Aung နဲ့ live coding session — useState, useEffect နဲ့ custom hooks တွေ ရှင်းပြပါမယ်။', type: 'Live', audience: 'ကျောင်းသား အားလုံး', pinned: false, date: 'နိုဝင်ဘာ 22' },
    { id: 3, title: 'ဒီဇင်ဘာ Hackathon — စာရင်းပေးလို့ ရပါပြီ', content: 'Team ၃ ယောက်နဲ့ 48 နာရီ hackathon — ဆုကြေး 1,000,000 ကျပ်။ Pro အသင်းဝင်တွေ အရင် စာရင်းပေးနိုင်ပါတယ်။', type: 'သင်တန်း', audience: 'Pro Plan သာ', pinned: false, date: 'နိုဝင်ဘာ 18' },
];

export default function Index({ announcements }: { announcements?: AnnouncementRow[] }) {
    const [items, setItems] = useState<AnnouncementRow[]>(announcements ?? SAMPLE_ANNOUNCEMENTS);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('သင်တန်း');
    const [audience, setAudience] = useState('ကျောင်းသား အားလုံး');
    const [pinned, setPinned] = useState(false);
    const [notice, setNotice] = useState('');

    const submit = (e: FormEvent | React.MouseEvent, draft: boolean) => {
        e.preventDefault();
        if (!title.trim()) return;
        setItems([{ id: Date.now(), title: title.trim(), content: content.trim(), type, audience, pinned, date: 'ယနေ့', draft }, ...items]);
        setTitle('');
        setContent('');
        setPinned(false);
        setNotice(draft ? 'Draft အဖြစ် သိမ်းပြီးပါပြီ (ဤ page မှာသာ)' : 'ကြေညာချက် ထုတ်ပြန်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
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
                    {items.length === 0 ? (
                        <EmptyBox title="ကြေညာချက် မရှိတော့ပါ" description="အပေါ်က form မှာ ကြေညာချက် အသစ် ရေးနိုင်ပါတယ်" />
                    ) : (
                        items.map((a) => (
                            <LmsCard key={a.id} className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Megaphone className="size-4 text-teal-700 dark:text-teal-300" />
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{a.title}</p>
                                    <Pill tone="blue">{a.type}</Pill>
                                    {a.pinned && (
                                        <Pill tone="amber">
                                            <Pin className="mr-1 size-3" /> Pin
                                        </Pill>
                                    )}
                                    {a.draft && <Pill tone="slate">မူကြမ်း</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {a.audience} · {a.date}
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
                    <form className="mt-4 space-y-3" onSubmit={(e) => submit(e, false)}>
                        <Input label="ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div>
                            <label className={labelCls}>အကြောင်းအရာ</label>
                            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>အမျိုးအစား</label>
                            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
                                <option>သင်တန်း</option>
                                <option>Live</option>
                                <option>ပရိုမိုးရှင်း</option>
                                <option>စနစ်</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>လက်ခံမည့်သူများ</label>
                            <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)}>
                                <option>ကျောင်းသား အားလုံး</option>
                                <option>Pro Plan သာ</option>
                                <option>Free Plan သာ</option>
                            </select>
                        </div>
                        <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-4 accent-teal-700" />
                            ထိပ်ဆုံးမှာ Pin လုပ်ရန်
                        </label>
                        <button type="submit" className={`${btnAccentCls} w-full`}>
                            ထုတ်ပြန်ရန်
                        </button>
                        <button type="button" className={`${btnGhostCls} w-full`} onClick={(e) => submit(e, true)}>
                            Draft အဖြစ် သိမ်းရန်
                        </button>
                    </form>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

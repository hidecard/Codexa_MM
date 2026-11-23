import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronDown, Play, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES } from '@/pages/Admin/Academy/_sample';
import { cn } from '@/lib/utils';

// SAMPLE DATA fallback (prototype): curriculum is stored in CourseModule/Lesson
// models, but no admin curriculum controller exists yet.
type LessonRow = { id: number; title: string; type: string; duration: number; video?: string };
type ModuleRow = { id: number; title: string; lessons: LessonRow[] };

const SAMPLE_MODULES: Record<number, ModuleRow[]> = {
    1: [
        { id: 1, title: 'HTML Basics & Semantic Tags', lessons: [{ id: 1, title: 'HTML ဆိုတာ ဘာလဲ?', type: 'video', duration: 12, video: 'https://youtu.be/example1' }, { id: 2, title: 'Semantic Tags အသုံးပြုနည်း', type: 'video', duration: 18 }] },
        { id: 2, title: 'CSS Styling & Box Model', lessons: [{ id: 3, title: 'CSS Selectors', type: 'video', duration: 15 }, { id: 4, title: 'Box Model နားလည်ခြင်း', type: 'text', duration: 10 }] },
        { id: 3, title: 'Flexbox & Grid Layout', lessons: [{ id: 5, title: 'Flexbox အခြေခံ', type: 'video', duration: 22 }, { id: 6, title: 'Grid Layout လက်တွေ့', type: 'video', duration: 25 }] },
    ],
    4: [
        { id: 11, title: 'Components & JSX', lessons: [{ id: 11, title: 'Component ဆိုတာ ဘာလဲ?', type: 'video', duration: 16 }, { id: 12, title: 'JSX Syntax', type: 'video', duration: 14 }] },
        { id: 12, title: 'Hooks in Depth — useEffect', lessons: [{ id: 13, title: 'useState အသုံးပြုနည်း', type: 'video', duration: 20 }, { id: 14, title: 'useEffect & Dependency Array', type: 'video', duration: 24 }] },
    ],
};

export default function Index() {
    const [courseId, setCourseId] = useState(1);
    const [modules, setModules] = useState<Record<number, ModuleRow[]>>(SAMPLE_MODULES);
    const [open, setOpen] = useState<Record<number, boolean>>({ 1: true, 2: true, 11: true, 12: true });
    const [newModule, setNewModule] = useState('');
    const [notice, setNotice] = useState('');

    const list = modules[courseId] ?? [];
    const course = SAMPLE_COURSES.find((c) => c.id === courseId);

    const addModule = (e: FormEvent) => {
        e.preventDefault();
        if (!newModule.trim()) return;
        const mod: ModuleRow = { id: Date.now(), title: newModule.trim(), lessons: [] };
        setModules({ ...modules, [courseId]: [...list, mod] });
        setNewModule('');
        setNotice('အခန်း ထည့်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    return (
        <LmsShell title="သင်ရိုး တည်ဆောက်ရန်" nav="admin">
            <Head title="သင်ရိုး တည်ဆောက်ရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="သင်ရိုး တည်ဆောက်ရန်"
                description="သင်တန်း တစ်ခုချင်းရဲ့ အခန်း (Module) နဲ့ သင်ခန်းစာတွေကို စီမံရန် — သင်ခန်းစာတိုင်းမှာ YouTube link ချိတ်နိုင်ပြီး Player က embed နဲ့ တိုက်ရိုက် ဖွင့်ပေးပါတယ်။ ပြောင်းလဲမှုတွေက Player မှာ တိုက်ရိုက် သက်ရောက်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                    <label className={labelCls}>သင်တန်း ရွေးရန်</label>
                    <select className={inputCls} value={courseId} onChange={(e) => setCourseId(Number(e.target.value))}>
                        {SAMPLE_COURSES.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>
                <form onSubmit={addModule} className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className={labelCls}>အခန်း (Module) အသစ် ထည့်ရန်</label>
                        <input className={inputCls} value={newModule} onChange={(e) => setNewModule(e.target.value)} placeholder="အခန်း အမည်" />
                    </div>
                    <button type="submit" className={btnAccentCls}>
                        <Plus className="size-4" /> ထည့်ရန်
                    </button>
                </form>
            </div>

            <p className={`mt-4 text-sm font-semibold ${mutedCls}`}>
                {course?.title} · အခန်း {list.length} ခု · သင်ခန်းစာ {list.reduce((s, m) => s + m.lessons.length, 0)} ခု
            </p>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="အခန်း မရှိသေးပါ" description="အပေါ်မှာ အခန်း အမည် ရိုက်ပြီး ပထမဆုံး အခန်း ထည့်ပါ" />
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {list.map((m) => (
                        <LmsCard key={m.id} className="p-5">
                            <button type="button" onClick={() => setOpen({ ...open, [m.id]: !open[m.id] })} className="flex w-full items-center gap-2 text-left">
                                <ChevronDown className={cn('size-4 transition', mutedCls, !open[m.id] && '-rotate-90')} />
                                <span className={`text-[1.02rem] font-extrabold ${inkCls}`}>{m.title}</span>
                                <span className={`ml-auto text-[.8rem] font-semibold ${mutedCls}`}>{m.lessons.length} သင်ခန်းစာ</span>
                            </button>
                            {open[m.id] && (
                                <ul className="mt-3 space-y-2">
                                    {m.lessons.length === 0 ? (
                                        <li className={`text-sm ${mutedCls}`}>သင်ခန်းစာ မရှိသေးပါ။</li>
                                    ) : (
                                        m.lessons.map((l) => (
                                            <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f]">
                                                <Play className="size-4 text-teal-700 dark:text-teal-300" />
                                                <span className={`flex-1 font-semibold ${inkCls}`}>{l.title}</span>
                                                <Pill tone="slate">{l.type}</Pill>
                                                <span className={mutedCls}>{l.duration} မိနစ်</span>
                                                {l.video && (
                                                    <a href={l.video} target="_blank" rel="noreferrer" className={btnGhostCls}>
                                                        YouTube
                                                    </a>
                                                )}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

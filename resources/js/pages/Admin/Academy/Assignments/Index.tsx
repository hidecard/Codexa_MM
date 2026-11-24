import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate, formatNumber } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

// SAMPLE DATA fallback (prototype style): used until Admin/Academy/AssignmentController is wired.
const SAMPLE_ASSIGNMENTS = [
    { id: 1, title: 'Portfolio Website တည်ဆောက်ခြင်း', course: 'HTML & CSS Foundations', instructor: 'Thura Aung', max_score: 100, due_at: '2026-11-30', submissions: 42, graded: 30, status: 'open' },
    { id: 2, title: 'React Todo App — Hooks အသုံးချခြင်း', course: 'React.js Complete Course', instructor: 'Thura Aung', max_score: 100, due_at: '2026-11-25', submissions: 38, graded: 38, status: 'open' },
    { id: 3, title: 'Python Mini Project — Expense Tracker', course: 'Python for Beginners', instructor: 'Kaung Htet Oo', max_score: 80, due_at: '2026-12-05', submissions: 56, graded: 12, status: 'open' },
    { id: 4, title: 'REST API CRUD — Node.js', course: 'Node.js API Development', instructor: 'Aung Khant', max_score: 100, due_at: '2026-11-15', submissions: 24, graded: 24, status: 'closed' },
    { id: 5, title: 'Figma Landing Page Redesign', course: 'UI/UX Design with Figma', instructor: 'Nilar Win', max_score: 90, due_at: '2026-12-10', submissions: 31, graded: 0, status: 'open' },
];

type AssignmentRow = (typeof SAMPLE_ASSIGNMENTS)[number];

export default function Index({ assignments }: { assignments?: AssignmentRow[] }) {
    const list = assignments ?? SAMPLE_ASSIGNMENTS;
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'open' | 'closed'>('all');

    const filtered = list.filter((a) => {
        if (tab !== 'all' && a.status !== tab) return false;
        if (query && !`${a.title} ${a.course}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });
    const pending = list.reduce((s, a) => s + (a.submissions - a.graded), 0);

    return (
        <LmsShell title="Assignment စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Assignment စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Assignment စီမံခန့်ခွဲမှု"
                description={`ကျောင်းသားတွေ တင်ထားတဲ့ assignment များကို အမှတ်ပေးရန် — စစ်ဆေးရန် စောင့်နေသော တင်သွင်းမှု ${formatNumber(pending)} ခု`}
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="Assignment ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={tab === 'open'} onClick={() => setTab('open')}>
                        ဖွင့်ထားဆဲ
                    </Chip>
                    <Chip active={tab === 'closed'} onClick={() => setTab('closed')}>
                        ပိတ်ထား
                    </Chip>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="တင်သွင်းမှု မရှိတော့ပါ" description="ကျောင်းသားတွေ assignment တင်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((a) => (
                        <LmsCard key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                <ClipboardList className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{a.title}</p>
                                    {a.status === 'open' ? <Pill tone="teal">ဖွင့်ထားဆဲ</Pill> : <Pill tone="slate">ပိတ်ထား</Pill>}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {a.course} · {a.instructor} · အမှတ်ပြည့် {a.max_score} · နောက်ဆုံးရက် {formatDate(a.due_at)}
                                </p>
                                <p className={`mt-1 text-[.84rem] font-bold ${inkCls}`}>
                                    တင်သွင်းမှု {a.submissions} ခု · အမှတ်ပေးပြီး {a.graded} ခု
                                    {a.submissions - a.graded > 0 && <span className="text-amber-600 dark:text-amber-300"> · စစ်ဆေးရန် {a.submissions - a.graded} ခု</span>}
                                </p>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Search, UserCheck } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate, formatKyat, formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

// SAMPLE DATA fallback (prototype style): used until Admin/Academy/EnrollmentController is wired.
const SAMPLE_ENROLLMENTS = [
    { id: 1, student: 'May Thandar', init: 'MT', col: '#ec4899', course: 'React.js Complete Course', status: 'active', price: 95000, enrolled_at: '2026-11-20', completed_at: null },
    { id: 2, student: 'Kaung Htet', init: 'KH', col: '#0ea892', course: 'HTML & CSS Foundations', status: 'active', price: 45000, enrolled_at: '2026-11-18', completed_at: null },
    { id: 3, student: 'Thiri Nanda', init: 'TN', col: '#6366f1', course: 'Python for Beginners', status: 'completed', price: 50000, enrolled_at: '2026-10-05', completed_at: '2026-11-15' },
    { id: 4, student: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', course: 'JavaScript Deep Dive', status: 'active', price: 75000, enrolled_at: '2026-11-12', completed_at: null },
    { id: 5, student: 'Su Myat Noe', init: 'SM', col: '#22c55e', course: 'UI/UX Design with Figma', status: 'completed', price: 40000, enrolled_at: '2026-09-20', completed_at: '2026-11-10' },
    { id: 6, student: 'Aung Khant Min', init: 'AK', col: '#38bdf8', course: 'PHP & Laravel Framework', status: 'active', price: 85000, enrolled_at: '2026-11-21', completed_at: null },
    { id: 7, student: 'Ei Mon Kyaw', init: 'EM', col: '#f43f5e', course: 'Flutter Mobile Development', status: 'cancelled', price: 90000, enrolled_at: '2026-10-28', completed_at: null },
    { id: 8, student: 'Phyo Min Khant', init: 'PM', col: '#eab308', course: 'Git, GitHub & Team Workflow', status: 'active', price: 25000, enrolled_at: '2026-11-19', completed_at: null },
];

type EnrollmentRow = (typeof SAMPLE_ENROLLMENTS)[number];

function statusPill(status: string) {
    if (status === 'completed') return <Pill tone="teal">ပြီးဆုံး</Pill>;
    if (status === 'cancelled') return <Pill tone="rose">ဖျက်သိမ်းထား</Pill>;
    return <Pill tone="blue">တက်ရောက်နေဆဲ</Pill>;
}

export default function Index({ enrollments }: { enrollments?: EnrollmentRow[] }) {
    const list = enrollments ?? SAMPLE_ENROLLMENTS;
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

    const filtered = list.filter((e) => {
        if (tab !== 'all' && e.status !== tab) return false;
        if (query && !`${e.student} ${e.course}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="စာရင်းသွင်းမှုများ" nav="admin">
            <Head title="စာရင်းသွင်းမှုများ" />
            <PageIntro
                eyebrow="ADMIN"
                title="စာရင်းသွင်းမှုများ"
                description="ကျောင်းသားတွေရဲ့ သင်တန်း စာရင်းသွင်းမှု အားလုံး — အခြေအနေ၊ ပေးချေငွေနဲ့ ပြီးဆုံးရက် ကြည့်ရှုရန်"
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="ကျောင်းသား / သင်တန်း ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={tab === 'active'} onClick={() => setTab('active')}>
                        တက်ရောက်နေဆဲ
                    </Chip>
                    <Chip active={tab === 'completed'} onClick={() => setTab('completed')}>
                        ပြီးဆုံး
                    </Chip>
                    <Chip active={tab === 'cancelled'} onClick={() => setTab('cancelled')}>
                        ဖျက်သိမ်းထား
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>စာရင်းသွင်းမှု {formatNumber(filtered.length)} ခု</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ စာရင်းသွင်းမှု မတွေ့ပါ" description="Filter သို့မဟုတ် ရှာဖွေမှု ပြောင်းပြီး ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((e) => (
                        <LmsCard key={e.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={e.init} color={e.col} size="lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{e.student}</p>
                                    {statusPill(e.status)}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {e.course} · စာရင်းသွင်းရက် {formatDate(e.enrolled_at)}
                                    {e.completed_at ? ` · ပြီးဆုံးရက် ${formatDate(e.completed_at)}` : ''}
                                </p>
                            </div>
                            <span className={`flex items-center gap-1.5 text-[.9rem] font-extrabold ${inkCls}`}>
                                <UserCheck className="size-4 text-teal-700 dark:text-teal-300" /> {formatKyat(e.price)}
                            </span>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

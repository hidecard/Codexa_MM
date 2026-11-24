import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Award, Download, Search, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_STUDENTS } from '@/pages/Admin/Academy/_sample';

type AdminStudent = {
    id: number;
    name: string;
    init: string;
    col: string;
    email?: string;
    city: string;
    courses: number;
    xp: number;
    prog: number;
    plan: 'pro' | 'free';
    active: string;
    status: 'active' | 'inactive';
};

const COLS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

export default function Index({ students, total }: { students?: AdminStudent[]; total?: number }) {
    // SAMPLE DATA fallback (prototype): used until Admin/Academy/StudentController is wired.
    const list: AdminStudent[] =
        students ??
        SAMPLE_STUDENTS.map((s, i) => ({ id: i + 1, ...s }));
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'pro' | 'free' | 'inactive'>('all');

    const filtered = list.filter((s) => {
        if (tab === 'pro' && s.plan !== 'pro') return false;
        if (tab === 'free' && s.plan !== 'free') return false;
        if (tab === 'inactive' && s.status !== 'inactive') return false;
        if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    const proCount = list.filter((s) => s.plan === 'pro').length;

    return (
        <LmsShell title="ကျောင်းသား စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="ကျောင်းသား စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="ကျောင်းသား စီမံခန့်ခွဲမှု"
                description={`ကျောင်းသား ${formatNumber(total ?? 4280)} ဦးရဲ့ စာရင်းသွင်းမှု၊ တိုးတက်မှုနဲ့ plan အခြေအနေကို ကြည့်ရှုရန်`}
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> ကျောင်းသားစာရင်း ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="ကျောင်းသား စုစုပေါင်း" value={formatNumber(total ?? 4280)} sub="ဒီလ အသစ် 386 ဦး တိုးလာ" icon={Users} tone="blue" />
                <StatCard label="Pro Plan အသုံးပြုသူ" value={formatNumber(1140)} sub="စုစုပေါင်းရဲ့ 27%" icon={Award} tone="purple" />
                <StatCard label="ယနေ့ Active" value="312" sub="လွန်ခဲ့သော 24 နာရီအတွင်း ဝင်ရောက်သူ" icon={Users} tone="teal" />
                <StatCard label="လက်မှတ် ထုတ်ပေးပြီး" value={formatNumber(1862)} sub="ဒီလ အသစ် 96 စောင်" icon={Award} tone="amber" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="ကျောင်းသား ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={tab === 'pro'} onClick={() => setTab('pro')}>
                        Pro Plan
                    </Chip>
                    <Chip active={tab === 'free'} onClick={() => setTab('free')}>
                        Free
                    </Chip>
                    <Chip active={tab === 'inactive'} onClick={() => setTab('inactive')}>
                        မလှုပ်ရှားတော့
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>
                    ပြသနေသော {filtered.length} ဦး · Pro {proCount} ဦး
                </p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ ကျောင်းသား မတွေ့ပါ" description="တခြား အမည်ဖြင့် ပြန်ရှာကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((s) => (
                        <LmsCard key={s.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={s.init} color={s.col || COLS[s.id % COLS.length]} size="lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    {s.plan === 'pro' ? <Pill tone="violet">PRO</Pill> : <Pill tone="slate">FREE</Pill>}
                                    {s.status === 'inactive' && <Pill tone="amber">မလှုပ်ရှားတော့</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {s.city} · သင်တန်း {s.courses} ခု · {formatNumber(s.xp)} XP · နောက်ဆုံး ဝင်ရောက်မှု {s.active}
                                    {s.email ? ` · ${s.email}` : ''}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="max-w-xs flex-1">
                                        <ProgressBar value={s.prog} />
                                    </div>
                                    <span className={`text-[.8rem] font-extrabold ${inkCls}`}>{s.prog}%</span>
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

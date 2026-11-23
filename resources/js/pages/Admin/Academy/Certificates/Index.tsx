import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Award, Download, Search } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate, formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

// SAMPLE DATA fallback (prototype style): used until Admin/Academy/CertificateController is wired.
const SAMPLE_CERTS = [
    { id: 1, number: 'CMM-2026-0182', student: 'Su Su Win', init: 'SW', col: '#22c55e', course: 'HTML & CSS Foundations', issued_at: '2026-11-19', verified: true },
    { id: 2, number: 'CMM-2026-0179', student: 'Thiri Nanda', init: 'TN', col: '#6366f1', course: 'Python for Beginners', issued_at: '2026-11-15', verified: true },
    { id: 3, number: 'CMM-2026-0174', student: 'Su Myat Noe', init: 'SM', col: '#22c55e', course: 'UI/UX Design with Figma', issued_at: '2026-11-10', verified: true },
    { id: 4, number: 'CMM-2026-0168', student: 'Kaung Htet', init: 'KH', col: '#0ea892', course: 'Git, GitHub & Team Workflow', issued_at: '2026-11-08', verified: true },
    { id: 5, number: 'CMM-2026-0155', student: 'May Thandar', init: 'MT', col: '#ec4899', course: 'React.js Complete Course', issued_at: '2026-11-02', verified: false },
];

type CertRow = (typeof SAMPLE_CERTS)[number];

export default function Index({ certificates }: { certificates?: CertRow[] }) {
    const list = certificates ?? SAMPLE_CERTS;
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'verified' | 'unverified'>('all');

    const filtered = list.filter((c) => {
        if (tab === 'verified' && !c.verified) return false;
        if (tab === 'unverified' && c.verified) return false;
        if (query && !`${c.student} ${c.course} ${c.number}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="လက်မှတ် စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="လက်မှတ် စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="လက်မှတ် စီမံခန့်ခွဲမှု"
                description="ထုတ်ပေးထားတဲ့ လက်မှတ်များ — အတည်ပြုကုဒ်နဲ့ စစ်ဆေးနိုင်ပါတယ်"
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="ကျောင်းသား / သင်တန်း / နံပါတ် ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={tab === 'verified'} onClick={() => setTab('verified')}>
                        အတည်ပြုပြီး
                    </Chip>
                    <Chip active={tab === 'unverified'} onClick={() => setTab('unverified')}>
                        မအတည်ပြုရသေး
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>လက်မှတ် {formatNumber(filtered.length)} စောင်</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ လက်မှတ် မတွေ့ပါ" description="Filter သို့မဟုတ် ရှာဖွေမှု ပြောင်းပြီး ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((c) => (
                        <LmsCard key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={c.init} color={c.col} size="lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{c.student}</p>
                                    {c.verified ? <Pill tone="teal">အတည်ပြုပြီး</Pill> : <Pill tone="amber">မအတည်ပြုရသေး</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {c.course} · {c.number} · ထုတ်ပေးရက် {formatDate(c.issued_at)}
                                </p>
                            </div>
                            <div className="flex flex-none flex-wrap gap-2">
                                <a href={`/verify/${c.number}`} className={btnGhostCls}>
                                    <Award className="size-4" /> အတည်ပြုရန်
                                </a>
                                <button type="button" className={btnGhostCls}>
                                    <Download className="size-4" /> ဒေါင်းလုဒ်
                                </button>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

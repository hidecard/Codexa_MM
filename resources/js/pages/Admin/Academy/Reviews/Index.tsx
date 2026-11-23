import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, EyeOff, Flag, Star, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, Stars, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_ADMIN_REVIEWS, type SampleReview } from '@/pages/Admin/Academy/_sample';

type ReviewRow = SampleReview & { reportReason?: string };

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စစ်ဆေးရန်</Pill>;
    if (status === 'reported') return <Pill tone="rose">REPORT လုပ်ထား</Pill>;
    if (status === 'hidden') return <Pill tone="slate">ဖျောက်ထား</Pill>;
    return <Pill tone="teal">အတည်ပြုပြီး</Pill>;
}

export default function Index({ reviews }: { reviews?: ReviewRow[] }) {
    // SAMPLE DATA fallback (prototype): used until Admin/Academy/ReviewController is wired.
    const [items, setItems] = useState<ReviewRow[]>(reviews ?? SAMPLE_ADMIN_REVIEWS);
    const [tab, setTab] = useState<'all' | 'pending' | 'reported' | 'approved'>('all');
    const [notice, setNotice] = useState('');

    const pendingCount = items.filter((r) => r.status === 'pending' || r.status === 'reported').length;
    const reportedCount = items.filter((r) => r.status === 'reported').length;
    const list = items.filter((r) => tab === 'all' || r.status === tab);

    const setStatus = (id: number, status: SampleReview['status']) => {
        setItems(items.map((r) => (r.id === id ? { ...r, status } : r)));
        setNotice('အခြေအနေ ပြောင်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };
    const remove = (id: number) => {
        setItems(items.filter((r) => r.id !== id));
        setNotice('Review ကို ဖျက်ပြီးပါပြီ (ဤ page မှာသာ)');
    };

    return (
        <LmsShell title="Review စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Review စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Review စီမံခန့်ခွဲမှု"
                description="ကျောင်းသားများ ရေးသားတဲ့ review များကို စစ်ဆေး အတည်ပြု၊ ဖျောက်ထားနဲ့ ဖျက်သိမ်းရန်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="ပျမ်းမျှ Rating" value="4.8 / 5" icon={Star} tone="amber" />
                <StatCard label="Review စုစုပေါင်း" value="3,910" icon={Star} tone="blue" />
                <StatCard label="စစ်ဆေးရန် ကျန်ရှိ" value={String(pendingCount)} icon={Flag} tone="rose" />
                <StatCard label="Report လုပ်ထားသော" value={String(reportedCount)} icon={Flag} tone="purple" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>
                    စစ်ဆေးရန်
                </Chip>
                <Chip active={tab === 'reported'} onClick={() => setTab('reported')}>
                    Report လုပ်ထား
                </Chip>
                <Chip active={tab === 'approved'} onClick={() => setTab('approved')}>
                    အတည်ပြုပြီး
                </Chip>
            </div>

            <p className={`mt-4 text-sm font-semibold ${mutedCls}`}>
                စစ်ဆေးရန် ကျန်ရှိ {pendingCount} ခု · ပြသနေသော review {items.filter((r) => r.status === 'approved').length} ခု
            </p>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ filter မှာ review မရှိပါ" description="တခြား filter ဖြင့် ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((r) => (
                        <LmsCard key={r.id} className={`p-5 ${r.status === 'hidden' ? 'opacity-60' : ''}`}>
                            <div className="flex flex-wrap items-start gap-3.5">
                                <Avatar init={r.init} color={r.col} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.93rem] font-extrabold ${inkCls}`}>{r.name}</p>
                                        <Stars value={r.stars} />
                                        {statusPill(r.status)}
                                    </div>
                                    <p className={`mt-0.5 text-[.78rem] ${mutedCls}`}>
                                        {r.course} · {r.date}
                                    </p>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{r.text}</p>
                                    {r.reportReason && <p className="mt-1.5 text-[.8rem] font-bold text-rose-600">Report အကြောင်းရင်း — {r.reportReason}</p>}
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    {r.status !== 'approved' && (
                                        <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'approved')}>
                                            <Check className="size-4" /> အတည်ပြုရန်
                                        </button>
                                    )}
                                    {r.status !== 'hidden' && (
                                        <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'hidden')}>
                                            <EyeOff className="size-4" /> ဖျောက်ရန်
                                        </button>
                                    )}
                                    <button type="button" className={btnGhostCls} onClick={() => remove(r.id)}>
                                        <Trash2 className="size-4" /> ဖျက်ရန်
                                    </button>
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

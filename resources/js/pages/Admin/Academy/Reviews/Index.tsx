import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, Eye, EyeOff, Flag, Send, Star, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, Stars, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type ReviewRow = {
    id: number;
    name: string;
    init: string;
    col: string;
    course: string;
    stars: number;
    text: string;
    date: string;
    status: 'pending' | 'approved' | 'hidden';
    reply: string | null;
};

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စစ်ဆေးရန်</Pill>;
    if (status === 'hidden') return <Pill tone="slate">ဖျောက်ထား</Pill>;
    return <Pill tone="teal">အတည်ပြုပြီး</Pill>;
}

export default function Index({ reviews = [], stats = { average: 0, total: 0 } }: { reviews?: ReviewRow[]; stats?: { average: number; total: number } }) {
    const [tab, setTab] = useState<'all' | 'pending' | 'reported' | 'approved'>('all');
    const [reply, setReply] = useState<Record<number, string>>({});
    const [notice, setNotice] = useState('');

    const pendingCount = reviews.filter((r) => r.status === 'pending').length;
    const list = reviews.filter((r) => tab === 'all' || r.status === tab);

    const act = (id: number, action: 'approve' | 'hide' | 'unhide', done: string) => {
        router.post(`/admin/academy/reviews/${id}/${action}`, {}, { preserveScroll: true, onSuccess: () => setNotice(done) });
    };
    const remove = (id: number) => {
        if (confirm('ဒီ review ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/reviews/${id}`, { preserveScroll: true, onSuccess: () => setNotice('Review ကို ဖျက်ပြီးပါပြီ') });
        }
    };
    const sendReply = (id: number) => {
        if (!(reply[id] ?? '').trim()) return;
        router.post(
            `/admin/academy/reviews/${id}/reply`,
            { reply: reply[id].trim() },
            { preserveScroll: true, onSuccess: () => { setReply({ ...reply, [id]: '' }); setNotice('အကြောင်းပြန်ချက် သိမ်းပြီးပါပြီ'); } },
        );
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
                <StatCard label="ပျမ်းမျှ Rating" value={`${stats.average.toFixed(1)} / 5`} icon={Star} tone="amber" />
                <StatCard label="Review စုစုပေါင်း" value={formatNumber(stats.total)} icon={Star} tone="blue" />
                <StatCard label="စစ်ဆေးရန် ကျန်ရှိ" value={String(pendingCount)} icon={Flag} tone="rose" />
                <StatCard label="ဖျောက်ထားသော" value={String(reviews.filter((r) => r.status === 'hidden').length)} icon={EyeOff} tone="purple" />
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
                စစ်ဆေးရန် ကျန်ရှိ {pendingCount} ခု · ပြသနေသော review {reviews.filter((r) => r.status === 'approved').length} ခု
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
                                    {r.reply && <p className="mt-1.5 text-[.8rem] font-bold text-teal-700 dark:text-teal-300">Admin အကြောင်းပြန်ချက် — {r.reply}</p>}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <input
                                            className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                            placeholder="အကြောင်းပြန်ရန်…"
                                            value={reply[r.id] ?? ''}
                                            onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })}
                                        />
                                        <button type="button" className={btnGhostCls} onClick={() => sendReply(r.id)}>
                                            <Send className="size-4" /> {r.reply ? 'အကြောင်းပြန်ချက် ပြင်ရန်' : 'အကြောင်းပြန်ရန်'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    {r.status !== 'approved' && (
                                        <button type="button" className={btnGhostCls} onClick={() => act(r.id, 'approve', 'Review ကို အတည်ပြုပြီးပါပြီ')}>
                                            <Check className="size-4" /> အတည်ပြုရန်
                                        </button>
                                    )}
                                    {r.status !== 'hidden' ? (
                                        <button type="button" className={btnGhostCls} onClick={() => act(r.id, 'hide', 'Review ကို ဖျောက်ထားပြီးပါပြီ')}>
                                            <EyeOff className="size-4" /> ဖျောက်ရန်
                                        </button>
                                    ) : (
                                        <button type="button" className={btnGhostCls} onClick={() => act(r.id, 'unhide', 'Review ကို ပြန်ပြပြီးပါပြီ')}>
                                            <Eye className="size-4" /> ပြန်ပြရန်
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

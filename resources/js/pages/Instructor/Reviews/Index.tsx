import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Reply, Star } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Stars, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { formatDate } from '@/lib/format';

type Review = {
    id: number;
    name: string;
    course: string;
    stars: number;
    text: string;
    date?: string | null;
    status: 'pending' | 'approved';
    reply?: string | null;
};

type Props = {
    reviews?: Review[];
    flash?: { success?: string | null };
};

const AVATAR_COLORS = ['#f59e0b', '#f43f5e', '#14b8a6', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f97316'];

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Index({ reviews = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [filter, setFilter] = useState<number | 'all'>('all');
    const [draft, setDraft] = useState<Record<number, string>>({});
    const [replying, setReplying] = useState<number | null>(null);

    const avg = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;
    const shown = reviews.filter((r) => filter === 'all' || r.stars === filter);
    const dist = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: reviews.filter((r) => r.stars === s).length }));

    const reply = (id: number) => {
        const text = (draft[id] ?? '').trim();
        if (!text || replying !== null) return;
        setReplying(id);
        router.post(
            `/instructor/reviews/${id}/reply`,
            { reply: text },
            {
                onFinish: () => setReplying(null),
                onSuccess: () => setDraft({ ...draft, [id]: '' }),
            },
        );
    };

    return (
        <LmsShell title="ကျွန်ုပ်၏ Review များ" nav="instructor">
            <Head title="ကျွန်ုပ်၏ Review များ" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="ကျွန်ုပ်၏ Review များ"
                description="သင့် သင်တန်းတွေအပေါ် ကျောင်းသားတွေ ရေးထားတဲ့ review အားလုံး — ပြန်ကြားရင် ကျောင်းသားထံ အသိပေးချက် ရောက်ပါတယ်"
                actions={
                    <Link href="/instructor/dashboard" className={btnGhostCls}>
                        Instructor Dashboard
                    </Link>
                }
            />

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
                <StatCard label="ပျမ်းမျှ Rating" value={avg.toFixed(1)} sub={`Review ${reviews.length} ခု`} icon={Star} tone="amber" />
                <StatCard label="5 ကြယ် Review" value={String(reviews.filter((r) => r.stars === 5).length)} sub="အကောင်းဆုံး အဆင့်သတ်မှတ်ချက်" icon={Star} tone="teal" />
                <StatCard label="4 ကြယ်အောက် Review" value={String(reviews.filter((r) => r.stars < 4).length)} sub="ပြန်ကြားဖို့ စဉ်းစားပါ" icon={Star} tone="rose" />
            </div>

            <LmsCard className="mt-6 p-5">
                <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>Rating ခွဲဝေမှု</h2>
                <div className="mt-3 space-y-2">
                    {dist.map((d) => (
                        <div key={d.stars} className="flex items-center gap-3 text-sm">
                            <span className={`w-10 flex-none font-bold ${inkCls}`}>{d.stars} ကြယ်</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-[#12234a]">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${reviews.length ? Math.round((d.count / reviews.length) * 100) : 0}%` }} />
                            </div>
                            <span className={`w-8 flex-none text-right font-semibold ${mutedCls}`}>{d.count}</span>
                        </div>
                    ))}
                </div>
            </LmsCard>

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                    အားလုံး
                </Chip>
                {[5, 4, 3, 2, 1].map((s) => (
                    <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
                        {s} ကြယ်
                    </Chip>
                ))}
            </div>

            {shown.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အမျိုးအစားမှာ review မရှိပါ" description="တခြား filter ဖြင့် ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {shown.map((r) => (
                        <LmsCard key={r.id} className="p-5">
                            <div className="flex gap-3.5">
                                <Avatar init={initials(r.name)} color={AVATAR_COLORS[r.id % AVATAR_COLORS.length]} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.88rem] font-bold ${inkCls}`}>{r.name}</p>
                                        <Stars value={r.stars} />
                                        <span className={`text-[.74rem] font-semibold ${mutedCls}`}>{formatDate(r.date)}</span>
                                    </div>
                                    <p className={`mt-0.5 text-[.76rem] font-semibold ${mutedCls}`}>{r.course}</p>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{r.text}</p>
                                    {r.reply ? (
                                        <div className="mt-3 rounded-xl bg-teal-50 p-3.5 dark:bg-teal-950/30">
                                            <p className="text-[.76rem] font-bold text-teal-700 dark:text-teal-300">သင့် အကြောင်းပြန်ချက်</p>
                                            <p className={`mt-1 text-[.86rem] leading-relaxed ${inkCls}`}>{r.reply}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <input
                                                className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                placeholder="ကျောင်းသားထံ ပြန်ကြားရန်…"
                                                value={draft[r.id] ?? ''}
                                                onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') reply(r.id);
                                                }}
                                            />
                                            <button type="button" className={btnGhostCls} onClick={() => reply(r.id)} disabled={replying === r.id}>
                                                <Reply className="size-4" /> ပြန်ကြားရန်
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

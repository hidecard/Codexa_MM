import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { formatDate } from '@/lib/format';

type Question = {
    id: number;
    student: string;
    courseId: number;
    courseTitle: string;
    lesson: string;
    q: string;
    time?: string | null;
    answer: string;
    is_answered: boolean;
};

type Props = {
    questions?: Question[];
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

export default function Index({ questions = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [tab, setTab] = useState<'all' | 'open' | 'answered'>('all');
    const [draft, setDraft] = useState<Record<number, string>>({});
    const [answering, setAnswering] = useState<number | null>(null);

    const open = questions.filter((q) => !q.is_answered);
    const list = tab === 'all' ? questions : tab === 'open' ? open : questions.filter((q) => q.is_answered);

    const answer = (id: number) => {
        const text = (draft[id] ?? '').trim();
        if (!text || answering !== null) return;
        setAnswering(id);
        router.post(
            `/instructor/qa/${id}/answer`,
            { answer: text },
            {
                onFinish: () => setAnswering(null),
                onSuccess: () => setDraft({ ...draft, [id]: '' }),
            },
        );
    };

    return (
        <LmsShell title="ကျောင်းသား မေးခွန်းများ" nav="instructor">
            <Head title="ကျောင်းသား မေးခွန်းများ" />
            <PageIntro
                title="ကျောင်းသား မေးခွန်းများ"
                description="သင့်သင်တန်းတွေထဲက ကျောင်းသားတွေ မေးထားတဲ့ မေးခွန်းများ — 24 နာရီအတွင်း ဖြေပေးရင် ကျောင်းသား ကျေနပ်မှု ပိုကောင်းပါတယ်"
            />

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး ({questions.length})
                </Chip>
                <Chip active={tab === 'open'} onClick={() => setTab('open')}>
                    မဖြေရသေးသော ({open.length})
                </Chip>
                <Chip active={tab === 'answered'} onClick={() => setTab('answered')}>
                    ဖြေပြီးသော ({questions.length - open.length})
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အမျိုးအစားမှာ မေးခွန်း မရှိပါ" description="မေးခွန်း အသစ်တွေ ရောက်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {list.map((q) => (
                        <LmsCard key={q.id} className="p-5">
                            <div className="flex gap-3.5">
                                <Avatar init={initials(q.student)} color={AVATAR_COLORS[q.id % AVATAR_COLORS.length]} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.88rem] font-bold ${inkCls}`}>{q.student}</p>
                                        <span className={`text-[.74rem] font-semibold ${mutedCls}`}>{formatDate(q.time)}</span>
                                        {q.is_answered ? <Pill tone="teal">ဖြေပြီး</Pill> : <Pill tone="amber">မဖြေရသေး</Pill>}
                                    </div>
                                    <p className={`mt-0.5 text-[.78rem] font-semibold ${mutedCls}`}>
                                        {q.courseTitle}
                                        {q.lesson ? ` · ${q.lesson}` : ''}
                                    </p>
                                    <p className={`mt-2 flex gap-2 text-[.92rem] font-bold leading-snug ${inkCls}`}>
                                        <MessageCircleQuestion className="mt-0.5 size-4 flex-none text-teal-700 dark:text-teal-300" />
                                        {q.q}
                                    </p>
                                    {q.is_answered ? (
                                        <div className="mt-3 rounded-xl bg-teal-50 p-3.5 dark:bg-teal-950/30">
                                            <p className="text-[.76rem] font-bold text-teal-700 dark:text-teal-300">သင့် အဖြေ</p>
                                            <p className={`mt-1 text-[.88rem] leading-relaxed ${inkCls}`}>{q.answer}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <input
                                                className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                placeholder="အဖြေ ရေးရန်…"
                                                value={draft[q.id] ?? ''}
                                                onChange={(e) => setDraft({ ...draft, [q.id]: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') answer(q.id);
                                                }}
                                            />
                                            <button type="button" className={btnAccentCls} onClick={() => answer(q.id)} disabled={answering === q.id}>
                                                <Send className="size-4" /> ဖြေရန်
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

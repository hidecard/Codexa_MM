import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES, SAMPLE_QA, type SampleQA } from '@/pages/Admin/Academy/_sample';

export default function Index({ questions }: { questions?: SampleQA[] }) {
    // SAMPLE DATA fallback (prototype): no Q&A backend yet — routes needed.
    const [items, setItems] = useState<SampleQA[]>(questions ?? SAMPLE_QA);
    const [tab, setTab] = useState<'all' | 'open' | 'answered'>('all');
    const [draft, setDraft] = useState<Record<number, string>>({});

    const open = items.filter((q) => !q.answer);
    const list = tab === 'all' ? items : tab === 'open' ? open : items.filter((q) => q.answer);

    const answer = (id: number) => {
        const text = (draft[id] ?? '').trim();
        if (!text) return;
        setItems(items.map((q) => (q.id === id ? { ...q, answer: text } : q)));
        setDraft({ ...draft, [id]: '' });
    };

    return (
        <LmsShell title="ကျောင်းသား မေးခွန်းများ" nav="instructor">
            <Head title="ကျောင်းသား မေးခွန်းများ" />
            <PageIntro
                title="ကျောင်းသား မေးခွန်းများ"
                description="သင့်သင်တန်းတွေထဲက ကျောင်းသားတွေ မေးထားတဲ့ မေးခွန်းများ — 24 နာရီအတွင်း ဖြေပေးရင် ကျောင်းသား ကျေနပ်မှု ပိုကောင်းပါတယ်"
            />

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး ({items.length})
                </Chip>
                <Chip active={tab === 'open'} onClick={() => setTab('open')}>
                    မဖြေရသေးသော ({open.length})
                </Chip>
                <Chip active={tab === 'answered'} onClick={() => setTab('answered')}>
                    ဖြေပြီးသော ({items.length - open.length})
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အမျိုးအစားမှာ မေးခွန်း မရှိပါ" description="မေးခွန်း အသစ်တွေ ရောက်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {list.map((q) => {
                        const course = SAMPLE_COURSES.find((c) => c.id === q.courseId);
                        return (
                            <LmsCard key={q.id} className="p-5">
                                <div className="flex gap-3.5">
                                    <Avatar init={q.init} color={q.col} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-[.88rem] font-bold ${inkCls}`}>{q.student}</p>
                                            <span className={`text-[.74rem] font-semibold ${mutedCls}`}>{q.time}</span>
                                            {q.answer ? <Pill tone="teal">ဖြေပြီး</Pill> : <Pill tone="amber">မဖြေရသေး</Pill>}
                                        </div>
                                        <p className={`mt-0.5 text-[.78rem] font-semibold ${mutedCls}`}>
                                            {course?.title ?? ''} · {q.lesson}
                                        </p>
                                        <p className={`mt-2 flex gap-2 text-[.92rem] font-bold leading-snug ${inkCls}`}>
                                            <MessageCircleQuestion className="mt-0.5 size-4 flex-none text-teal-700 dark:text-teal-300" />
                                            {q.q}
                                        </p>
                                        {q.answer ? (
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
                                                <button type="button" className={btnAccentCls} onClick={() => answer(q.id)}>
                                                    <Send className="size-4" /> ဖြေရန်
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </LmsCard>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

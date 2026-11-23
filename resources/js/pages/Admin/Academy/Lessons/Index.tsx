import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FileText, Play, Search } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatNumber } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type LessonRow = { id: number; title: string; course: string; module: string; type: string; duration: number; is_free: boolean };

function typeIcon(type: string) {
    if (type === 'video') return <Play className="size-5" />;
    return <FileText className="size-5" />;
}

export default function Index({ lessons = [] }: { lessons?: LessonRow[] }) {
    const list = lessons;
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'all' | 'video' | 'text' | 'quiz' | 'assignment'>('all');

    const filtered = list.filter((l) => {
        if (type !== 'all' && l.type !== type) return false;
        if (query && !`${l.title} ${l.course} ${l.module}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });
    const totalMinutes = filtered.reduce((s, l) => s + l.duration, 0);

    return (
        <LmsShell title="သင်ခန်းစာ စီမံရန်" nav="admin">
            <Head title="သင်ခန်းစာ စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="သင်ခန်းစာ စီမံရန်"
                description={`သင်တန်း အားလုံးရဲ့ သင်ခန်းစာများ — စုစုပေါင်း ကြာချိန် ${formatNumber(totalMinutes)} မိနစ်`}
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="သင်ခန်းစာ ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={type === 'all'} onClick={() => setType('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={type === 'video'} onClick={() => setType('video')}>
                        Video
                    </Chip>
                    <Chip active={type === 'text'} onClick={() => setType('text')}>
                        Text
                    </Chip>
                    <Chip active={type === 'quiz'} onClick={() => setType('quiz')}>
                        Quiz
                    </Chip>
                    <Chip active={type === 'assignment'} onClick={() => setType('assignment')}>
                        Assignment
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>သင်ခန်းစာ {formatNumber(filtered.length)} ခု</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ သင်ခန်းစာ မတွေ့ပါ" description="Filter သို့မဟုတ် ရှာဖွေမှု ပြောင်းပြီး ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((l) => (
                        <LmsCard key={l.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">{typeIcon(l.type)}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{l.title}</p>
                                    <Pill tone="slate">{l.type}</Pill>
                                    {l.is_free && <Pill tone="teal">အခမဲ့ ကြည့်ရန်</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {l.course} · {l.module} · {l.duration} မိနစ်
                                </p>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BookOpen, Search } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type ModuleRow = { id: number; title: string; course: string; position: number; lessons_count: number; description: string | null };

export default function Index({ modules = [] }: { modules?: ModuleRow[] }) {
    const list = modules;
    const [query, setQuery] = useState('');
    const [course, setCourse] = useState('all');

    const courseNames = [...new Set(list.map((m) => m.course))];
    const filtered = list.filter((m) => {
        if (course !== 'all' && m.course !== course) return false;
        if (query && !`${m.title} ${m.course}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="အခန်း (Module) စီမံရန်" nav="admin">
            <Head title="အခန်း (Module) စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="အခန်း (Module) စီမံရန်"
                description="သင်တန်း အားလုံးရဲ့ အခန်းများ — အခန်းတိုင်းရဲ့ သင်ခန်းစာ အရေအတွက်နဲ့ အစီအစဉ် ကြည့်ရှုရန်"
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="အခန်း ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <select className={`${inputCls} w-64`} value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="all">သင်တန်း အားလုံး</option>
                    {courseNames.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>အခန်း {formatNumber(filtered.length)} ခု</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ အခန်း မတွေ့ပါ" description="Filter သို့မဟုတ် ရှာဖွေမှု ပြောင်းပြီး ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((m) => (
                        <LmsCard key={m.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                <BookOpen className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{m.title}</p>
                                    <Pill tone="slate">အခန်း {m.position}</Pill>
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {m.course} · သင်ခန်းစာ {m.lessons_count} ခု
                                </p>
                                {m.description && <p className={`mt-1 text-[.84rem] leading-relaxed ${mutedCls}`}>{m.description}</p>}
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

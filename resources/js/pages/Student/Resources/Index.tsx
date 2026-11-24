import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Code2, Download, FileText, FolderDown, Presentation, Search, Zap } from 'lucide-react';

type Resource = { id: number; type: 'slides' | 'code' | 'cheat' | 'worksheet'; label: string; title: string; course: string; courseId: number; size: string; meta: string };
type Props = { resources: Resource[] };

const TYPE_STYLE: Record<Resource['type'], { icon: typeof FileText; bg: string; text: string }> = {
    slides: { icon: Presentation, bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-300' },
    code: { icon: Code2, bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-300' },
    cheat: { icon: Zap, bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-300' },
    worksheet: { icon: FileText, bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-300' },
};

const TABS: { key: 'all' | Resource['type']; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'slides', label: 'Slides' },
    { key: 'code', label: 'Starter Code' },
    { key: 'cheat', label: 'Cheat Sheet' },
    { key: 'worksheet', label: 'Worksheet' },
];

export default function Index({ resources }: Props) {
    const list = resources;
    const [tab, setTab] = useState<'all' | Resource['type']>('all');
    const [query, setQuery] = useState('');

    const filtered = list.filter((r) => {
        if (tab !== 'all' && r.type !== tab) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return r.title.toLowerCase().includes(q) || r.course.toLowerCase().includes(q);
    });

    return (
        <LmsShell title="ရင်းမြစ်များ" nav="student">
            <Head title="Resources" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><FolderDown className="size-7 text-teal-600" /> ရင်းမြစ်များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">စာရင်းသွင်းထားသော သင်တန်းများမှ အရင်းအမြစ် {list.length} ခု</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ရင်းမြစ် ရှာဖွေရန်…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => {
                    const st = TYPE_STYLE[r.type];
                    const Icon = st.icon;
                    return (
                        <article key={r.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <span className={`grid size-12 place-items-center rounded-2xl ${st.bg} ${st.text}`}><Icon className="size-5" /></span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${st.bg} ${st.text}`}>{r.label}</span>
                            </div>
                            <h3 className="mt-3.5 font-extrabold leading-snug text-slate-900 dark:text-white">{r.title}</h3>
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{r.course}</p>
                            <p className="mt-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{r.meta} · {r.size}</p>
                            <div className="mt-auto flex gap-2.5 pt-4">
                                <a href={`/student/resources/${r.id}/download`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"><Download className="size-4" /> ဒေါင်းလုဒ်ရန်</a>
                                <Link href={`/student/courses/${r.courseId}/learn`} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">သင်တန်း</Link>
                            </div>
                        </article>
                    );
                })}
            </div>
            {filtered.length === 0 && <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ရင်းမြစ် မတွေ့ပါ။</p>}
        </LmsShell>
    );
}

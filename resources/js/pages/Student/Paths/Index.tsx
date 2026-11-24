import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { Map, Route } from 'lucide-react';

type Path = {
    id: number;
    title: string;
    goal: string;
    grad: string;
    glyph: string;
    months: string;
    level: string;
    joined: boolean;
    steps: { id: number; title: string; progress: number }[];
    outcomes: string[];
};

type Props = { paths: Path[] };

export default function Index({ paths }: Props) {
    const list = paths;
    const toggleJoin = (id: number) => router.post(`/student/paths/${id}/follow`, {}, { preserveScroll: true });

    return (
        <LmsShell title="သင်ယူမှု လမ်းကြောင်းများ" nav="student">
            <Head title="Learning Paths" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Route className="size-7 text-teal-600" /> သင်ယူမှု လမ်းကြောင်းများ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ရည်မှန်းချက်အလိုက် အဆင့်ဆင့် စီစဉ်ထားသော သင်တန်း အစုအဖွဲ့များ</p>
            </div>

            {list.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">သင်ယူမှု လမ်းကြောင်း မရှိသေးပါ။</p>
            ) : (
                <div className="mt-6 flex flex-col gap-5">
                {list.map((p) => {
                    const pct = p.steps.length > 0 ? Math.round(p.steps.reduce((s, st) => s + st.progress, 0) / p.steps.length) : 0;
                    const done = p.steps.filter((st) => st.progress >= 100).length;
                    return (
                        <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-5 sm:flex-row">
                                <div className="relative grid w-full max-w-52 shrink-0 place-items-center overflow-hidden rounded-2xl text-white" style={{ background: p.grad, aspectRatio: '16/10' }}>
                                    <span className="font-mono text-4xl font-bold">{p.glyph}</span>
                                    {p.joined && <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold">လိုက်နာနေဆဲ</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{p.title}</h2>
                                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{p.level}</span>
                                    </div>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.goal}</p>
                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        <span>သင်တန်း {p.steps.length} ခု အဆင့်ဆင့်</span>
                                        <span>ကြာချိန် ခန့်မှန်း {p.months}</span>
                                        <span>ပြီးစီးမှု {done} / {p.steps.length} သင်တန်း</span>
                                    </div>
                                    <div className="mt-3.5 flex items-center gap-3">
                                        <div className="flex-1"><ProgressBar value={pct} tone="teal" /></div>
                                        <span className="shrink-0 text-sm font-extrabold text-teal-700 dark:text-teal-300">{pct}%</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {p.steps.map((st, i) => (
                                            <span key={st.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {i + 1}. {st.title}{st.progress >= 100 ? ' ✓' : st.progress > 0 ? ` · ${st.progress}%` : ''}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-2.5">
                                        <Link href={`/student/paths/${p.id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">
                                            <Map className="size-4" /> လမ်းကြောင်း ကြည့်ရန်
                                        </Link>
                                        <button onClick={() => toggleJoin(p.id)} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${p.joined ? 'border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
                                            {p.joined ? 'လိုက်နာနေဆဲ ✓' : 'လမ်းကြောင်း လိုက်နာရန်'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
                </div>
            )}
        </LmsShell>
    );
}

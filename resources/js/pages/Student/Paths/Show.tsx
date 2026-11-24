import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { CheckCircle2, ChevronLeft, Circle, PlayCircle, Target } from 'lucide-react';

type Step = { id: number; slug: string; title: string; progress: number; lessons: number; hours: number };
type Path = { id: number; title: string; goal: string; grad: string; glyph: string; months: string; level: string; joined: boolean; steps: Step[]; outcomes: string[] };

export default function Show({ path }: { path: Path }) {
    const item = path;
    const joined = item.joined;
    const toggleJoin = () => router.post(`/student/paths/${item.id}/follow`, {}, { preserveScroll: true });
    const pct = item.steps.length > 0 ? Math.round(item.steps.reduce((s, st) => s + st.progress, 0) / item.steps.length) : 0;
    const done = item.steps.filter((st) => st.progress >= 100).length;
    const next = item.steps.find((st) => st.progress > 0 && st.progress < 100) ?? item.steps.find((st) => st.progress === 0) ?? null;

    return (
        <LmsShell title="သင်ယူမှု လမ်းကြောင်း" nav="student">
            <Head title={item.title} />
            <Link href="/student/paths" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> လမ်းကြောင်းများ အားလုံး</Link>

            <div className="mt-4 overflow-hidden rounded-3xl text-white" style={{ background: item.grad }}>
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
                    <span className="grid size-24 shrink-0 place-items-center rounded-2xl bg-white/15 font-mono text-4xl font-bold">{item.glyph}</span>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">{item.goal}</p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-white/80">
                            <span>အဆင့် {item.level}</span>
                            <span>ကြာချိန် ခန့်မှန်း {item.months}</span>
                            <span>သင်တန်း {item.steps.length} ခု · ပြီးစီးမှု {done}/{item.steps.length}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="max-w-md flex-1"><ProgressBar value={pct} tone="teal" /></div>
                            <span className="text-sm font-extrabold">{pct}%</span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2.5">
                            <button onClick={toggleJoin} className={`rounded-xl px-5 py-2.5 text-sm font-bold ${joined ? 'bg-white text-slate-900' : 'bg-teal-600 text-white hover:bg-teal-500'}`}>
                                {joined ? 'လိုက်နာနေဆဲ ✓' : 'လမ်းကြောင်း လိုက်နာရန်'}
                            </button>
                            {next && <Link href={`/student/courses/${next.id}/learn`} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"><PlayCircle className="size-4" /> နောက်သင်တန်း: {next.title}</Link>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အဆင့်ဆင့် သင်တန်းများ</h2>
                    <ol className="mt-4 space-y-3">
                        {item.steps.map((st, i) => (
                            <li key={st.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <span className="flex shrink-0 flex-col items-center">
                                    {st.progress >= 100 ? <CheckCircle2 className="size-6 text-emerald-600" /> : <Circle className="size-6 text-slate-300 dark:text-slate-600" />}
                                    {i < item.steps.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400">အဆင့် {i + 1}</p>
                                    <Link href={`/courses/${st.slug}`} className="font-extrabold text-slate-900 hover:text-teal-700 dark:text-white">{st.title}</Link>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{st.lessons} သင်ခန်းစာ · {st.hours} နာရီ</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex-1"><ProgressBar value={st.progress} tone="teal" /></div>
                                        <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">{st.progress}%</span>
                                    </div>
                                </div>
                                <Link href={`/student/courses/${st.id}/learn`} className="shrink-0 self-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ဖွင့်ရန်</Link>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Target className="size-5 text-teal-600" /> လမ်းကြောင်း ပြီးဆုံးလျှင် ရရှိမည့် အရာ</h2>
                        <ul className="mt-4 space-y-3">
                            {item.outcomes.map((o) => (
                                <li key={o} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" /> {o}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

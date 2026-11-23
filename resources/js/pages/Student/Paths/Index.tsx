import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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

type Props = { paths?: Path[] };

/* SAMPLE DATA — fallback only; no LearningPath model exists yet (from prototype). */
const SAMPLE_PATHS: Path[] = [
    { id: 1, title: 'Web Developer လမ်းကြောင်း', goal: 'Frontend ကနေ Backend အထိ ပြည့်စုံတဲ့ web developer တစ်ဦး ဖြစ်ရန်', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)', glyph: '</>', months: '၅–၇ လ', level: 'Beginner → Advanced', joined: true,
        steps: [
            { id: 1, title: 'HTML & CSS Foundations', progress: 68 },
            { id: 2, title: 'JavaScript Deep Dive', progress: 32 },
            { id: 4, title: 'React.js Complete Course', progress: 0 },
            { id: 9, title: 'Node.js API Development', progress: 0 },
            { id: 5, title: 'PHP & Laravel Framework', progress: 0 },
        ],
        outcomes: ['Portfolio website နဲ့ web app ၃ ခု တည်ဆောက်ပြီး', 'React ဖြင့် modern frontend တည်ဆောက်နိုင်ခြင်း', 'Node.js / Laravel ဖြင့် API တည်ဆောက်နိုင်ခြင်း', 'Junior Web Developer အလုပ်များ လျှောက်ရန် အဆင်သင့်'] },
    { id: 2, title: 'Python & Data လမ်းကြောင်း', goal: 'Python ကို ကျွမ်းကျင်ပြီး data analysis လမ်းကြောင်းသို့ ဝင်ရောက်ရန်', grad: 'linear-gradient(130deg,#14532d,#22c55e)', glyph: 'Py', months: '၄–၆ လ', level: 'Beginner → Intermediate', joined: false,
        steps: [
            { id: 3, title: 'Python for Beginners', progress: 85 },
            { id: 8, title: 'MySQL & Database Design', progress: 0 },
        ],
        outcomes: ['Python program များကို ကိုယ်တိုင် ရေးနိုင်ခြင်း', 'Database design နဲ့ SQL ကျွမ်းကျင်ခြင်း', 'Data project ၂ ခု portfolio တွင် ထည့်နိုင်ခြင်း'] },
    { id: 3, title: 'Mobile Developer လမ်းကြောင်း', goal: 'Flutter ဖြင့် Android / iOS app များ တည်ဆောက်ပြီး store ပေါ် တင်နိုင်ရန်', grad: 'linear-gradient(130deg,#123a6d,#38bdf8)', glyph: 'Fl', months: '၄–၅ လ', level: 'Beginner → Intermediate', joined: false,
        steps: [
            { id: 3, title: 'Python for Beginners', progress: 85 },
            { id: 6, title: 'Flutter Mobile Development', progress: 0 },
            { id: 10, title: 'Git, GitHub & Team Workflow', progress: 100 },
        ],
        outcomes: ['Dart နဲ့ Flutter အခြေခံ ခိုင်မာခြင်း', 'App ၂ ခု ကိုယ်တိုင် တည်ဆောက်ပြီး', 'Play Store / App Store တင်နည်း နားလည်ခြင်း'] },
    { id: 4, title: 'UI/UX Designer လမ်းကြောင်း', goal: 'Design အခြေခံကနေ professional UI/UX designer တစ်ဦး ဖြစ်ရန်', grad: 'linear-gradient(130deg,#831843,#ec4899)', glyph: 'UX', months: '၃–၄ လ', level: 'Beginner → Intermediate', joined: false,
        steps: [
            { id: 7, title: 'UI/UX Design with Figma', progress: 100 },
            { id: 1, title: 'HTML & CSS Foundations', progress: 68 },
            { id: 10, title: 'Git, GitHub & Team Workflow', progress: 100 },
        ],
        outcomes: ['Figma ကို ကျွမ်းကျင်စွာ အသုံးပြုနိုင်ခြင်း', 'Design system နဲ့ component library တည်ဆောက်နိုင်ခြင်း', 'Case study ၂ ခုပါ portfolio ပြင်ဆင်ပြီး'] },
];

export default function Index({ paths }: Props) {
    const [list, setList] = useState<Path[]>(paths && paths.length > 0 ? paths : SAMPLE_PATHS);
    const toggleJoin = (id: number) => setList((l) => l.map((p) => (p.id === id ? { ...p, joined: !p.joined } : p)));

    return (
        <LmsShell title="သင်ယူမှု လမ်းကြောင်းများ" nav="student">
            <Head title="Learning Paths" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Route className="size-7 text-teal-600" /> သင်ယူမှု လမ်းကြောင်းများ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ရည်မှန်းချက်အလိုက် အဆင့်ဆင့် စီစဉ်ထားသော သင်တန်း အစုအဖွဲ့များ</p>
            </div>

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
        </LmsShell>
    );
}

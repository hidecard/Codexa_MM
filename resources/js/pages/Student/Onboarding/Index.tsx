import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { CheckCircle2, ChevronLeft, ChevronRight, Rocket, Target } from 'lucide-react';

const GOALS = ['အလုပ် ရရန် / Career ပြောင်းရန်', 'ကိုယ်ပိုင် project ဆောက်ရန်', 'ကျောင်း/တက္ကသိုလ် အတွက် အထောက်အကူ', 'ပျော်ရွှင်မှုအတွက် လေ့လာရန်'];
const LEVELS = ['လုံးဝ အသစ် — code မရေးဖူးပါ', 'အခြေခံ နည်းနည်း သိပါတယ်', 'Project အသေးတွေ ဆောက်ဖူးပါတယ်', 'အလုပ် လုပ်နေဆဲ developer ပါ'];
const TOPICS = ['Web Development', 'Programming', 'Backend', 'Mobile', 'Design', 'Tools'];
const DAILY = ['တစ်နေ့ 15 မိနစ်', 'တစ်နေ့ 30 မိနစ်', 'တစ်နေ့ 1 နာရီ', 'တစ်နေ့ 2 နာရီ+'];

const RECOMMENDATIONS: Record<string, { path: string; href: string; courses: { title: string; href: string }[] }> = {
    'Web Development': { path: 'Web Developer လမ်းကြောင်း', href: '/student/paths/1', courses: [{ title: 'HTML & CSS Foundations', href: '/courses/html-css-foundations' }, { title: 'JavaScript Deep Dive', href: '/courses/javascript-deep-dive' }] },
    Programming: { path: 'Python & Data လမ်းကြောင်း', href: '/student/paths/2', courses: [{ title: 'Python for Beginners', href: '/courses/python-for-beginners' }, { title: 'Git, GitHub & Team Workflow', href: '/courses/git-github-team-workflow' }] },
    Backend: { path: 'Web Developer လမ်းကြောင်း', href: '/student/paths/1', courses: [{ title: 'PHP & Laravel Framework', href: '/courses/php-laravel-framework' }, { title: 'MySQL & Database Design', href: '/courses/mysql-database-design' }] },
    Mobile: { path: 'Mobile Developer လမ်းကြောင်း', href: '/student/paths/3', courses: [{ title: 'Flutter Mobile Development', href: '/courses/flutter-mobile-development' }] },
    Design: { path: 'UI/UX Designer လမ်းကြောင်း', href: '/student/paths/4', courses: [{ title: 'UI/UX Design with Figma', href: '/courses/ui-ux-design-with-figma' }, { title: 'HTML & CSS Foundations', href: '/courses/html-css-foundations' }] },
    Tools: { path: 'Web Developer လမ်းကြောင်း', href: '/student/paths/1', courses: [{ title: 'Git, GitHub & Team Workflow', href: '/courses/git-github-team-workflow' }] },
};

export default function Index() {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [daily, setDaily] = useState('');
    const [done, setDone] = useState(false);

    const toggleTopic = (t: string) => setTopics((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
    const canNext = step === 1 ? goal !== '' : step === 2 ? level !== '' : step === 3 ? topics.length > 0 : daily !== '';
    const rec = RECOMMENDATIONS[topics[0] ?? ''] ?? RECOMMENDATIONS['Web Development'];

    const optionBtn = (selected: boolean) =>
        `w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-900/20' : 'border-slate-200 bg-white hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-600'}`;

    if (done) {
        return (
            <LmsShell title="ကြိုဆိုပါတယ်" nav="student">
                <Head title="Onboarding" />
                <div className="mx-auto max-w-2xl text-center">
                    <Rocket className="mx-auto size-16 text-teal-600" />
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">စတင်ရန် အဆင်သင့်ဖြစ်ပါပြီ!</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        သင့်ရည်မှန်းချက် — {goal} · {level} · {daily} လေ့လာရန် စီစဉ်ထားပါတယ်။
                    </p>
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-slate-800 dark:bg-slate-900">
                        <p className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><Target className="size-5 text-teal-600" /> သင့်အတွက် အကြံပြုထားသော လမ်းကြောင်း</p>
                        <Link href={rec.href} className="mt-2 block text-lg font-extrabold text-teal-700 hover:text-teal-800 dark:text-teal-300">{rec.path}</Link>
                        <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">စတင် သင်ယူရန် သင်တန်းများ</p>
                        <ul className="mt-2 space-y-2">
                            {rec.courses.map((c) => (
                                <li key={c.title}><Link href={c.href} className="text-sm font-bold text-slate-900 hover:text-teal-700 dark:text-white">→ {c.title}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Link href="/student/dashboard" className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700">Dashboard သို့ သွားရန်</Link>
                        <Link href={rec.href} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">လမ်းကြောင်း ကြည့်ရန်</Link>
                    </div>
                </div>
            </LmsShell>
        );
    }

    return (
        <LmsShell title="ကြိုဆိုပါတယ်" nav="student">
            <Head title="Onboarding" />
            <div className="mx-auto max-w-2xl">
                <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ကြိုဆိုပါတယ် — စတင် ပြင်ဆင်ကြရအောင်</h1>
                <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">အဆင့် ၄ ဆင့်ပဲ လိုပါတယ် — သင့်အတွက် သင့်တော်တဲ့ သင်ယူမှု လမ်းကြောင်းကို အကြံပြုပေးပါမယ်</p>
                <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1"><ProgressBar value={(step / 4) * 100} tone="teal" /></div>
                    <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">အဆင့် {step} / 4</span>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                    {step === 1 && (
                        <>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">သင် ဘာကြောင့် သင်ယူချင်တာလဲ?</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ရည်မှန်းချက် တစ်ခုကို ရွေးချယ်ပါ</p>
                            <div className="mt-5 grid gap-3">
                                {GOALS.map((g) => (
                                    <button key={g} onClick={() => setGoal(g)} className={optionBtn(goal === g)}>
                                        <span className="flex items-center justify-between gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white">{g}</span>
                                            {goal === g && <CheckCircle2 className="size-5 shrink-0 text-teal-600" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">သင့်အဆင့် ဘယ်လောက်ရှိပြီလဲ?</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">မှန်ကန်သော အဆင့်ကို ရွေးချယ်ပါ — သင်တန်း အကြံပြုချက်အတွက် အသုံးပြုပါမည်</p>
                            <div className="mt-5 grid gap-3">
                                {LEVELS.map((l) => (
                                    <button key={l} onClick={() => setLevel(l)} className={optionBtn(level === l)}>
                                        <span className="flex items-center justify-between gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white">{l}</span>
                                            {level === l && <CheckCircle2 className="size-5 shrink-0 text-teal-600" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">ဘယ် အကြောင်းအရာတွေကို စိတ်ဝင်စားလဲ?</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">တစ်ခုထက် ပိုရွေးနိုင်ပါသည်</p>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {TOPICS.map((t) => (
                                    <button key={t} onClick={() => toggleTopic(t)} className={optionBtn(topics.includes(t))}>
                                        <span className="flex items-center justify-between gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white">{t}</span>
                                            {topics.includes(t) && <CheckCircle2 className="size-5 shrink-0 text-teal-600" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">တစ်နေ့ ဘယ်လောက် လေ့လာနိုင်မလဲ?</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">နေ့စဉ် ရည်မှန်းချက်ကို သတ်မှတ်ပါ — streak ထိန်းရန် အထောက်အကူ ပြုပါမည်</p>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {DAILY.map((d) => (
                                    <button key={d} onClick={() => setDaily(d)} className={optionBtn(daily === d)}>
                                        <span className="flex items-center justify-between gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white">{d}</span>
                                            {daily === d && <CheckCircle2 className="size-5 shrink-0 text-teal-600" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-8 flex items-center justify-between">
                        {step > 1 ? (
                            <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ChevronLeft className="size-4" /> ယခင်</button>
                        ) : (
                            <Link href="/student/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400">နောက်မှ လုပ်ရန်</Link>
                        )}
                        {step < 4 ? (
                            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">ဆက်သွားရန် <ChevronRight className="size-4" /></button>
                        ) : (
                            <button onClick={() => setDone(true)} disabled={!canNext} className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">ပြီးဆုံးပြီး စတင်ရန် <Rocket className="size-4" /></button>
                        )}
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

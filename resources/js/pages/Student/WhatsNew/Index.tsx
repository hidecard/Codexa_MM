import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Sparkles } from 'lucide-react';

type Entry = { v: string; date: string; tag: 'feature' | 'improve' | 'fix'; title: string; body: string; go: string; goLabel: string };
type Props = { entries?: Entry[] };

/* SAMPLE DATA — release notes from the prototype (static content). */
const SAMPLE: Entry[] = [
    { v: '2.4', date: 'နိုဝင်ဘာ 22, 2026', tag: 'feature', title: 'Instructor workspace အပြည့်အစုံ', body: 'Instructor Dashboard, သင်တန်း ဖန်တီးရန် Wizard, ကျောင်းသား မေးခွန်းများနဲ့ ဝင်ငွေ အသေးစိတ် page တွေ ထည့်သွင်းထားပါတယ်။', go: '/student/dashboard', goLabel: 'Dashboard ကြည့်ရန်' },
    { v: '2.4', date: 'နိုဝင်ဘာ 22, 2026', tag: 'feature', title: 'Study Groups နဲ့ Gift Cards', body: 'အတူတူ လေ့လာမယ့် အဖွဲ့တွေ ဖွဲ့နိုင်ပြီး သူငယ်ချင်းတွေကို သင်တန်း လက်ဆောင်ကတ် ပို့နိုင်ပါပြီ။', go: '/student/study-groups', goLabel: 'Study Groups ကြည့်ရန်' },
    { v: '2.3', date: 'နိုဝင်ဘာ 15, 2026', tag: 'feature', title: 'Code Challenge နဲ့ XP ဆုများ', body: 'နေ့စဉ် coding challenge တွေ ဖြေပြီး XP စုနိုင်ပါတယ်။ Challenge အသစ် 6 ခု ထည့်ထားပါတယ်။', go: '/student/challenges', goLabel: 'Challenge ဖြေကြည့်ရန်' },
    { v: '2.3', date: 'နိုဝင်ဘာ 15, 2026', tag: 'improve', title: 'ဖုန်း bottom navigation ပိုမို မြန်ဆန်', body: "စာမျက်နှာ ပြောင်းလဲမှု animation တွေ ပိုချောမွေ့အောင် ပြင်ထားပြီး 'နောက်ထပ်' menu မှာ page အားလုံး ရှာရလွယ်အောင် စီထားပါတယ်။", go: '/student/dashboard', goLabel: 'ပင်မစာမျက်နှာ' },
    { v: '2.2', date: 'နိုဝင်ဘာ 8, 2026', tag: 'feature', title: 'Landing page အသစ်', body: 'အများပြည်သူ မြင်ရတဲ့ homepage — သင်တန်း filter, ဈေးနှုန်း plan toggle နဲ့ testimonial slider အပါအဝင် ထုတ်ပြန်ထားပါတယ်။', go: '/', goLabel: 'Landing Page ကြည့်ရန်' },
    { v: '2.2', date: 'နိုဝင်ဘာ 8, 2026', tag: 'fix', title: 'Dropdown menu ပြဿနာ ပြင်ဆင်', body: 'Profile နဲ့ အသိပေးချက် dropdown တွေ အပြင် နှိပ်ရင် မပိတ်တဲ့ ပြဿနာကို ပြင်ထားပါတယ်။', go: '/student/help', goLabel: 'အကူအညီ ကြည့်ရန်' },
];

const TAGS: Record<Entry['tag'], { label: string; cls: string }> = {
    feature: { label: 'အသစ်', cls: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    improve: { label: 'တိုးတက်', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
    fix: { label: 'ပြင်ဆင်', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

export default function Index({ entries }: Props) {
    const list = entries && entries.length > 0 ? entries : SAMPLE;
    const [filter, setFilter] = useState<'all' | Entry['tag']>('all');
    const filtered = list.filter((w) => filter === 'all' || w.tag === filter);

    return (
        <LmsShell title="အသစ်ထွက်ရှိမှုများ" nav="student">
            <Head title="What's New" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Sparkles className="size-7 text-teal-600" /> အသစ်ထွက်ရှိမှုများ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Codexa MM platform ၏ နောက်ဆုံးရ အပြောင်းအလဲများနှင့် လုပ်ဆောင်ချက် အသစ်များ</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'အားလုံး' },
                    { key: 'feature', label: 'အသစ်' },
                    { key: 'improve', label: 'တိုးတက်' },
                    { key: 'fix', label: 'ပြင်ဆင်' },
                ] as { key: 'all' | Entry['tag']; label: string }[]).map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {filtered.map((w, i) => {
                    const t = TAGS[w.tag];
                    return (
                        <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.cls}`}>{t.label}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">v{w.v}</span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{w.date}</span>
                            </div>
                            <h3 className="mt-3 font-extrabold text-slate-900 dark:text-white">{w.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{w.body}</p>
                            <Link href={w.go} className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">{w.goLabel} →</Link>
                        </article>
                    );
                })}
            </div>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { Award, BookOpen, Flame, HelpCircle, MessageCircle, Moon, Target, Video } from 'lucide-react';

type Achievement = { name: string; desc: string; icon: string; earned: boolean; date?: string; cur?: number; total?: number; unit?: string };
type XpEntry = { label: string; xp: number; when: string };
type Props = { achievements?: Achievement[]; xpHistory?: XpEntry[]; totalXp?: number };

/* SAMPLE DATA — fallback only; no gamification backend exists yet (from prototype). */
const SAMPLE_ACHIEVEMENTS: Achievement[] = [
    { name: 'ပထမဆုံး သင်တန်း', desc: 'သင်တန်း 1 ခု ပြီးဆုံးပြီး', icon: 'book', earned: true, date: 'စက်တင်ဘာ 02' },
    { name: 'ပထမဆုံး လက်မှတ်', desc: 'Certificate 1 စောင် ရရှိပြီး', icon: 'cert', earned: true, date: 'စက်တင်ဘာ 02' },
    { name: '12 ရက် Streak', desc: '12 ရက် ဆက်တိုက် လေ့လာပြီး', icon: 'flame', earned: true, date: 'နိုဝင်ဘာ 22' },
    { name: 'Quiz Master', desc: 'Quiz 10 ခု အောင်မြင်ပြီး', icon: 'quiz', earned: true, date: 'နိုဝင်ဘာ 10' },
    { name: 'Assignment Star', desc: 'Assignment 14 ခု ပြီးဆုံးပြီး', icon: 'pen', earned: true, date: 'နိုဝင်ဘာ 18' },
    { name: 'Community Helper', desc: 'Community မှာ အကူအညီ အဖြေ 10 ခု ပေးပြီး', icon: 'chat', earned: true, date: 'နိုဝင်ဘာ 15' },
    { name: 'သင်တန်း 5 ခု ပြီးဆုံး', desc: 'သင်တန်း 5 ခု ပြီးဆုံးရန်', icon: 'cert', earned: false, cur: 3, total: 5, unit: 'ခု' },
    { name: '30 ရက် Streak', desc: '30 ရက် ဆက်တိုက် လေ့လာရန်', icon: 'flame', earned: false, cur: 12, total: 30, unit: 'ရက်' },
    { name: 'Perfect Quiz', desc: 'Quiz မှာ အမှတ်ပြည့် 3 ကြိမ် ရရန်', icon: 'quiz', earned: false, cur: 2, total: 3, unit: 'ကြိမ်' },
    { name: 'Live Regular', desc: 'Live class 5 ခု တက်ရောက်ရန်', icon: 'live', earned: false, cur: 3, total: 5, unit: 'ခု' },
    { name: 'Night Owl', desc: 'ည 10 နာရီနောက်ပိုင်း 10 ရက် လေ့လာရန်', icon: 'moon', earned: false, cur: 6, total: 10, unit: 'ရက်' },
    { name: 'XP 5,000', desc: 'စုစုပေါင်း 5,000 XP ပြည့်ရန်', icon: 'target', earned: false, cur: 2310, total: 5000, unit: 'XP' },
];
const SAMPLE_XP: XpEntry[] = [
    { label: 'Assignment တင်သွင်းပြီး — JS Array Methods', xp: 80, when: 'ယနေ့' },
    { label: 'သင်ခန်းစာ ပြီးဆုံး — Python OOP Basics', xp: 20, when: 'ယနေ့' },
    { label: 'နေ့စဉ် streak bonus', xp: 10, when: 'ယနေ့' },
    { label: 'Live class တက်ရောက်ပြီး — CSS Grid Masterclass', xp: 40, when: 'မနေ့က' },
    { label: 'Quiz အောင်မြင် — Python Chapter 5', xp: 50, when: 'မနေ့က' },
    { label: 'သင်ခန်းစာ ၃ ခု ပြီးဆုံး — JavaScript Deep Dive', xp: 60, when: 'လွန်ခဲ့သော 2 ရက်' },
];

const ICONS: Record<string, typeof Award> = {
    book: BookOpen,
    cert: Award,
    flame: Flame,
    quiz: HelpCircle,
    pen: Award,
    chat: MessageCircle,
    live: Video,
    moon: Moon,
    target: Target,
};

export default function Index({ achievements, xpHistory, totalXp = 2310 }: Props) {
    const list = achievements && achievements.length > 0 ? achievements : SAMPLE_ACHIEVEMENTS;
    const xp = xpHistory && xpHistory.length > 0 ? xpHistory : SAMPLE_XP;
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
    const earned = list.filter((a) => a.earned);
    const filtered = list.filter((a) => filter === 'all' || (filter === 'earned' ? a.earned : !a.earned));
    const level = Math.floor(totalXp / 500) + 1;
    const levelProgress = ((totalXp % 500) / 500) * 100;

    return (
        <LmsShell title="အောင်မြင်မှုများ" nav="student">
            <Head title="Achievements" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Award className="size-7 text-amber-500" /> အောင်မြင်မှုများ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ရရှိထားတဲ့ badge {earned.length} ခု · စုစုပေါင်း {totalXp.toLocaleString()} XP · Level {level}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-extrabold text-slate-900 dark:text-white">Level {level} <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">→ Level {level + 1} သို့ {500 - (totalXp % 500)} XP လိုပါသေးတယ်</span></p>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{totalXp.toLocaleString()} XP</span>
                </div>
                <div className="mt-3"><ProgressBar value={levelProgress} tone="amber" /></div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'အားလုံး' },
                    { key: 'earned', label: 'ရရှိပြီးသား' },
                    { key: 'locked', label: 'မရသေးသော' },
                ] as { key: 'all' | 'earned' | 'locked'; label: string }[]).map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((a) => {
                    const Icon = ICONS[a.icon] ?? Award;
                    const pct = a.total ? Math.round(((a.cur ?? 0) / a.total) * 100) : 0;
                    return (
                        <article key={a.name} className={`rounded-2xl border p-5 dark:border-slate-800 ${a.earned ? 'border-slate-200 bg-white dark:bg-slate-900' : 'border-slate-200 bg-white/60 opacity-80 dark:bg-slate-900/60'}`}>
                            <div className="flex items-start gap-3">
                                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${a.earned ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}><Icon className="size-6" /></span>
                                <div>
                                    <h3 className="font-extrabold leading-snug text-slate-900 dark:text-white">{a.name}</h3>
                                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{a.desc}</p>
                                </div>
                            </div>
                            {a.earned ? (
                                <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ ရရှိပြီးပါပြီ{a.date ? ` · ${a.date}` : ''}</p>
                            ) : (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <span>{a.cur?.toLocaleString()} / {a.total?.toLocaleString()} {a.unit ?? ''}</span>
                                        <span>{pct}%</span>
                                    </div>
                                    <div className="mt-2"><ProgressBar value={pct} tone="teal" /></div>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">XP မှတ်တမ်း</h2>
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                    {xp.map((x, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 py-3">
                            <span>
                                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{x.label}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{x.when}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-sm font-extrabold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">+{x.xp} XP</span>
                        </li>
                    ))}
                </ul>
            </div>
        </LmsShell>
    );
}

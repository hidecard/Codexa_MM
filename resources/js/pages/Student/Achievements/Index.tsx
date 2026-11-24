import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { Award, BookOpen, Flame, HelpCircle, MessageCircle, Moon, Target, Video } from 'lucide-react';

type Achievement = { name: string; desc: string; icon: string; earned: boolean; date?: string | null; cur?: number; total?: number; unit?: string };
type XpEntry = { label: string; xp: number; when: string };
type Props = { achievements?: Achievement[]; xpHistory?: XpEntry[]; totalXp?: number };

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

export default function Index({ achievements = [], xpHistory = [], totalXp = 0 }: Props) {
    const list = achievements;
    const xp = xpHistory;
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

            {filtered.length === 0 && (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    {filter === 'earned' ? 'Badge မရရှိသေးပါ — သင်ခန်းစာများ ပြီးဆုံးအောင် လေ့လာလိုက်ပါ။' : 'Badge မရှိသေးပါ။'}
                </p>
            )}

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
                {xp.length === 0 && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">XP မှတ်တမ်း မရှိသေးပါ — သင်ခန်းစာ ပြီးဆုံးခြင်း၊ Quiz အောင်မြင်ခြင်း၊ Assignment တင်သွင်းခြင်းတို့မှ XP ရနိုင်ပါတယ်။</p>}
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

import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { Award, Bell, BookOpen, Crown, Flame, MapPin, Pencil, ShieldCheck, Target, Trophy } from 'lucide-react';
import { formatNumber } from '@/lib/format';

const ICON_MAP: Record<string, React.ElementType> = {
    award: Award,
    book: BookOpen,
    cert: Award,
    flame: Flame,
    quiz: BookOpen,
    pen: Award,
    chat: Award,
    live: Award,
    moon: Award,
    target: Target,
};

const GOALS = ['Web Developer ဖြစ်ရန်', 'Mobile Developer ဖြစ်ရန်', 'UI/UX Designer ဖြစ်�ရန်', 'Freelance လုပ်ရန်'];

type Badge = {
    name: string;
    desc: string;
    icon: string;
    earned: boolean;
    date: string | null;
    cur: number;
    total: number;
    unit: string;
};

type Props = {
    stats?: { enrolled?: number; watch_hours?: number; streak_days?: number; certificates?: number };
    badges?: Badge[];
    totalXp?: number;
};

export default function Profile({ stats = {}, badges = [], totalXp = 0 }: Props) {
    const { auth } = usePage<{ auth?: { user?: { name?: string | null; email?: string | null } } }>().props;
    const user = auth?.user;
    const name = user?.name ?? 'ကျောင်းသား';
    const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState(name);
    const [city, setCity] = useState('Yangon, Myanmar');
    const [bio, setBio] = useState('ရည်မှန်းချက် — Web Developer အဖြစ် အလုပ်ဝင်နိုင်ရန် React နဲ့ Backend ကို အဓိက လေ့လာနေပါတယ်။');
    const [goal, setGoal] = useState(GOALS[0]);
    const [language, setLanguage] = useState<'my' | 'en'>('my');
    const [saved, setSaved] = useState(false);
    const [notifLive, setNotifLive] = useState(true);
    const [notifAssignments, setNotifAssignments] = useState(true);
    const [notifCommunity, setNotifCommunity] = useState(false);

    const save = () => { setSaved(true); setEditing(false); };

    const toggle = (on: boolean, set: (v: boolean) => void) => (
        <button
            onClick={() => set(!on)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            aria-label="toggle"
        >
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
    );

    const badgeIcon = (iconKey: string) => {
        const Icon = ICON_MAP[iconKey] ?? Award;
        return <Icon className="size-5" />;
    };

    return (
        <LmsShell title="Profile & Settings" nav="student">
            <Head title="Profile" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Profile & Settings</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင့်အကောင့် အချက်အလက်၊ အောင်မြင်မှုများနဲ့ ချိန်ညှိမှုများကို ဒီနေရာမှာ စီမံနိုင်ပါတယ်</p>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <div className="flex flex-wrap items-center gap-5">
                    <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-teal-600 text-2xl font-extrabold">{initials}</span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-extrabold">{displayName}</h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-amber-950"><Crown className="size-3" /> PRO PLAN</span>
                            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold">LEVEL {Math.max(1, Math.floor(totalXp / 500))}</span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-300">
                            <MapPin className="size-4" /> {city} · {formatNumber(totalXp)} XP
                        </p>
                        {user?.email && <p className="mt-0.5 text-sm text-slate-400">{user.email}</p>}
                        <p className="mt-2 max-w-xl text-sm text-slate-300">{bio}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditing((e) => !e)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20">
                            <Pencil className="size-4" /> Profile ပြင်ဆင်ရန်
                        </button>
                        <Link href="/student/certificates" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500">
                            <Award className="size-4" /> လက်မှတ်များ ကြည့်ရန်
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="စာရင်းသွင်း သင်တန်း" value={stats.enrolled ?? 0} tone="teal" />
                <StatCard label="လေ့လာချိန်" value={`${stats.watch_hours ?? 0} နာရီ`} tone="blue" />
                <StatCard label="ဆက်တိုက် လေ့လာမှု" value={`${stats.streak_days ?? 0} ရက်`} tone="amber" />
                <StatCard label="လက်မှတ်" value={stats.certificates ?? 0} tone="purple" />
            </div>

            {editing && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Profile ပြင်ဆင်ရန်</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အမည်</span>
                            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">မြို့</span>
                            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Bio</span>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အဓိက ရည်မှန်းချက်</span>
                            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </label>
                        <div>
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Interface ဘာသာစကား</span>
                            <div className="flex gap-2">
                                <button onClick={() => setLanguage('my')} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${language === 'my' ? 'bg-teal-600 text-white' : 'border border-slate-200 dark:border-slate-700'}`}>မြန်မာ</button>
                                <button onClick={() => setLanguage('en')} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${language === 'en' ? 'bg-teal-600 text-white' : 'border border-slate-200 dark:border-slate-700'}`}>English</button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button onClick={save} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">သိမ်းရန်</button>
                        {saved && <span className="text-sm font-semibold text-emerald-600">သိမ်းပြီးပါပြီ (ဤ browser တွင်သာ)</span>}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">အကောင့် အမည်/အီးမေးလ် အပြောင်းအလဲ အပြည့်အစုံအတွက် အကောင့် ဆက်တင်များကို အသုံးပြုပါ။</p>
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SectionCard title="အောင်မြင်မှု Badges" action={<Link href="/student/achievements" className="text-sm font-bold text-teal-600 hover:text-teal-700">အားလုံး</Link>}>
                    {badges.length > 0 ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ရရှိထားတဲ့ badge {badges.filter((b) => b.earned).length} ခု · နောက်ထပ် {badges.filter((b) => !b.earned).length} ခု ရရန် ကျန်ပါသေးတယ်
                            </p>
                            <ul className="mt-4 space-y-3">
                                {badges.map((b) => (
                                    <li key={b.name} className={`flex items-center gap-3 rounded-xl p-3 ${b.earned ? 'bg-slate-50 dark:bg-slate-800' : 'bg-slate-50/60 opacity-60 dark:bg-slate-800/60'}`}>
                                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${b.earned ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                                            {badgeIcon(b.icon)}
                                        </span>
                                        <span>
                                            <span className="block font-bold text-slate-900 dark:text-white">{b.name}</span>
                                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                                {b.desc}
                                                {!b.earned && ' · မရသေးပါ'}
                                                {b.cur !== undefined && b.total !== undefined && (
                                                    <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                                                        ({b.cur} / {b.total} {b.unit})
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Badges မရှိသေးပါ။</p>
                    )}
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="လက်ရှိ PLAN" action={<Link href="/student/membership" className="text-sm font-bold text-teal-600 hover:text-teal-700">Plan စီမံရန်</Link>}>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">Pro Plan</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သက်တမ်း — 2027 ဇန်နဝါရီ 15 အထိ · 30,000 ကျပ် / လ</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">သင်တန်းအားလုံး unlimited, Live class အားလုံး, လက်မှတ်နဲ့ ဆရာ feedback ပါဝင်ပါတယ်။</p>
                    </SectionCard>

                    <SectionCard title="အသိပေးချက် ချိန်ညှိမှုများ">
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-3"><Bell className="size-5 text-teal-600" /><span><span className="block font-bold text-slate-900 dark:text-white">Live class သတိပေးချက်</span><span className="block text-xs text-slate-500 dark:text-slate-400">အတန်း မစခင် 30 မိနစ် အလို</span></span></span>
                                {toggle(notifLive, setNotifLive)}
                            </li>
                            <li className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-3"><Bell className="size-5 text-teal-600" /><span><span className="block font-bold text-slate-900 dark:text-white">Assignment သတိပေးချက်</span><span className="block text-xs text-slate-500 dark:text-slate-400">သတ်မှတ် ရက် နီးလာလျှင်</span></span></span>
                                {toggle(notifAssignments, setNotifAssignments)}
                            </li>
                            <li className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-3"><Bell className="size-5 text-teal-600" /><span><span className="block font-bold text-slate-900 dark:text-white">Community အကြောင်းကြားချက်</span><span className="block text-xs text-slate-500 dark:text-slate-400">မှတ်ချက် အသစ် ရရှိလျှင်</span></span></span>
                                {toggle(notifCommunity, setNotifCommunity)}
                            </li>
                        </ul>
                    </SectionCard>

                    <SectionCard title="အကောင့် & လုံခြုံရေး">
                        <div className="flex flex-wrap gap-2">
                            <Link href="/student/security" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ShieldCheck className="size-4" /> လုံခြုံရေး</Link>
                            <Link href="/student/payment-methods" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ငွေပေးချေမှု နည်းလမ်းများ</Link>
                            <Link href="/student/payments" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ငွေပေးချေမှု မှတ်တမ်း</Link>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </LmsShell>
    );
}
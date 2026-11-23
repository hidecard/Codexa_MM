import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { Award, Plus, Save } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Badge = { name: string; desc: string; xp: number; icon: string; active: boolean };
type XpRule = { key: string; label: string; xp: number };

export default function Index({ badges = [], xpRules = [] }: { badges?: Badge[]; xpRules?: XpRule[] }) {
    const [rules, setRules] = useState<XpRule[]>(xpRules);
    const [newName, setNewName] = useState('');
    const [newXp, setNewXp] = useState(50);
    const [notice, setNotice] = useState('');
    const [noticeError, setNoticeError] = useState(false);

    const showError = (errors: Record<string, string>) => {
        setNoticeError(true);
        setNotice(Object.values(errors)[0] ?? 'အမှား ဖြစ်သွားပါတယ် — ပြန်စမ်းကြည့်ပါ');
    };

    const saveBadges = (next: Badge[], message: string) => {
        router.put(
            '/admin/academy/gamification',
            { badges: next },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice(message);
                },
                onError: showError,
            },
        );
    };

    const toggle = (name: string) => {
        const badge = badges.find((b) => b.name === name);
        if (!badge) return;
        saveBadges(
            badges.map((b) => (b.name === name ? { ...b, active: !b.active } : b)),
            badge.active ? 'Badge ပိတ်ပြီးပါပြီ' : 'Badge ဖွင့်ပြီးပါပြီ',
        );
    };

    const addBadge = (e: FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        saveBadges([...badges, { name: newName.trim(), desc: 'Badge အသစ်', xp: newXp, icon: '🏅', active: true }], 'Badge ထည့်ပြီးပါပြီ');
        setNewName('');
    };

    const saveRules = () => {
        const payload: Record<string, number> = {};
        rules.forEach((r) => {
            payload[r.key] = r.xp;
        });
        router.put('/admin/academy/gamification', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setNoticeError(false);
                setNotice('XP စံနှုန်းများ သိမ်းပြီးပါပြီ');
            },
            onError: showError,
        });
    };

    return (
        <LmsShell title="ဆုတံဆိပ် & XP စီမံရန်" nav="admin">
            <Head title="ဆုတံဆိပ် & XP စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="ဆုတံဆိပ် & XP စီမံရန်"
                description="Badge တွေ ပိတ်/ဖွင့်တာနဲ့ XP စံနှုန်းတွေ ပြင်တာက ကျောင်းသားဘက် ဆုတံဆိပ်များ page မှာ ချက်ချင်း သက်ရောက်ပါတယ်"
            />

            {notice && (
                <div
                    className={cn(
                        'mt-6 rounded-xl border px-4 py-3 text-sm font-medium',
                        noticeError
                            ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                            : 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200',
                    )}
                >
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="Badge စာရင်း">
                    <div className="space-y-3">
                        {badges.map((b) => (
                            <div key={b.name} className={`flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a] ${b.active ? '' : 'opacity-55'}`}>
                                <span className="grid size-11 flex-none place-items-center rounded-xl bg-amber-500/10 text-2xl">{b.icon}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{b.name}</p>
                                        {b.active ? <Pill tone="teal">ဖွင့်ထား</Pill> : <Pill tone="slate">ပိတ်ထား</Pill>}
                                    </div>
                                    <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                        {b.desc} · {b.xp} XP
                                    </p>
                                </div>
                                <button type="button" className={btnGhostCls} onClick={() => toggle(b.name)}>
                                    {b.active ? 'ပိတ်ရန်' : 'ဖွင့်ရန်'}
                                </button>
                            </div>
                        ))}
                        {badges.length === 0 && <p className={`py-4 text-center text-sm ${mutedCls}`}>Badge မရှိသေးပါ</p>}
                    </div>
                    <form onSubmit={addBadge} className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-[#18264a]">
                        <input className={`${inputCls} min-w-[160px] flex-1`} placeholder="Badge အသစ် အမည်" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                        <input className={`${inputCls} w-24`} type="number" min={1} value={newXp} onChange={(e) => setNewXp(Number(e.target.value))} />
                        <button type="submit" className={btnAccentCls}>
                            <Plus className="size-4" /> ထည့်ရန်
                        </button>
                    </form>
                </SectionCard>

                <div className="space-y-5">
                    <SectionCard title="XP စံနှုန်းများ">
                        <div className="space-y-3">
                            {rules.map((r, i) => (
                                <div key={r.key} className="flex items-center gap-3">
                                    <span className={`min-w-0 flex-1 text-sm font-medium ${inkCls}`}>{r.label}</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={r.xp}
                                        onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, xp: Number(e.target.value) } : x)))}
                                        className="w-24"
                                    />
                                    <span className={`text-sm font-bold ${mutedCls}`}>XP</span>
                                </div>
                            ))}
                        </div>
                        <button type="button" className={`${btnAccentCls} mt-4`} onClick={saveRules}>
                            <Save className="size-4" /> စံနှုန်းများ သိမ်းရန်
                        </button>
                        <p className={`mt-3 text-[.8rem] ${mutedCls}`}>XP စံနှုန်း ပြောင်းရင် နောက်ပိုင်း လုပ်ဆောင်ချက်တွေမှာပဲ သက်ရောက်ပါတယ်။ ရပြီးသား XP ကို ပြန်မပြောင်းပါ။</p>
                    </SectionCard>

                    <LmsCard className="flex items-center gap-3.5 p-5">
                        <span className="grid size-11 flex-none place-items-center rounded-xl bg-violet-600/10 text-violet-700 dark:text-violet-300">
                            <Award className="size-5" />
                        </span>
                        <div>
                            <p className={`font-extrabold ${inkCls}`}>Badge {badges.filter((b) => b.active).length} ခု ဖွင့်ထားပါတယ်</p>
                            <p className={`mt-0.5 text-sm ${mutedCls}`}>စုစုပေါင်း {badges.length} ခု · ကျောင်းသားတွေ Leaderboard မှာ XP နဲ့ ယှဉ်ပြိုင်နိုင်ပါတယ်</p>
                        </div>
                    </LmsCard>
                </div>
            </div>
        </LmsShell>
    );
}

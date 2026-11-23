import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Award, Plus, Save } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

// SAMPLE DATA fallback (prototype achievements + XP rules): no gamification backend yet.
const SAMPLE_BADGES = [
    { name: 'First Steps', desc: 'ပထမဆုံး သင်ခန်းစာ ပြီးဆုံးခြင်း', xp: 20, icon: '🎯' },
    { name: 'Quiz Master', desc: 'Quiz 10 ခု အောင်မြင်ခြင်း', xp: 100, icon: '🧠' },
    { name: 'Streak 7', desc: '၇ ရက် ဆက်တိုက် သင်ယူခြင်း', xp: 70, icon: '🔥' },
    { name: 'Project Builder', desc: 'Assignment 5 ခု တင်သွင်းခြင်း', xp: 150, icon: '🛠️' },
    { name: 'Live Learner', desc: 'Live class 5 ခု တက်ရောက်ခြင်း', xp: 80, icon: '📺' },
    { name: 'Course Completer', desc: 'သင်တန်း ၁ ခု အပြီးသတ်ခြင်း', xp: 200, icon: '🎓' },
];

const SAMPLE_XP_RULES = [
    { label: 'သင်ခန်းစာ ၁ ခု ပြီးဆုံးခြင်း', xp: 20 },
    { label: 'Quiz အောင်မြင်ခြင်း', xp: 50 },
    { label: 'Assignment တင်သွင်းခြင်း', xp: 80 },
    { label: 'Live class တက်ရောက်ခြင်း', xp: 40 },
    { label: 'Code Challenge အောင်မြင်ခြင်း', xp: 30 },
    { label: 'နေ့စဉ် streak bonus', xp: 10 },
];

export default function Index() {
    const [badges, setBadges] = useState(SAMPLE_BADGES.map((b) => ({ ...b, active: true })));
    const [rules, setRules] = useState(SAMPLE_XP_RULES);
    const [newName, setNewName] = useState('');
    const [newXp, setNewXp] = useState(50);
    const [notice, setNotice] = useState('');

    const toggle = (name: string) => setBadges(badges.map((b) => (b.name === name ? { ...b, active: !b.active } : b)));

    const addBadge = (e: FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setBadges([...badges, { name: newName.trim(), desc: 'Badge အသစ်', xp: newXp, icon: '🏅', active: true }]);
        setNewName('');
        setNotice('Badge ထည့်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const saveRules = () => setNotice('XP စံနှုန်းများ သိမ်းပြီးပါပြီ (ဤ page မှာသာ)');

    return (
        <LmsShell title="ဆုတံဆိပ် & XP စီမံရန်" nav="admin">
            <Head title="ဆုတံဆိပ် & XP စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="ဆုတံဆိပ် & XP စီမံရန်"
                description="Badge တွေ ပိတ်/ဖွင့်တာနဲ့ XP စံနှုန်းတွေ ပြင်တာက ကျောင်းသားဘက် ဆုတံဆိပ်များ page မှာ ချက်ချင်း သက်ရောက်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
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
                                <div key={r.label} className="flex items-center gap-3">
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

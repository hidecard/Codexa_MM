import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { Award, BookOpen, Flame, HelpCircle, MessageCircle, Moon, Pencil, Plus, Save, Target, Trash2, Video, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnDangerCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls, selectCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Badge = { id: number; name: string; description: string; icon: string; rule_type: string; threshold: number; is_active: boolean };
type XpRule = { key: string; label: string; xp: number };
type RuleType = { value: string; label: string; unit: string };

const ICONS: Record<string, typeof Award> = {
    award: Award,
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

const ICON_LABELS: Record<string, string> = {
    award: 'ဆု (Award)',
    book: 'စာအုပ်',
    cert: 'လက်မှတ်',
    flame: 'မီး',
    quiz: 'Quiz',
    pen: 'ဘောပင်',
    chat: 'စကားပြော',
    live: 'Live',
    moon: 'လ',
    target: 'ပစ်မှတ်',
};

type BadgeForm = { name: string; description: string; icon: string; rule_type: string; threshold: number };

const EMPTY_FORM: BadgeForm = { name: '', description: '', icon: 'award', rule_type: 'xp_threshold', threshold: 100 };

export default function Index({
    badges = [],
    xpRules = [],
    ruleTypes = [],
    icons = [],
}: {
    badges?: Badge[];
    xpRules?: XpRule[];
    ruleTypes?: RuleType[];
    icons?: string[];
}) {
    const [rules, setRules] = useState<XpRule[]>(xpRules);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<BadgeForm>(EMPTY_FORM);
    const [notice, setNotice] = useState('');
    const [noticeError, setNoticeError] = useState(false);

    const ruleLabel = (value: string) => ruleTypes.find((r) => r.value === value)?.label ?? value;
    const ruleUnit = (value: string) => ruleTypes.find((r) => r.value === value)?.unit ?? '';

    const showError = (errors: Record<string, string>) => {
        setNoticeError(true);
        setNotice(Object.values(errors)[0] ?? 'အမှား ဖြစ်သွားပါတယ် — ပြန်စမ်းကြည့်ပါ');
    };

    const showOk = (message: string) => {
        setNoticeError(false);
        setNotice(message);
    };

    const startEdit = (badge: Badge) => {
        setEditingId(badge.id);
        setForm({ name: badge.name, description: badge.description, icon: badge.icon, rule_type: badge.rule_type, threshold: badge.threshold });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const submitBadge = (e: FormEvent) => {
        e.preventDefault();
        const payload = { ...form, threshold: Number(form.threshold) };
        if (editingId !== null) {
            router.put(`/admin/academy/gamification/badges/${editingId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    showOk('Badge ပြင်ပြီးပါပြီ');
                    cancelEdit();
                },
                onError: showError,
            });
        } else {
            router.post('/admin/academy/gamification/badges', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    showOk('Badge ထည့်ပြီးပါပြီ');
                    setForm(EMPTY_FORM);
                },
                onError: showError,
            });
        }
    };

    const toggle = (badge: Badge) => {
        router.post(
            `/admin/academy/gamification/badges/${badge.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => showOk(badge.is_active ? 'Badge ပိတ်ပြီးပါပြီ' : 'Badge ဖွင့်ပြီးပါပြီ'),
                onError: showError,
            },
        );
    };

    const remove = (badge: Badge) => {
        if (!confirm(`Badge "${badge.name}" ကို ဖျက်မှာ သေချာပါသလား? ရရှိထားတဲ့ ဆုမှတ်တမ်းတွေလည်း ပျက်သွားပါမယ်။`)) return;
        router.delete(`/admin/academy/gamification/badges/${badge.id}`, {
            preserveScroll: true,
            onSuccess: () => showOk('Badge ဖျက်ပြီးပါပြီ'),
            onError: showError,
        });
    };

    const saveRules = () => {
        const payload: Record<string, number> = {};
        rules.forEach((r) => {
            payload[r.key] = r.xp;
        });
        router.put('/admin/academy/gamification', payload, {
            preserveScroll: true,
            onSuccess: () => showOk('XP စံနှုန်းများ သိမ်းပြီးပါပြီ'),
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
                        {badges.map((b) => {
                            const Icon = ICONS[b.icon] ?? Award;
                            return (
                                <div key={b.id} className={`flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a] ${b.is_active ? '' : 'opacity-55'}`}>
                                    <span className="grid size-11 flex-none place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                        <Icon className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{b.name}</p>
                                            {b.is_active ? <Pill tone="teal">ဖွင့်ထား</Pill> : <Pill tone="slate">ပိတ်ထား</Pill>}
                                        </div>
                                        <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                            {b.description} · {ruleLabel(b.rule_type)} {b.threshold.toLocaleString()} {ruleUnit(b.rule_type)}
                                        </p>
                                    </div>
                                    <div className="flex flex-none flex-wrap justify-end gap-1.5">
                                        <button type="button" className={btnGhostCls} onClick={() => toggle(b)}>
                                            {b.is_active ? 'ပိတ်ရန်' : 'ဖွင့်ရန်'}
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => startEdit(b)} aria-label="ပြင်ရန်">
                                            <Pencil className="size-4" />
                                        </button>
                                        <button type="button" className={btnDangerCls} onClick={() => remove(b)} aria-label="ဖျက်ရန်">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {badges.length === 0 && <p className={`py-4 text-center text-sm ${mutedCls}`}>Badge မရှိသေးပါ</p>}
                    </div>
                    <form onSubmit={submitBadge} className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-[#18264a]">
                        <p className={`text-sm font-bold ${inkCls}`}>{editingId !== null ? 'Badge ပြင်ဆင်ရန်' : 'Badge အသစ် ထည့်ရန်'}</p>
                        <div>
                            <label className={labelCls} htmlFor="badge-name">အမည်</label>
                            <input id="badge-name" className={inputCls} placeholder="Badge အမည်" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="badge-desc">ဖော်ပြချက်</label>
                            <input id="badge-desc" className={inputCls} placeholder="ဥပမာ — Quiz 10 ခု အောင်မြင်ခြင်း" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={labelCls} htmlFor="badge-icon">အိုင်ကွန်</label>
                                <select id="badge-icon" className={selectCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                                    {icons.map((icon) => (
                                        <option key={icon} value={icon}>{ICON_LABELS[icon] ?? icon}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="badge-rule">စည်းမျဉ်း</label>
                                <select id="badge-rule" className={selectCls} value={form.rule_type} onChange={(e) => setForm({ ...form, rule_type: e.target.value })}>
                                    {ruleTypes.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="badge-threshold">သတ်မှတ်ချက်</label>
                                <input id="badge-threshold" className={inputCls} type="number" min={1} value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} required />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className={btnAccentCls}>
                                {editingId !== null ? <Save className="size-4" /> : <Plus className="size-4" />} {editingId !== null ? 'သိမ်းရန်' : 'ထည့်ရန်'}
                            </button>
                            {editingId !== null && (
                                <button type="button" className={btnGhostCls} onClick={cancelEdit}>
                                    <X className="size-4" /> ပယ်ဖျက်ရန်
                                </button>
                            )}
                        </div>
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
                            <p className={`font-extrabold ${inkCls}`}>Badge {badges.filter((b) => b.is_active).length} ခု ဖွင့်ထားပါတယ်</p>
                            <p className={`mt-0.5 text-sm ${mutedCls}`}>စုစုပေါင်း {badges.length} ခု · ကျောင်းသားတွေ Leaderboard မှာ XP နဲ့ ယှဉ်ပြိုင်နိုင်ပါတယ်</p>
                        </div>
                    </LmsCard>
                </div>
            </div>
        </LmsShell>
    );
}

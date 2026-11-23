import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { Award, Download, Plus, Save, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type DesignConfig = { title: string; subtitle: string; signer: string; signer_role: string; color: string; accent: string };
type CertTemplate = { id: number; name: string; is_default: boolean; design_config: DesignConfig };

const DEFAULT_DESIGN: DesignConfig = {
    title: 'Certificate of Completion',
    subtitle: 'ဤ လက်မှတ်ကို အောက်ပါ ကျောင်းသားအား ပေးအပ်ပါသည်',
    signer: 'Thura Aung',
    signer_role: 'Founder & Lead Instructor, Codexa MM',
    color: '#0d1730',
    accent: '#0ea892',
};

export default function Index({ templates = [] }: { templates?: CertTemplate[] }) {
    const defaultTpl = templates.find((t) => t.is_default) ?? templates[0];
    const [activeId, setActiveId] = useState(defaultTpl?.id);
    const [title, setTitle] = useState(defaultTpl?.design_config.title ?? DEFAULT_DESIGN.title);
    const [subtitle, setSubtitle] = useState(defaultTpl?.design_config.subtitle ?? DEFAULT_DESIGN.subtitle);
    const [signer, setSigner] = useState(defaultTpl?.design_config.signer ?? DEFAULT_DESIGN.signer);
    const [signerRole, setSignerRole] = useState(defaultTpl?.design_config.signer_role ?? DEFAULT_DESIGN.signer_role);
    const [color, setColor] = useState(defaultTpl?.design_config.color ?? DEFAULT_DESIGN.color);
    const [newName, setNewName] = useState('');
    const [notice, setNotice] = useState('');
    const [noticeError, setNoticeError] = useState(false);

    const active = templates.find((t) => t.id === activeId) ?? defaultTpl;
    const design = active?.design_config ?? DEFAULT_DESIGN;

    const showError = (errors: Record<string, string>) => {
        setNoticeError(true);
        setNotice(Object.values(errors)[0] ?? 'အမှား ဖြစ်သွားပါတယ် — ပြန်စမ်းကြည့်ပါ');
    };

    const pick = (tpl: CertTemplate) => {
        setActiveId(tpl.id);
        setTitle(tpl.design_config.title);
        setSubtitle(tpl.design_config.subtitle);
        setSigner(tpl.design_config.signer);
        setSignerRole(tpl.design_config.signer_role);
        setColor(tpl.design_config.color);
        setNotice('');
    };

    const designConfig = (): DesignConfig => ({ title, subtitle, signer, signer_role: signerRole, color, accent: design.accent });

    const save = (e: FormEvent) => {
        e.preventDefault();
        if (!active) return;
        router.put(
            `/admin/academy/cert-templates/${active.id}`,
            { design_config: designConfig(), is_default: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice('Template သိမ်းပြီး အသုံးပြုနေပါပြီ');
                },
                onError: showError,
            },
        );
    };

    const setDefault = () => {
        if (!active) return;
        router.post(
            `/admin/academy/cert-templates/${active.id}/set-default`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice(`${active.name} ကို အသုံးပြုနေပါပြီ`);
                },
                onError: showError,
            },
        );
    };

    const addTemplate = (e: FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        router.post(
            '/admin/academy/cert-templates',
            { name: newName.trim(), design_config: designConfig(), is_default: false },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice(`Template ${newName.trim()} ထည့်ပြီးပါပြီ`);
                    setNewName('');
                },
                onError: showError,
            },
        );
    };

    const remove = (tpl: CertTemplate) => {
        if (tpl.is_default) return;
        if (confirm(`"${tpl.name}" ပုံစံကို ဖျက်မှာ သေချာပါသလား?`)) {
            router.delete(`/admin/academy/cert-templates/${tpl.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice('Template ဖျက်ပြီးပါပြီ');
                },
                onError: showError,
            });
        }
    };

    return (
        <LmsShell title="Certificate Template စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Certificate Template စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Certificate Template စီမံခန့်ခွဲမှု"
                description="လက်မှတ် ဒီဇိုင်း ရွေးချယ်၊ စာသားနဲ့ လက်မှတ်ထိုးသူ ပြင်ဆင်ရန် — အသုံးပြုဆဲ ပုံစံက လက်မှတ် အသစ်တိုင်းမှာ သက်ရောက်ပါတယ်"
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

            <div className="mt-6">
                <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>ပုံစံများ</h2>
                <div className="mt-3 flex flex-wrap gap-3">
                    {templates.map((t) => (
                        <div key={t.id} className="relative">
                            <button
                                type="button"
                                onClick={() => pick(t)}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                                    active?.id === t.id ? 'border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/30' : 'border-slate-200 bg-white dark:border-[#1e2c52] dark:bg-[#0d1730]',
                                )}
                            >
                                <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: t.design_config.color }}>
                                    <Award className="size-5" />
                                </span>
                                <span>
                                    <span className={cn('block font-extrabold', inkCls)}>{t.name}</span>
                                    <span className={cn('text-[.78rem]', mutedCls)}>{t.is_default ? 'အသုံးပြုနေပါတယ်' : active?.id === t.id ? 'ပြင်ဆင်နေပါတယ်' : 'ရွေးရန် နှိပ်ပါ'}</span>
                                </span>
                            </button>
                            {!t.is_default && (
                                <button type="button" onClick={() => remove(t)} title="ဖျက်ရန်" className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-white text-rose-600 shadow ring-1 ring-slate-200 hover:bg-rose-50 dark:bg-[#16224a] dark:ring-[#1e2c52]">
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <form onSubmit={addTemplate} className="mt-3 flex flex-wrap gap-2">
                    <input className={`${inputCls} min-w-[200px] flex-1 sm:max-w-xs`} placeholder="ပုံစံ အသစ် အမည်" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                    <button type="submit" className={btnGhostCls}>
                        <Plus className="size-4" /> ပုံစံ အသစ် ထည့်ရန်
                    </button>
                </form>
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>ပုံစံ ပြင်ဆင်ရန်{active ? ` — ${active.name}` : ''}</h2>
                    <form onSubmit={save} className="mt-4 grid gap-4">
                        <Input label="လက်မှတ် ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Input label="ခေါင်းစဉ်ခွဲ" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="လက်မှတ်ထိုးသူ အမည်" value={signer} onChange={(e) => setSigner(e.target.value)} />
                            <Input label="လက်မှတ်ထိုးသူ ရာထူး" value={signerRole} onChange={(e) => setSignerRole(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>အဓိက အရောင်</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-10 cursor-pointer rounded-lg border border-slate-300 bg-white" />
                                <span className={cn('font-mono text-sm font-bold', inkCls)}>{color}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <button type="submit" className={btnAccentCls}>
                                <Save className="size-4" /> သိမ်းပြီး အသုံးပြုရန်
                            </button>
                            {active && !active.is_default && (
                                <button type="button" className={btnGhostCls} onClick={setDefault}>
                                    ဒီပုံစံကို အသုံးပြုရန်
                                </button>
                            )}
                            <button type="button" className={btnGhostCls}>
                                <Download className="size-4" /> နမူနာ လက်မှတ် ဒေါင်းလုဒ်ရန်
                            </button>
                        </div>
                    </form>
                </LmsCard>

                <div>
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>အစမ်းကြည့် (Preview)</h2>
                    <div className="mt-3 rounded-2xl border-4 bg-white p-8 text-center shadow-sm" style={{ borderColor: design.accent }}>
                        <p className="text-[.72rem] font-extrabold tracking-[0.25em]" style={{ color: design.accent }}>
                            CODEXA MM
                        </p>
                        <h3 className="mt-3 text-2xl font-extrabold" style={{ color }}>
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                        <p className="mt-5 text-xl font-extrabold text-slate-900">May Thandar</p>
                        <p className="mt-1 text-sm text-slate-500">React.js Complete Course ကို အောင်မြင်စွာ ပြီးဆုံးခဲ့ပါသည်</p>
                        <div className="mx-auto mt-8 flex max-w-xs items-end justify-between border-t border-slate-200 pt-3">
                            <div className="text-left">
                                <p className="font-bold text-slate-900">{signer}</p>
                                <p className="text-[.72rem] text-slate-500">{signerRole}</p>
                            </div>
                            <p className="font-mono text-[.7rem] text-slate-400">CMM-2026-0182</p>
                        </div>
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

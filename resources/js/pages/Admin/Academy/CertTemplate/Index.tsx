import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Award, Download, Save } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

const TEMPLATES = [
    { id: 'classic', name: 'Classic Navy', color: '#0d1730', accent: '#0ea892' },
    { id: 'teal', name: 'Teal Modern', color: '#078575', accent: '#2dd4bf' },
    { id: 'gold', name: 'Gold Premium', color: '#451a03', accent: '#f59e0b' },
];

export default function Index() {
    const [active, setActive] = useState('classic');
    const [title, setTitle] = useState('Certificate of Completion');
    const [subtitle, setSubtitle] = useState('ဤ လက်မှတ်ကို အောက်ပါ ကျောင်းသားအား ပေးအပ်ပါသည်');
    const [signer, setSigner] = useState('Thura Aung');
    const [signerRole, setSignerRole] = useState('Founder & Lead Instructor, Codexa MM');
    const [color, setColor] = useState('#0d1730');
    const [notice, setNotice] = useState('');

    const tpl = TEMPLATES.find((t) => t.id === active) ?? TEMPLATES[0];

    const pick = (id: string) => {
        setActive(id);
        const t = TEMPLATES.find((x) => x.id === id);
        if (t) setColor(t.color);
    };

    const save = (e: FormEvent) => {
        e.preventDefault();
        // CertificateTemplate model exists but no admin template controller yet.
        setNotice('Template သိမ်းပြီး အသုံးပြုနေပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
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
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6">
                <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>ပုံစံများ</h2>
                <div className="mt-3 flex flex-wrap gap-3">
                    {TEMPLATES.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => pick(t.id)}
                            className={cn(
                                'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                                active === t.id ? 'border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/30' : 'border-slate-200 bg-white dark:border-[#1e2c52] dark:bg-[#0d1730]',
                            )}
                        >
                            <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: t.color }}>
                                <Award className="size-5" />
                            </span>
                            <span>
                                <span className={cn('block font-extrabold', inkCls)}>{t.name}</span>
                                <span className={cn('text-[.78rem]', mutedCls)}>{active === t.id ? 'အသုံးပြုနေပါတယ်' : 'ရွေးရန် နှိပ်ပါ'}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>ပုံစံ ပြင်ဆင်ရန်</h2>
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
                            <button type="button" className={btnGhostCls}>
                                <Download className="size-4" /> နမူနာ လက်မှတ် ဒေါင်းလုဒ်ရန်
                            </button>
                        </div>
                    </form>
                </LmsCard>

                <div>
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>အစမ်းကြည့် (Preview)</h2>
                    <div className="mt-3 rounded-2xl border-4 bg-white p-8 text-center shadow-sm" style={{ borderColor: tpl.accent }}>
                        <p className="text-[.72rem] font-extrabold tracking-[0.25em]" style={{ color: tpl.accent }}>
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

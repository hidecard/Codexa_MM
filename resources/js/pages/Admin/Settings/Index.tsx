import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Download, Save } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

const TEMPLATES: Record<string, { subject: string; body: string }> = {
    welcome: {
        subject: 'Codexa MM သို့ ကြိုဆိုပါတယ်, {{name}}!',
        body: 'မင်္ဂလာပါ {{name}},\n\nCodexa MM မှာ အကောင့် ဖွင့်တာ ကျေးဇူးတင်ပါတယ်။ သင်တန်း တစ်ထောင်ကျော်ထဲက သင့်အတွက် သင့်တော်တာကို စတင် လေ့လာနိုင်ပါပြီ။\n\nLearn · Code · Grow',
    },
    payment: {
        subject: 'ပေးချေမှု အောင်မြင်ပါပြီ — {{course}}',
        body: 'မင်္ဂလာပါ {{name}},\n\n{{course}} သင်တန်းအတွက် {{amount}} ပေးချေမှု အောင်မြင်ပါပြီ။ ယခု ချက်ချင်း သင်ယူလို့ ရပါပြီ။',
    },
    certificate: {
        subject: 'ဂုဏ်ယူပါတယ် — {{course}} လက်မှတ် ရရှိပါပြီ',
        body: 'မင်္ဂလာပါ {{name}},\n\n{{course}} သင်တန်းကို အောင်မြင်စွာ ပြီးဆုံးပြီး လက်မှတ် ရရှိပါပြီ။ လက်မှတ်ကို profile မှာ ဒေါင်းလုဒ် လုပ်နိုင်ပါတယ်။',
    },
    refund: {
        subject: 'Refund အတည်ပြုပါပြီ — {{course}}',
        body: 'မင်္ဂလာပါ {{name}},\n\n{{course}} အတွက် refund တောင်းခံမှု အတည်ပြုပါပြီ။ ငွေကို ၃-၅ ရက်အတွင်း ပြန်အမ်းပါမယ်။',
    },
};

export default function Index() {
    const [notice, setNotice] = useState('');
    const [platformName, setPlatformName] = useState('Codexa MM');
    const [supportEmail, setSupportEmail] = useState('support@codexamm.com');
    const [sharePct, setSharePct] = useState(50);
    const [refundDays, setRefundDays] = useState(7);
    const [features, setFeatures] = useState({ maintenance: false, signup: true, live: true, certificates: true, community: true });
    const [gateways, setGateways] = useState({ kbz: true, wave: true, cb: true, bank: true });
    const [template, setTemplate] = useState<keyof typeof TEMPLATES>('welcome');
    const [subject, setSubject] = useState(TEMPLATES.welcome.subject);
    const [body, setBody] = useState(TEMPLATES.welcome.body);

    const save = (e: FormEvent) => {
        e.preventDefault();
        // No settings backend yet — local only.
        setNotice('Settings သိမ်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const pickTemplate = (key: keyof typeof TEMPLATES) => {
        setTemplate(key);
        setSubject(TEMPLATES[key].subject);
        setBody(TEMPLATES[key].body);
    };

    const toggle = (key: keyof typeof features) => setFeatures({ ...features, [key]: !features[key] });
    const toggleGateway = (key: keyof typeof gateways) => setGateways({ ...gateways, [key]: !gateways[key] });

    const featureRows: { key: keyof typeof features; title: string; desc: string }[] = [
        { key: 'maintenance', title: 'Maintenance Mode', desc: 'ဖွင့်ထားရင် ကျောင်းသားတွေ ခဏ ဝင်မရပါ' },
        { key: 'signup', title: 'အကောင့် အသစ် ဖွင့်ခွင့်', desc: 'Signup page ကနေ အကောင့် ဖွင့်ခွင့် ပြုရန်' },
        { key: 'live', title: 'Live Classes', desc: 'Live session အသစ် စီစဉ်ခွင့် ပြုရန်' },
        { key: 'certificates', title: 'လက်မှတ် အလိုအလျောက် ထုတ်ပေးရန်', desc: 'သင်တန်း 100% ပြီးတာနဲ့ certificate ထုတ်ပေးရန်' },
        { key: 'community', title: 'Community ပို့စ်များ', desc: 'ကျောင်းသားတွေ ပို့စ် အသစ် တင်ခွင့် ပြုရန်' },
    ];

    const gatewayRows: { key: keyof typeof gateways; title: string }[] = [
        { key: 'kbz', title: 'KBZPay' },
        { key: 'wave', title: 'WavePay' },
        { key: 'cb', title: 'CB Pay' },
        { key: 'bank', title: 'Bank Transfer' },
    ];

    return (
        <LmsShell title="Platform Settings" nav="admin">
            <Head title="Platform Settings" />
            <PageIntro
                eyebrow="ADMIN"
                title="Platform Settings"
                description="Platform ရဲ့ အထွေထွေ ချိန်ညှိမှု၊ ငွေပေးချေမှု gateway နဲ့ email template များ စီမံရန်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> Settings Backup ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <form onSubmit={save} className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <div className="space-y-5">
                    <SectionCard title="အထွေထွေ ချိန်ညှိမှု">
                        <div className="grid gap-4">
                            <Input label="Platform အမည်" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                            <Input label="Support အီးမေးလ်" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="ဆရာ ဝင်ငွေ ခွဲဝေနှုန်း (%)" type="number" min={0} max={100} value={sharePct} onChange={(e) => setSharePct(Number(e.target.value))} />
                                <Input label="Refund သတ်မှတ်ရက် (ရက်)" type="number" min={0} value={refundDays} onChange={(e) => setRefundDays(Number(e.target.value))} />
                            </div>
                            <div>
                                <button type="submit" className={btnAccentCls}>
                                    <Save className="size-4" /> သိမ်းရန်
                                </button>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Feature ဖွင့် / ပိတ်">
                        <div className="space-y-4">
                            {featureRows.map((f) => (
                                <label key={f.key} className="flex cursor-pointer items-center justify-between gap-4">
                                    <span>
                                        <span className={cn('block font-medium', inkCls)}>{f.title}</span>
                                        <span className={cn('text-sm', mutedCls)}>{f.desc}</span>
                                    </span>
                                    <input type="checkbox" checked={features[f.key]} onChange={() => toggle(f.key)} className="size-5 accent-teal-700" />
                                </label>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-5">
                    <SectionCard title="ငွေပေးချေမှု Gateway များ">
                        <p className={`text-sm ${mutedCls}`}>ပိတ်ထားတဲ့ နည်းလမ်းက Checkout မှာ မပေါ်တော့ပါ</p>
                        <div className="mt-4 space-y-4">
                            {gatewayRows.map((g) => (
                                <label key={g.key} className="flex cursor-pointer items-center justify-between gap-4">
                                    <span className={cn('font-medium', inkCls)}>{g.title}</span>
                                    <input type="checkbox" checked={gateways[g.key]} onChange={() => toggleGateway(g.key)} className="size-5 accent-teal-700" />
                                </label>
                            ))}
                        </div>
                    </SectionCard>

                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>Email Template များ</h2>
                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className={labelCls}>Template ရွေးရန်</label>
                                <select className={inputCls} value={template} onChange={(e) => pickTemplate(e.target.value as keyof typeof TEMPLATES)}>
                                    <option value="welcome">ကြိုဆို အီးမေးလ် (Welcome)</option>
                                    <option value="payment">ပေးချေမှု အောင်မြင် (Payment Success)</option>
                                    <option value="certificate">လက်မှတ် ရရှိ (Certificate Issued)</option>
                                    <option value="refund">Refund အတည်ပြု (Refund Approved)</option>
                                </select>
                            </div>
                            <Input label="ခေါင်းစဉ် (Subject)" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            <div>
                                <label className={labelCls}>အကြောင်းအရာ</label>
                                <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
                                <p className={`mt-1.5 text-[.78rem] ${mutedCls}`}>{'{{name}}, {{course}}, {{amount}}'} စတဲ့ placeholder တွေ သုံးနိုင်ပါတယ်</p>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                <button type="submit" className={btnAccentCls}>
                                    Template သိမ်းရန်
                                </button>
                                <button type="button" className={btnGhostCls} onClick={() => setNotice('စမ်းသပ် အီးမေးလ် ပို့ခြင်း — email backend မချိတ်ရသေးပါ')}>
                                    စမ်းသပ် ပို့ကြည့်ရန်
                                </button>
                            </div>
                        </div>
                    </LmsCard>
                </div>
            </form>
        </LmsShell>
    );
}

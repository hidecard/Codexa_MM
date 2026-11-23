import { useState, type FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Eye, RotateCcw, Save } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

const DEFAULTS = {
    promo: '🎉 50% OFF — သင်တန်း အားလုံး · CODEXA10 code သုံးပါ',
    heroTitle: 'မြန်မာဘာသာနဲ့ Programming ကို သုညကနေ သင်ယူပါ',
    heroIntro: 'Codexa MM မှာ Web Development, Python, React, Mobile App တွေကို မြန်မာဘာသာနဲ့ လွယ်ကူရှင်းလင်းစွာ သင်ယူနိုင်ပါတယ်။ Live class, Assignment နဲ့ Certificate တွေ အပြည့်အစုံ ပါဝင်ပါတယ်။',
};

export default function Index() {
    const [promo, setPromo] = useState(DEFAULTS.promo);
    const [heroTitle, setHeroTitle] = useState(DEFAULTS.heroTitle);
    const [heroIntro, setHeroIntro] = useState(DEFAULTS.heroIntro);
    const [notice, setNotice] = useState('');

    const save = (e: FormEvent) => {
        e.preventDefault();
        // No CMS backend yet — local only.
        setNotice('သိမ်းပြီးပါပြီ (ဤ page မှာသာ — CMS backend မရှိသေးပါ)');
    };

    const reset = () => {
        setPromo(DEFAULTS.promo);
        setHeroTitle(DEFAULTS.heroTitle);
        setHeroIntro(DEFAULTS.heroIntro);
        setNotice('မူရင်း စာသားသို့ ပြန်ထားပြီးပါပြီ');
    };

    return (
        <LmsShell title="Landing Page CMS" nav="admin">
            <Head title="Landing Page CMS" />
            <PageIntro
                eyebrow="ADMIN"
                title="Landing Page CMS"
                description="Homepage ရဲ့ promo စာသား၊ hero ခေါင်းစဉ်နဲ့ မိတ်ဆက်စာကို ပြင်ပါ — သိမ်းရင် Landing page မှာ ချက်ချင်း ပြောင်းပါတယ်"
                actions={
                    <Link href="/" className={btnGhostCls}>
                        <Eye className="size-4" /> Landing Page ကြည့်ရန်
                    </Link>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>စာသား ပြင်ဆင်ရန်</h2>
                    <form onSubmit={save} className="mt-4 grid gap-4">
                        <Input label="Promo strip စာသား" value={promo} onChange={(e) => setPromo(e.target.value)} />
                        <Input label="Hero ခေါင်းစဉ်" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                        <div>
                            <label className={labelCls}>Hero မိတ်ဆက်စာ</label>
                            <Textarea rows={4} value={heroIntro} onChange={(e) => setHeroIntro(e.target.value)} />
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <button type="submit" className={btnAccentCls}>
                                <Save className="size-4" /> သိမ်းပြီး ထုတ်ပြန်ရန်
                            </button>
                            <button type="button" className={btnGhostCls} onClick={reset}>
                                <RotateCcw className="size-4" /> မူရင်း ပြန်ထားရန်
                            </button>
                        </div>
                    </form>
                </LmsCard>

                <LmsCard className="overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-3 dark:border-[#18264a]">
                        <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>အစမ်း မြင်ကွင်း (Preview)</h2>
                    </div>
                    <div className="bg-gradient-to-br from-teal-700 to-blue-800 px-5 py-3 text-center text-[.82rem] font-bold text-white">{promo}</div>
                    <div className="p-6">
                        <h3 className={`text-2xl font-extrabold leading-snug ${inkCls}`}>{heroTitle}</h3>
                        <p className={`mt-3 leading-relaxed ${mutedCls}`}>{heroIntro}</p>
                        <div className="mt-5 flex flex-wrap gap-2.5">
                            <span className={btnAccentCls}>သင်တန်းများ ကြည့်ရန်</span>
                            <span className={btnGhostCls}>အခမဲ့ စတင်ရန်</span>
                        </div>
                    </div>
                    <p className={`border-t border-slate-100 px-5 py-3 text-[.78rem] dark:border-[#18264a] ${mutedCls}`}>
                        စာရိုက်နေစဉ် preview က အလိုအလျောက် ပြောင်းပါတယ်။ သိမ်းမှသာ Landing page အစစ်မှာ ပြောင်းပါမယ်။
                    </p>
                </LmsCard>
            </div>
        </LmsShell>
    );
}

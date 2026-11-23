import { useState, type FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, GraduationCap, Users, Wallet } from 'lucide-react';
import { PublicLayout } from '@/components/shared/public-layout';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

export default function Teach() {
    const [students, setStudents] = useState(120);
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [field, setField] = useState('');
    const [experience, setExperience] = useState('အတွေ့အကြုံ 3–4 နှစ်');
    const [about, setAbout] = useState('');

    const estimated = students * 65000 * 0.5;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // No application store endpoint exists yet — local only.
        setSubmitted(true);
    };

    return (
        <PublicLayout>
            <Head title="Instructor အဖြစ် လျှောက်ထားရန်" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="သင် သိထားတာကို သင်ပေးပြီး ဝင်ငွေ ရှာပါ"
                description="Codexa MM ဆရာတွေဟာ သင်တန်း ရောင်းရငွေရဲ့ 50% ကို ခွဲဝေငွေ အဖြစ် လစဉ် ရရှိကြပါတယ်။ မြန်မာဘာသာနဲ့ သင်ကြားနိုင်တဲ့ မည်သူမဆို လျှောက်ထားနိုင်ပါတယ်။"
                actions={
                    <>
                        <a href="#apply-form" className={btnAccentCls}>
                            လျှောက်လွှာ တင်ရန်
                        </a>
                        <Link href="/instructor/dashboard" className={btnGhostCls}>
                            Instructor Dashboard ကြည့်ရန်
                        </Link>
                    </>
                }
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <LmsCard className="p-5">
                    <div className="grid size-11 place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                        <Wallet className="size-5" />
                    </div>
                    <h3 className={`mt-3 font-extrabold ${inkCls}`}>ဝင်ငွေ 50% ခွဲဝေမှု</h3>
                    <p className={`mt-1 text-sm leading-relaxed ${mutedCls}`}>
                        သင်တန်း တစ်ခု ရောင်းရတိုင်း ဈေးနှုန်းရဲ့ ထက်ဝက်ကို သင် ရပါတယ်။ KBZPay / WavePay / Bank ဖြင့် လစဉ် 5 ရက်နေ့မှာ ပေးချေပါတယ်။
                    </p>
                </LmsCard>
                <LmsCard className="p-5">
                    <div className="grid size-11 place-items-center rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        <Users className="size-5" />
                    </div>
                    <h3 className={`mt-3 font-extrabold ${inkCls}`}>ကျောင်းသား ထောင်ချီ</h3>
                    <p className={`mt-1 text-sm leading-relaxed ${mutedCls}`}>
                        Platform ပေါ်က ကျောင်းသား 4,280+ ဦးထံ သင့်သင်တန်း တိုက်ရိုက် ရောက်ပါတယ်။ Marketing ကို Codexa MM အဖွဲ့က တာဝန်ယူပေးပါတယ်။
                    </p>
                </LmsCard>
                <LmsCard className="p-5">
                    <div className="grid size-11 place-items-center rounded-xl bg-violet-600/10 text-violet-700 dark:text-violet-300">
                        <BarChart3 className="size-5" />
                    </div>
                    <h3 className={`mt-3 font-extrabold ${inkCls}`}>Dashboard အပြည့်အစုံ</h3>
                    <p className={`mt-1 text-sm leading-relaxed ${mutedCls}`}>
                        ရောင်းအား၊ Rating၊ ကျောင်းသား မေးခွန်းတွေကို Instructor Dashboard ကနေ အချိန်နဲ့တပြေးညီ ကြည့်ရှု စီမံနိုင်ပါတယ်။
                    </p>
                </LmsCard>
            </div>

            <SectionCard title="စတင်နည်း အဆင့် ၃ ဆင့်">
                <div className="grid gap-5 md:grid-cols-3">
                    {[
                        { n: '1', t: 'လျှောက်လွှာ တင်ပါ', d: 'အောက်က form မှာ သင်ကြားချင်တဲ့ နယ်ပယ်နဲ့ အတွေ့အကြုံကို ဖြည့်ပါ။ Admin အဖွဲ့က ၂ ရက်အတွင်း စစ်ဆေး အကြောင်းပြန်ပါမယ်။' },
                        { n: '2', t: 'သင်တန်း တည်ဆောက်ပါ', d: 'Curriculum Builder နဲ့ အခန်း/သင်ခန်းစာ စီပြီး video တွေ တင်ပါ။ နမူနာ သင်ခန်းစာ တစ်ခုကို အရင် စစ်ဆေးပေးပါတယ်။' },
                        { n: '3', t: 'Publish လုပ်ပြီး ဝင်ငွေ စရပါ', d: 'သင်တန်း live ဖြစ်တာနဲ့ ကျောင်းသားတွေ ဝယ်နိုင်ပါပြီ။ ဝင်ငွေကို Instructor Dashboard မှာ နေ့စဉ် ကြည့်နိုင်ပါတယ်။' },
                    ].map((s) => (
                        <div key={s.n} className="flex gap-3">
                            <span className="grid size-9 flex-none place-items-center rounded-full bg-teal-700 text-sm font-extrabold text-white dark:bg-teal-400 dark:text-teal-950">
                                {s.n}
                            </span>
                            <div>
                                <h3 className={`font-extrabold ${inkCls}`}>{s.t}</h3>
                                <p className={`mt-1 text-sm leading-relaxed ${mutedCls}`}>{s.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-lg font-extrabold ${inkCls}`}>
                    <GraduationCap className="size-5" /> ဝင်ငွေ ခန့်မှန်းရန်
                </h2>
                <p className={`mt-1 text-sm ${mutedCls}`}>
                    လစဉ် ကျောင်းသား အရေအတွက်ကို ရွှေ့ကြည့်ပါ — ပျမ်းမျှ သင်တန်းဈေး 65,000 ကျပ်၊ ခွဲဝေနှုန်း 50% နဲ့ တွက်ထားပါတယ်
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                    <input
                        type="range"
                        min={10}
                        max={500}
                        step={10}
                        value={students}
                        onChange={(e) => setStudents(Number(e.target.value))}
                        className="min-w-[200px] flex-1 accent-teal-700"
                    />
                    <span className={`text-sm font-bold ${inkCls}`}>ကျောင်းသား {students} ဦး / လ</span>
                </div>
                <p className={`mt-4 text-xl font-extrabold ${inkCls}`}>
                    လစဉ် ခန့်မှန်း ခွဲဝေငွေ — <span className="text-teal-700 dark:text-teal-300">{estimated.toLocaleString()} ကျပ်</span>
                </p>
            </LmsCard>

            <div id="apply-form" className="mt-6 scroll-mt-6">
            <LmsCard className="p-5 sm:p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>လျှောက်လွှာ Form</h2>
                {submitted ? (
                    <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
                        <p className="font-extrabold text-teal-800 dark:text-teal-200">လျှောက်လွှာ တင်ပြီးပါပြီ — ကျေးဇူးတင်ပါတယ်!</p>
                        <p className={`mt-1 text-sm ${mutedCls}`}>
                            Admin အဖွဲ့က ၂ ရက်အတွင်း စစ်ဆေး အကြောင်းပြန်ပါမယ်။ (ဤ prototype မှာ လျှောက်လွှာကို backend သို့ မပို့ရသေးပါ)
                        </p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-4 grid gap-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="အမည် အပြည့်အစုံ" value={name} onChange={(e) => setName(e.target.value)} required />
                            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="သင်ကြားချင်တဲ့ နယ်ပယ်" value={field} onChange={(e) => setField(e.target.value)} placeholder="ဥပမာ — Python, React, UI/UX" required />
                            <div>
                                <label className={labelCls}>အတွေ့အကြုံ</label>
                                <select className={inputCls} value={experience} onChange={(e) => setExperience(e.target.value)}>
                                    <option>အတွေ့အကြုံ 1–2 နှစ်</option>
                                    <option>အတွေ့အကြုံ 3–4 နှစ်</option>
                                    <option>အတွေ့အကြုံ 5 နှစ်</option>
                                    <option>အတွေ့အကြုံ 6–8 နှစ်</option>
                                    <option>အတွေ့အကြုံ 9 နှစ်အထက်</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>သင်ကြားချင်တဲ့ သင်တန်း အကြောင်း</label>
                            <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="သင်ကြားချင်တဲ့ သင်တန်း အကြောင်း အကျဉ်းချုပ် ရေးပါ" />
                        </div>
                        <div>
                            <button type="submit" className={btnAccentCls}>
                                လျှောက်လွှာ တင်ရန်
                            </button>
                            <p className={`mt-2 text-[.8rem] ${mutedCls}`}>
                                တင်လိုက်တဲ့ လျှောက်လွှာက Admin ဘက် "ဆရာ စီမံရန်" page ရဲ့ လျှောက်လွှာ စာရင်းထဲ ချက်ချင်း ရောက်သွားပါမယ်။
                            </p>
                        </div>
                    </form>
                )}
            </LmsCard>
            </div>
        </PublicLayout>
    );
}

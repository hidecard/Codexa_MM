import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ChevronDown, HelpCircle, LifeBuoy, MessageCircle, Send } from 'lucide-react';

type Faq = { q: string; a: string };
type Props = { faqs?: Faq[] };

const SAMPLE_FAQS: Faq[] = [
    { q: 'သင်တန်းကြေးကို ဘယ်လို ပေးချေရမလဲ?', a: "KBZPay, WavePay, CB Pay နဲ့ bank transfer တို့နဲ့ ပေးချေနိုင်ပါတယ်။ သင်တန်း detail page မှာ 'စာရင်းသွင်းရန်' ကို နှိပ်ရင် checkout page ရောက်ပြီး နည်းလမ်း ရွေးလို့ ရပါတယ်။ ပေးချေမှု အတည်ပြုပြီးတာနဲ့ သင်ခန်းစာတွေ ချက်ချင်း ပွင့်သွားပါမယ်။" },
    { q: 'သင်တန်းကို ဘယ်လောက်ကြာကြာ ကြည့်လို့ရမလဲ?', a: 'တစ်ခါ ဝယ်ထားတဲ့ သင်တန်းတိုင်းကို lifetime access ဖြင့် အမြဲတမ်း ကြည့်နိုင်ပါတယ်။ Update ဖြစ်တဲ့ သင်ခန်းစာ အသစ်တွေကိုလည်း အခမဲ့ ဆက်ကြည့်နိုင်ပါတယ်။' },
    { q: 'Live class လွတ်သွားရင် ဘယ်လို ပြန်ကြည့်ရမလဲ?', a: "Live session တိုင်းရဲ့ မှတ်တမ်းကို 24 နာရီအတွင်း Live Classes page ရဲ့ 'မှတ်တမ်းများ' အပိုင်းနဲ့ သက်ဆိုင်ရာ သင်တန်းထဲမှာ တင်ပေးပါတယ်။ စာရင်းပေးထားသူတွေကို notification ဖြင့်လည်း အကြောင်းကြားပေးပါတယ်။" },
    { q: 'လက်မှတ်ကို အလုပ်ရှင်က ဘယ်လို အတည်ပြုနိုင်မလဲ?', a: "လက်မှတ်တိုင်းမှာ Certificate ID ပါပါတယ်။ Certificates page ကနေ 'စစ်ဆေးရန် Link' ကို ကူးပြီး CV သို့မဟုတ် LinkedIn မှာ ထည့်ထားရင် အလုပ်ရှင်က အဲဒီ link ကနေ တိုက်ရိုက် အတည်ပြုနိုင်ပါတယ်။" },
    { q: 'ငွေပြန်အမ်း (Refund) မူဝါဒက ဘယ်လိုလဲ?', a: 'သင်တန်း ဝယ်ပြီး 7 ရက်အတွင်း၊ သင်ခန်းစာ 20% ထက် ပိုမကြည့်ရသေးရင် အကြောင်းပြချက် မလိုဘဲ ငွေအပြည့် ပြန်အမ်းပေးပါတယ်။ Support ထံ message ပို့ပြီး တောင်းဆိုနိုင်ပါတယ်။' },
    { q: 'Assignment နောက်ဆုံးရက် ကျော်သွားရင် ဘာဖြစ်မလဲ?', a: "နောက်ကျမှ တင်ရင် rubric ထဲက 'အချိန်မီ တင်သွင်းမှု' 10 မှတ်ကို လျှော့ပါမယ်။ အကြောင်းခိုင်လုံရင် ဆရာထံ message ပို့ပြီး သက်တမ်းတိုးခွင့် တောင်းနိုင်ပါတယ်။" },
    { q: 'ဖုန်းနဲ့ ကြည့်လို့ရလား? Offline ရလား?', a: 'ဖုန်း၊ တက်ဘလက်၊ ကွန်ပျူတာ အားလုံးမှာ browser ကနေ ကြည့်နိုင်ပါတယ်။ သင်ခန်းစာ ဖိုင်တွေ (slides, starter code) ကို download လုပ်ပြီး offline လေ့ကျင့်နိုင်ပါတယ်။' },
];

const TOPICS = ['ငွေပေးချေမှု ပြဿနာ', 'နည်းပညာ ပြဿနာ', 'လက်မှတ် ပြဿနာ', 'အကောင့် ပြဿနာ', 'အခြား'];

export default function Index({ faqs }: Props) {
    const list = faqs && faqs.length > 0 ? faqs : SAMPLE_FAQS;
    const [open, setOpen] = useState<number | null>(0);
    const [topic, setTopic] = useState(TOPICS[0]);
    const [course, setCourse] = useState('');
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    const submitTicket = () => {
        if (!msg.trim()) return;
        setSent(true);
    };

    return (
        <LmsShell title="အကူအညီ & FAQ" nav="student">
            <Head title="Help & FAQ" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><HelpCircle className="size-7 text-teal-600" /> အကူအညီ &amp; FAQ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အမေးများသော မေးခွန်းများနှင့် Support အဖွဲ့ထံ ဆက်သွယ်ရန်</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အမေးများသော မေးခွန်းများ</h2>
                    <div className="mt-4 flex flex-col gap-3">
                        {list.map((f, i) => (
                            <div key={f.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                <button onClick={() => setOpen((o) => (o === i ? null : i))} className="flex w-full items-center gap-3 p-5 text-left">
                                    <span className="min-w-0 flex-1 font-extrabold leading-snug text-slate-900 dark:text-white">{f.q}</span>
                                    <ChevronDown className={`size-5 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                                </button>
                                {open === i && <div className="px-5 pb-5"><p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><LifeBuoy className="size-5 text-teal-600" /> Support သို့ ဆက်သွယ်ရန်</h2>
                        {sent ? (
                            <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                                <p className="font-extrabold">တောင်းဆိုချက် လက်ခံရရှိပါပြီ</p>
                                <p className="mt-1">Support အဖွဲ့က 24 နာရီ အတွင်း ပြန်လည် ဆက်သွယ်ပါမည်။ တုံ့ပြန်ချက်ကို မက်ဆေ့ချ်များတွင် ကြည့်နိုင်ပါသည်။</p>
                                <Link href="/student/messages" className="mt-3 inline-flex items-center gap-2 font-bold text-teal-700 dark:text-teal-300"><MessageCircle className="size-4" /> မက်ဆေ့ချ်များ သို့ သွားရန်</Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">ပြဿနာ အမျိုးအစား</span>
                                    <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">သက်ဆိုင်ရာ သင်တန်း (မဖြစ်မနေ မဟုတ်)</span>
                                    <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="ဥပမာ: React.js Complete Course" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">ပြဿနာ အသေးစိတ်</span>
                                    <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="ဖြစ်နေသော ပြဿနာကို အသေးစိတ် ရေးပါ…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                </label>
                                <button onClick={submitTicket} disabled={!msg.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                                    <Send className="size-4" /> တောင်းဆိုချက် ပို့ရန်
                                </button>
                                <p className="text-xs text-slate-400">တုံ့ပြန်ချိန် — များသောအားဖြင့် 24 နာရီ အတွင်း</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LmsShell>
    );
}

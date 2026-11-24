import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';

const sections = [
    { n: '1', title: 'စုဆောင်းတဲ့ အချက်အလက်', text: 'အမည်၊ email၊ ဖုန်းနံပါတ်၊ သင်ယူမှု တိုးတက်မှုနဲ့ ငွေပေးချေမှု မှတ်တမ်းတွေကိုသာ ဝန်ဆောင်မှု ပေးနိုင်ဖို့ စုဆောင်းပါတယ်။ Wallet password သို့မဟုတ် OTP ကို ဘယ်တော့မှ မတောင်းပါ၊ မသိမ်းပါ။' },
    { n: '2', title: 'အချက်အလက် အသုံးပြုပုံ', text: 'သင်တန်း အကြံပြုရန်၊ တိုးတက်မှု အစီရင်ခံစာ ထုတ်ရန်၊ ငွေပေးချေမှု အတည်ပြုရန်နဲ့ အရေးကြီး ကြေညာချက်တွေ ပို့ရန် အတွက်သာ သုံးပါတယ်။ သင့် အချက်အလက်ကို ကြော်ငြာ ကုမ္ပဏီတွေထံ ရောင်းချခြင်း လုံးဝ မလုပ်ပါ။' },
    { n: '3', title: 'သင့်ရဲ့ အခွင့်အရေး', text: 'Profile page ကနေ သင့် အချက်အလက်ကို အချိန်မရွေး ပြင်နိုင်ပါတယ်။ အကောင့် ဖျက်သိမ်းချင်ရင် ဆက်သွယ်ရန် page ကနေ တောင်းဆိုနိုင်ပြီး ၇ ရက်အတွင်း ကိုယ်ရေး အချက်အလက် အားလုံးကို ဖျက်ပေးပါတယ် (ဥပဒေအရ ထိန်းသိမ်းရမယ့် ငွေစာရင်း မှတ်တမ်းမှ အပ)။' },
    { n: '4', title: 'လုံခြုံရေး အစီအမံ', text: 'Password တွေကို hash လုပ်ပြီး သိမ်းပါတယ်။ သံသယဖြစ်ဖွယ် login တွေ့ရင် email ဖြင့် အကြောင်းကြားပါတယ်။ Codexa MM အမည်နဲ့ OTP တောင်းတဲ့ message ရရင် လုံးဝ မပေးဘဲ Support ထံ အကြောင်းကြားပါ။' },
];

export default function PrivacyPolicy() {
    return (
        <PublicLayout>
            <Head title="ကိုယ်ရေး လုံခြုံမှု မူဝါဒ" />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">စည်းမျဉ်းစည်းကမ်း & ကိုယ်ရေး လုံခြုံမှု</h1>
                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                    Codexa MM ကို အသုံးပြုရာမှာ သဘောတူညီရမယ့် စည်းကမ်းတွေနဲ့ သင့်အချက်အလက်ကို ဘယ်လို ကိုင်တွယ်တယ် ဆိုတာ — နောက်ဆုံး ပြင်ဆင်ချိန် · 2026 နိုဝင်ဘာ 1
                </p>

                <div className="mt-8 inline-flex gap-1.5 rounded-full bg-white p-1.5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <Link href="/terms" className="rounded-full px-4 py-2 text-sm font-bold text-[#5a6a8a] transition hover:text-[#0d1730] dark:text-[#97a6c6] dark:hover:text-white">
                        စည်းမျဉ်းစည်းကမ်း (Terms)
                    </Link>
                    <span className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white">ကိုယ်ရေး လုံခြုံမှု (Privacy)</span>
                </div>

                <div className="mt-6 space-y-4">
                    {sections.map((s) => (
                        <section key={s.n} className="rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <h2 className="flex items-center gap-3 text-lg font-extrabold">
                                <span className="grid size-8 flex-none place-items-center rounded-lg bg-teal-600 text-sm font-extrabold text-white">{s.n}</span>
                                {s.title}
                            </h2>
                            <p className="mt-3 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">{s.text}</p>
                        </section>
                    ))}
                </div>

                <p className="mt-8 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                    မေးခွန်း ရှိရင် <Link href="/contact" className="font-semibold text-teal-700 dark:text-teal-300">ဆက်သွယ်ရန်</Link> page ကနေ မေးမြန်းနိုင်ပါတယ်။
                </p>
            </div>
        </PublicLayout>
    );
}

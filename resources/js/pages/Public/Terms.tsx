import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';

const sections = [
    { n: '1', title: 'အကောင့် အသုံးပြုမှု', text: 'အကောင့် တစ်ခုကို လူတစ်ဦးတည်းသာ အသုံးပြုရပါမယ်။ Password ကို သူတစ်ပါးထံ မျှဝေခြင်း၊ အကောင့် ရောင်းချခြင်း မလုပ်ရပါ။ စည်းကမ်း ချိုးဖောက်တဲ့ အကောင့်ကို သတိပေးချက် ပေးပြီး ဆိုင်းငံ့နိုင်ပါတယ်။' },
    { n: '2', title: 'သင်တန်း အကြောင်းအရာ အသုံးပြုခွင့်', text: 'ဝယ်ယူထားတဲ့ သင်တန်းကို lifetime access ဖြင့် ကိုယ်ပိုင် သင်ယူမှု အတွက်သာ ကြည့်နိုင်ပါတယ်။ Video များကို download လုပ်ပြီး ပြန်လည် ဖြန့်ဝေခြင်း၊ သင်တန်း အကြောင်းအရာကို တခြား platform မှာ ပြန်တင်ခြင်း မလုပ်ရပါ။' },
    { n: '3', title: 'ငွေပေးချေမှုနဲ့ Refund မူဝါဒ', text: 'ဝယ်ပြီး 7 ရက်အတွင်း သင်ခန်းစာ 20% အောက် ကြည့်ထားရင် အပြည့်အဝ ပြန်အမ်းပေးပါတယ်။ သတ်မှတ်ချက် ကျော်လွန်တဲ့ တောင်းဆိုမှုတွေကို Admin အဖွဲ့က အကြောင်းအရင်း အလိုက် စစ်ဆေး ဆုံးဖြတ်ပါတယ်။ Refund page ကနေ တောင်းဆိုနိုင်ပါတယ်။' },
    { n: '4', title: 'လက်မှတ် ထုတ်ပေးခြင်း', text: 'သင်တန်း ပြီးဆုံးပြီး quiz/assignment အမှတ် ပြည့်မီမှ လက်မှတ် ထုတ်ပေးပါတယ်။ သူတစ်ပါး အစားထိုး ဖြေဆိုထားတာ တွေ့ရှိရင် လက်မှတ်ကို ရုပ်သိမ်းနိုင်ပါတယ်။ လက်မှတ်တိုင်းမှာ အတည်ပြုနိုင်တဲ့ Certificate ID ပါဝင်ပါတယ်။' },
    { n: '5', title: 'Community စည်းကမ်း', text: 'Community မှာ လေးစားမှုရှိစွာ ဆွေးနွေးပါ။ Assignment အဖြေ အပြည့်အစုံ တိုက်ရိုက် တင်ခြင်း၊ ကြော်ငြာ spam တင်ခြင်း မလုပ်ရပါ။ ချိုးဖောက်တဲ့ post တွေကို admin က ဖယ်ရှားနိုင်ပါတယ်။' },
];

export default function Terms() {
    return (
        <PublicLayout>
            <Head title="စည်းမျဉ်းစည်းကမ်း" />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">စည်းမျဉ်းစည်းကမ်း & ကိုယ်ရေး လုံခြုံမှု</h1>
                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                    Codexa MM ကို အသုံးပြုရာမှာ သဘောတူညီရမယ့် စည်းကမ်းတွေနဲ့ သင့်အချက်အလက်ကို ဘယ်လို ကိုင်တွယ်တယ် ဆိုတာ — နောက်ဆုံး ပြင်ဆင်ချိန် · 2026 နိုဝင်ဘာ 1
                </p>

                <div className="mt-8 inline-flex gap-1.5 rounded-full bg-white p-1.5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <span className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white">စည်းမျဉ်းစည်းကမ်း (Terms)</span>
                    <Link href="/privacy-policy" className="rounded-full px-4 py-2 text-sm font-bold text-[#5a6a8a] transition hover:text-[#0d1730] dark:text-[#97a6c6] dark:hover:text-white">
                        ကိုယ်ရေး လုံခြုံမှု (Privacy)
                    </Link>
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

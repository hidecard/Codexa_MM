import { Head, Link } from '@inertiajs/react';
import { BookOpen, Briefcase, Languages, Star, Users } from 'lucide-react';
import { PublicLayout } from '@/components/shared/public-layout';
import { formatCount, initials, instructorInfo } from '@/lib/ui-utils';

type ApiInstructor = { id: number; name: string; courses_count?: number; profile?: { bio?: string | null } | null };
type Props = { instructors?: ApiInstructor[]; stats?: { courses?: number; students?: number; instructors?: number; rating?: number | null } };

const values = [
    { icon: BookOpen, tint: 'bg-teal-500/10 text-teal-600 dark:text-teal-300', title: 'လက်တွေ့ အခြေပြု သင်ကြားမှု', text: 'သီအိုရီ သက်သက် မဟုတ်ဘဲ သင်တန်းတိုင်းမှာ တကယ့် product နဲ့ တူတဲ့ project တွေ တည်ဆောက်ရင်း သင်ယူရပါတယ်။' },
    { icon: Languages, tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', title: 'မြန်မာဘာသာ အပြည့်အစုံ', text: 'Video, စာရွက်စာတမ်းနဲ့ ဆရာ feedback အားလုံး မြန်မာလို ဖြစ်လို့ concept တွေကို နက်နက်နဲနဲ နားလည်နိုင်ပါတယ်။' },
    { icon: Briefcase, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', title: 'အလုပ် ရရှိရေး အထောက်အပံ့', text: 'Learning Path, portfolio review နဲ့ မိတ်ဖက် ကုမ္ပဏီတွေရဲ့ အလုပ်ခေါ်စာတွေက သင်တန်း ပြီးသူတွေကို အလုပ်နဲ့ ချိတ်ဆက်ပေးပါတယ်။' },
];

const milestones = [
    { year: '2024', title: 'Codexa MM စတင် တည်ထောင်', text: 'HTML/CSS နဲ့ Python သင်တန်း ၂ ခုနဲ့ ကျောင်းသား ၂၀၀ ဦးဖြင့် စတင်ခဲ့ပါတယ်။' },
    { year: '2025', title: 'Video Classes နဲ့ Community စတင်', text: 'Video session တွေနဲ့ ကျောင်းသားအချင်းချင်း ဆွေးနွေးနိုင်တဲ့ community ကို ဖွင့်လှစ်ခဲ့ပါတယ်။' },
    { year: '2026', title: 'Learning Paths နဲ့ လက်မှတ် စနစ်', text: 'အလုပ်အကိုင် လမ်းကြောင်း ၄ ခု၊ အတည်ပြုနိုင်တဲ့ digital လက်မှတ်တွေနဲ့ မိတ်ဖက် ကုမ္ပဏီ အလုပ်ခေါ်စာတွေ ထည့်သွင်းခဲ့ပါတယ်။' },
];

export default function About({ instructors: apiInstructors, stats }: Props) {
    const instructors = apiInstructors ?? [];

    const displayStats = [
        { icon: Users, tint: 'bg-teal-500/10 text-teal-600 dark:text-teal-300', value: `${formatCount(stats?.students ?? 0)}+`, label: 'သင်တန်း တက်ရောက်မှု စုစုပေါင်း' },
        { icon: BookOpen, tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', value: `${stats?.courses ?? 0} ခု`, label: 'ဖွင့်လှစ်ထားသော သင်တန်းများ' },
        { icon: Users, tint: 'bg-purple-500/10 text-purple-600 dark:text-purple-300', value: `${stats?.instructors ?? 0} ဦး`, label: 'အတွေ့အကြုံရှိ ဆရာ/ဆရာမများ' },
        { icon: Star, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', value: (stats?.rating ?? 0).toFixed(1), label: 'ကျောင်းသား ပျမ်းမျှ အဆင့်သတ်မှတ်ချက်' },
    ];

    return (
        <PublicLayout>
            <Head title="ကျွန်ုပ်တို့ အကြောင်း" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="max-w-3xl">
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Codexa MM အကြောင်း</h1>
                    <p className="mt-2 text-base leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                        မြန်မာ ကျောင်းသားတိုင်း နိုင်ငံတကာ အဆင့်မီ နည်းပညာ ပညာရေးကို မြန်မာဘာသာနဲ့ သင်ယူနိုင်ဖို့ ရည်ရွယ်ပါတယ်
                    </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {displayStats.map((s) => (
                        <div key={s.label} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <span className={`grid size-11 place-items-center rounded-xl ${s.tint}`}>
                                <s.icon className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold leading-none">{s.value}</p>
                            <p className="mt-2 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">{s.label}</p>
                        </div>
                    ))}
                </div>

                <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-8">
                    <h2 className="text-xl font-extrabold">ကျွန်ုပ်တို့၏ ရည်မှန်းချက်</h2>
                    <p className="mt-3 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">
                        Codexa MM ကို 2024 မှာ ရန်ကုန်က developer တစ်စုက စတင် တည်ထောင်ခဲ့ပါတယ်။ အင်္ဂလိပ်စာ အခက်အခဲကြောင့် programming သင်ယူဖို့ နောက်ကျနေတဲ့ မြန်မာ လူငယ်တွေ အတွက် လက်တွေ့
                        project အခြေပြု၊ မြန်မာလို ရှင်းပြတဲ့ သင်တန်းတွေ ဈေးနှုန်း သင့်တင့်စွာ ပေးနိုင်ဖို့ ဖြစ်ပါတယ်။ သင်ခန်းစာတိုင်းမှာ လက်တွေ့ လေ့ကျင့်ခန်း၊ assignment နဲ့ ဆရာရဲ့ feedback ပါဝင်ပြီး
                        သင်တန်း ပြီးရင် အလုပ်ဝင်ဖို့ လိုအပ်တဲ့ portfolio project အထိ လမ်းညွှန်ပေးပါတယ်။
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {values.map((v) => (
                            <div key={v.title} className="rounded-2xl bg-[#eef3fb] p-5 dark:bg-[#12234a]">
                                <span className={`grid size-11 place-items-center rounded-xl bg-white dark:bg-[#0d1730] ${v.tint}`}>
                                    <v.icon className="size-5" />
                                </span>
                                <h3 className="mt-3 font-extrabold">{v.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{v.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-extrabold">ခရီးစဉ် မှတ်တိုင်များ</h2>
                    <div className="mt-5 space-y-4">
                        {milestones.map((m) => (
                            <div key={m.year} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                <span className="flex-none rounded-full bg-teal-600 px-3.5 py-1.5 text-sm font-extrabold text-white">{m.year}</span>
                                <div>
                                    <h3 className="font-extrabold">{m.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{m.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <h2 className="text-xl font-extrabold">သင်ကြားရေး အဖွဲ့</h2>
                        <Link href="/instructors" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                            ဆရာ အားလုံး ကြည့်ရန်
                        </Link>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {instructors.slice(0, 4).map((ins) => {
                            const info = instructorInfo(ins.name);
                            return (
                                <div key={ins.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <span className="grid size-11 flex-none place-items-center rounded-2xl text-xs font-extrabold text-white" style={{ background: info.grad }}>
                                        {initials(ins.name)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-extrabold">{ins.name}</p>
                                        <p className="text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                            {info.role} · သင်တန်း {ins.courses_count ?? 0} ခု
                                        </p>
                                    </div>
                                    <Link
                                        href={`/instructors/${ins.id}`}
                                        className="flex-none rounded-xl bg-white px-3 py-2 text-xs font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                    >
                                        Profile
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section
                    className="mt-10 rounded-2xl p-6 text-center text-white sm:p-8"
                    style={{ background: 'linear-gradient(150deg,#0b2a4a,#07332e)' }}
                >
                    <h2 className="text-xl font-extrabold">ကျွန်ုပ်တို့နဲ့ အတူ သင်ယူဖို့ အဆင်သင့်လား?</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-teal-100/85">သင်တန်းတွေ ကြည့်ပြီး ဒီနေ့ပဲ စတင်လိုက်ပါ — အကောင့် ဖွင့်တာ အခမဲ့ပါ။</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Link href="/courses" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 transition hover:bg-teal-50">
                            သင်တန်းများ ကြည့်ရန်
                        </Link>
                        <Link href="/contact" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15">
                            ဆက်သွယ်ရန်
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
import { Head, Link } from '@inertiajs/react';
import { Briefcase, Check, ChevronDown, Clock3, MapPin, Wallet } from 'lucide-react';
import { useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { JOB_TYPES, SAMPLE_JOBS, formatCount } from './sample-data';

type Props = {
    jobs?: {
        id: number;
        title: string;
        company: string;
        loc: string;
        type: string;
        salary: string;
        skills: string[];
        posted: string;
        path: string;
        desc: string;
        reqs: string[];
    }[];
};

export default function Jobs({ jobs: apiJobs }: Props) {
    const jobs = apiJobs && apiJobs.length > 0 ? apiJobs : SAMPLE_JOBS;
    const [type, setType] = useState('All');
    const [openId, setOpenId] = useState<number | null>(null);
    const [applied, setApplied] = useState<Record<number, boolean>>({});

    const list = jobs.filter((j) => type === 'All' || j.type === type);

    return (
        <PublicLayout>
            <Head title="အလုပ်အခွင့်အလမ်းများ" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">အလုပ်အခွင့်အလမ်းများ</h1>
                        <p className="mt-1 max-w-2xl text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                            Codexa MM မိတ်ဖက် ကုမ္ပဏီတွေက သင်တန်း ပြီးဆုံးသူတွေအတွက် ဖွင့်ထားတဲ့ အလုပ်ခေါ်စာများ — သက်ဆိုင်ရာ Learning Path ပြီးထားရင် ဦးစားပေး စဉ်းစားပေးပါတယ်
                        </p>
                    </div>
                    <span className="rounded-full bg-teal-500/10 px-3.5 py-1.5 text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        အလုပ်ခေါ်စာ {formatCount(list.length)} ခု
                    </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {JOB_TYPES.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                type === t
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                            }`}
                        >
                            {t === 'All' ? 'အားလုံး' : t}
                        </button>
                    ))}
                </div>

                <div className="mt-5 space-y-3">
                    {list.map((job) => (
                        <article key={job.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <button type="button" onClick={() => setOpenId(openId === job.id ? null : job.id)} className="flex w-full items-start gap-4 p-5 text-left">
                                <span className="grid size-12 flex-none place-items-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                                    <Briefcase className="size-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-extrabold leading-snug">{job.title}</span>
                                    <span className="mt-0.5 block text-sm font-semibold text-teal-700 dark:text-teal-300">{job.company}</span>
                                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-3.5" /> {job.loc}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="size-3.5" /> {job.type}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Wallet className="size-3.5" /> {job.salary}
                                        </span>
                                    </span>
                                    <span className="mt-2.5 flex flex-wrap gap-2">
                                        {job.skills.map((s) => (
                                            <span key={s} className="rounded-full bg-[#eef3fb] px-3 py-1 text-xs font-bold dark:bg-[#12234a]">
                                                {s}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                                <ChevronDown className={`mt-1 size-4 flex-none text-[#8494b3] transition-transform dark:text-[#67779c] ${openId === job.id ? 'rotate-180' : ''}`} />
                            </button>
                            {openId === job.id && (
                                <div className="border-t border-[#e7ecf5] px-5 pb-5 pt-4 dark:border-[#18264a]">
                                    <p className="text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{job.desc}</p>
                                    <p className="mt-4 text-sm font-extrabold">
                                        လိုအပ်ချက်များ <span className="font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">· သက်ဆိုင်ရာ {job.path}</span>
                                    </p>
                                    <ul className="mt-2 space-y-2">
                                        {job.reqs.map((r) => (
                                            <li key={r} className="flex gap-2.5 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                                                <Check className="mt-0.5 size-4 flex-none text-teal-600 dark:text-teal-300" strokeWidth={2.5} />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setApplied((prev) => ({ ...prev, [job.id]: !prev[job.id] }))}
                                            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                                                applied[job.id] ? 'bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/30 dark:text-teal-300' : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}
                                        >
                                            {applied[job.id] ? 'လျှောက်ထားပြီးပါပြီ ✓' : 'လျှောက်ထားရန်'}
                                        </button>
                                        <a
                                            href={`mailto:support@codexamm.com?subject=${encodeURIComponent(`အလုပ်လျှောက်ထားခြင်း — ${job.title} (${job.company})`)}`}
                                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                        >
                                            CV ဖြင့် လျှောက်ထားရန်
                                        </a>
                                        <span className="text-xs text-[#8494b3] dark:text-[#67779c]">တင်ထားသည့်ရက် · {job.posted}</span>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                    {list.length === 0 && (
                        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <p className="text-lg font-extrabold">ဒီ အမျိုးအစားမှာ အလုပ်ခေါ်စာ မရှိသေးပါ</p>
                            <button type="button" onClick={() => setType('All')} className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                                အလုပ် အားလုံး ကြည့်ရန်
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:flex-row sm:items-center sm:p-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-extrabold">အလုပ်အတွက် ပြင်ဆင်မှု မပြည့်စုံသေးဘူးလား?</h2>
                        <p className="mt-1 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                            Learning Path တွေက သင်တန်း + project + လက်မှတ်ကို အဆင့်ဆင့် စီထားလို့ ပြီးဆုံးတာနဲ့ ဒီ အလုပ်တွေကို ယုံကြည်စွာ လျှောက်နိုင်ပါပြီ။
                        </p>
                    </div>
                    <Link
                        href="/student/paths"
                        className="flex-none rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                    >
                        လမ်းကြောင်းများ ကြည့်ရန်
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Download } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { BookOpen, Star, Users, Wallet } from 'lucide-react';
import { formatKyat, formatNumber } from '@/lib/format';
import { BarChart, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES, SAMPLE_INS_MONTHLY, SAMPLE_PAYOUTS } from '@/pages/Admin/Academy/_sample';

type EarningCourse = {
    id: number;
    title: string;
    price: number;
    students: number;
    rating: number;
};

export default function Show({ course, courseId }: { course?: EarningCourse; courseId?: number }) {
    // SAMPLE DATA fallback (prototype): no earnings backend yet.
    const c: EarningCourse =
        course ??
        (() => {
            const found = SAMPLE_COURSES.find((x) => x.id === courseId) ?? SAMPLE_COURSES[3];
            return { id: found.id, title: found.title, price: found.price, students: found.students, rating: found.rating };
        })();
    const revenue = c.price * c.students;
    const share = Math.round(revenue * 0.5);
    const payouts = SAMPLE_PAYOUTS.filter((p) => p.name === 'Thura Aung');

    return (
        <LmsShell title="ဝင်ငွေ အသေးစိတ်" nav="instructor">
            <Head title={`ဝင်ငွေ အသေးစိတ် · ${c.title}`} />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="ဝင်ငွေ အသေးစိတ်"
                description="သင်တန်းအလိုက် ရောင်းရငွေ၊ ခွဲဝေနှုန်း 50% နဲ့ payout မှတ်တမ်း အသေးစိတ်"
                actions={
                    <>
                        <Link href="/instructor/earnings" className={btnGhostCls}>
                            <ChevronLeft className="size-4" /> ဝင်ငွေ အကျဉ်းချုပ်
                        </Link>
                        <button type="button" className={btnGhostCls}>
                            <Download className="size-4" /> အသေးစိတ် CSV ဒေါင်းလုဒ်ရန်
                        </button>
                    </>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="သင်တန်း" value={c.title} icon={BookOpen} tone="purple" />
                <StatCard label="ကျောင်းသား စုစုပေါင်း" value={`${formatNumber(c.students)} ဦး`} icon={Users} tone="blue" />
                <StatCard label="ရောင်းရငွေ စုစုပေါင်း" value={formatKyat(revenue)} icon={Wallet} tone="teal" />
                <StatCard label="သင့် ခွဲဝေငွေ (50%)" value={formatKyat(share)} sub={`Rating ${c.rating}`} icon={Star} tone="amber" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="သင်တန်းအလိုက် ခွဲခြမ်းစိတ်ဖြာမှု">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b border-slate-200 text-left dark:border-[#1e2c52] ${mutedCls}`}>
                                    <th className="py-2 pr-3 font-semibold">သင်တန်း</th>
                                    <th className="py-2 pr-3 font-semibold">ဈေးနှုန်း</th>
                                    <th className="py-2 pr-3 font-semibold">ကျောင်းသား</th>
                                    <th className="py-2 pr-3 font-semibold">ရောင်းရငွေ</th>
                                    <th className="py-2 font-semibold">ခွဲဝေငွေ (50%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#18264a]">
                                {SAMPLE_COURSES.filter((x) => x.instructor === 'Thura Aung').map((x) => (
                                    <tr key={x.id} className={x.id === c.id ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''}>
                                        <td className={`py-2.5 pr-3 font-bold ${inkCls}`}>{x.title}</td>
                                        <td className={`py-2.5 pr-3 ${mutedCls}`}>{formatKyat(x.price)}</td>
                                        <td className={`py-2.5 pr-3 ${mutedCls}`}>{formatNumber(x.students)}</td>
                                        <td className={`py-2.5 pr-3 font-bold ${inkCls}`}>{formatKyat(x.price * x.students)}</td>
                                        <td className="py-2.5 font-bold text-teal-700 dark:text-teal-300">{formatKyat(Math.round(x.price * x.students * 0.5))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="လစဉ် ခွဲဝေငွေ လမ်းကြောင်း">
                    <BarChart data={SAMPLE_INS_MONTHLY} max={40} />
                </SectionCard>
            </div>

            <SectionCard title="Payout မှတ်တမ်း အသေးစိတ်">
                {payouts.length === 0 ? (
                    <p className={`text-sm ${mutedCls}`}>Payout မှတ်တမ်း မရှိသေးပါ။</p>
                ) : (
                    <div>
                        {payouts.map((p) => (
                            <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.88rem] font-bold ${inkCls}`}>
                                        {p.id} · {p.method}
                                    </p>
                                    <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>{p.date}</p>
                                </div>
                                <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(p.amount)}</span>
                                {p.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : p.status === 'hold' ? <Pill tone="rose">ဆိုင်းငံ့ထား</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Download, Users, Wallet } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatKyat, formatNumber } from '@/lib/format';
import { PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { mySampleCourses } from '@/pages/Admin/Academy/_sample';

// SAMPLE DATA fallback (prototype): no earnings backend yet — routes needed.
const MONTHS = [
    { label: 'နိုဝင်ဘာ 2026', sales: 412, total: 7600000, share: 3800000, status: 'pending' },
    { label: 'အောက်တိုဘာ 2026', sales: 388, total: 6840000, share: 3420000, status: 'paid' },
    { label: 'စက်တင်ဘာ 2026', sales: 341, total: 5800000, share: 2900000, status: 'paid' },
    { label: 'ဩဂုတ် 2026', sales: 296, total: 5000000, share: 2500000, status: 'paid' },
    { label: 'ဇူလိုင် 2026', sales: 264, total: 4400000, share: 2200000, status: 'paid' },
    { label: 'ဇွန် 2026', sales: 218, total: 3600000, share: 1800000, status: 'paid' },
];

export default function Index() {
    const mine = mySampleCourses();
    const revenue = mine.reduce((s, c) => s + c.price * c.students, 0);
    const share = Math.round(revenue * 0.5);
    const students = mine.reduce((s, c) => s + c.students, 0);
    const maxRev = Math.max(...mine.map((c) => c.price * c.students), 1);
    const [requested, setRequested] = useState(false);

    return (
        <LmsShell title="ဆရာ ဝင်ငွေ & Payout" nav="instructor">
            <Head title="ဆရာ ဝင်ငွေ & Payout" />
            <PageIntro
                title="ဆရာ ဝင်ငွေ & Payout"
                description="သင်တန်း ရောင်းရငွေရဲ့ 50% ကို ခွဲဝေငွေ အဖြစ် ရရှိပါတယ် — လစဉ် အသေးစိတ်နဲ့ ထုတ်ယူမှု အခြေအနေကို ဒီမှာ ကြည့်နိုင်ပါတယ်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> ဝင်ငွေ အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="သင်တန်း ရောင်းရငွေ စုစုပေါင်း" value={formatKyat(revenue)} icon={BookOpen} tone="blue" />
                <StatCard label="ခွဲဝေငွေ စုစုပေါင်း" value={formatKyat(share)} sub="50%" icon={Wallet} tone="teal" />
                <StatCard label="ဒီလ (နိုဝင်ဘာ) ခွဲဝေငွေ" value={formatKyat(3800000)} icon={Wallet} tone="amber" />
                <StatCard label={`ကျောင်းသား စုစုပေါင်း · သင်တန်း ${mine.length} ခု`} value={`${formatNumber(students)} ဦး`} icon={Users} tone="purple" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-6 xl:col-span-2">
                    <SectionCard title="သင်တန်းအလိုက် ဝင်ငွေ ခွဲဝေမှု">
                        <div className="space-y-5">
                            {mine.map((c) => {
                                const rev = c.price * c.students;
                                return (
                                    <div key={c.id}>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <Link href={`/instructor/earnings/${c.id}`} className={`text-[.9rem] font-bold hover:underline ${inkCls}`}>
                                                {c.title}
                                            </Link>
                                            <span className={`text-[.8rem] font-bold ${mutedCls}`}>
                                                ဝင်ငွေ {formatKyat(rev)} · ခွဲဝေ {formatKyat(Math.round(rev * 0.5))}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <ProgressBar value={Math.round((rev / maxRev) * 100)} />
                                        </div>
                                        <p className={`mt-1.5 text-[.76rem] ${mutedCls}`}>
                                            ကျောင်းသား {formatNumber(c.students)} ဦး · ဈေးနှုန်း {formatKyat(c.price)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    <SectionCard title="လစဉ် မှတ်တမ်း">
                        <div>
                            {MONTHS.map((m) => (
                                <div key={m.label} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-[#18264a]">
                                    <div className="min-w-0 flex-1 basis-[130px]">
                                        <p className={`text-[.88rem] font-bold ${inkCls}`}>{m.label}</p>
                                        <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                            ရောင်းရမှု {m.sales} ခု · စုစုပေါင်း {formatKyat(m.total)}
                                        </p>
                                    </div>
                                    <span className={`text-[.9rem] font-extrabold ${inkCls}`}>{formatKyat(m.share)}</span>
                                    {m.status === 'paid' ? <Pill tone="teal">ပေးပြီး</Pill> : <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="min-w-0 space-y-6">
                    <SectionCard title="Payout ထုတ်ယူရန်">
                        <p className={`text-[.87rem] leading-relaxed ${mutedCls}`}>
                            အောက်တိုဘာ payout — <b className={inkCls}>ပေးချေပြီး</b>
                        </p>
                        <p className={`mt-3 text-[1.3rem] font-extrabold leading-none ${inkCls}`}>
                            3,800,000 <span className="text-[.85rem]">ကျပ်</span>
                        </p>
                        <p className={`mt-1.5 text-[.8rem] font-semibold ${mutedCls}`}>နိုဝင်ဘာ ခွဲဝေငွေ · ထုတ်ယူရန် အသင့်</p>
                        {requested ? (
                            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-[#12234a]">
                                <p className={`text-[.86rem] font-bold ${inkCls}`}>တောင်းဆိုမှု ပို့ထားပြီး</p>
                                <p className={`mt-1 text-[.8rem] leading-relaxed ${mutedCls}`}>
                                    Admin စစ်ဆေးနေပါတယ်။ အတည်ပြုရင် ဒီ box မှာ အခြေအနေ ပြောင်းသွားပါမယ်။
                                </p>
                            </div>
                        ) : (
                            <button type="button" className={`${btnAccentCls} mt-4 w-full py-3 text-[.95rem]`} onClick={() => setRequested(true)}>
                                Payout တောင်းဆိုရန်
                            </button>
                        )}
                        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#18264a]">
                            <p className={`text-[.82rem] font-bold ${inkCls}`}>ထုတ်ယူမှု နည်းလမ်း</p>
                            <p className={`mt-1 text-[.84rem] ${mutedCls}`}>KBZPay · 09771234567 (Thura Aung)</p>
                            <p className={`mt-1 text-[.78rem] ${mutedCls}`}>
                                ပြောင်းချင်ရင် Admin ထံ message ပို့ပါ။ Payout တောင်းဆိုမှုတွေကို Admin ဘက် "ဆရာ Payout စီမံရန်" မှာ အတည်ပြုပေးပါတယ်။
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </LmsShell>
    );
}

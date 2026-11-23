import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, Download, Star, Users, Wallet, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { Avatar, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_INST_APPS, SAMPLE_INSTRUCTORS, type SampleInstructor } from '@/pages/Admin/Academy/_sample';

type InstructorApp = { name: string; init: string; col: string; field: string; exp: string; note: string; when: string };

export default function Index({ instructors, applications }: { instructors?: SampleInstructor[]; applications?: InstructorApp[] }) {
    // SAMPLE DATA fallback (prototype): used until Admin/Academy/InstructorController is wired.
    const list = instructors ?? SAMPLE_INSTRUCTORS;
    const [apps, setApps] = useState<InstructorApp[]>(applications ?? SAMPLE_INST_APPS);
    const [notice, setNotice] = useState('');

    const avgRating = list.length ? list.reduce((s, i) => s + i.rating, 0) / list.length : 0;
    const monthShare = list.reduce((s, i) => s + i.share, 0);

    const decide = (name: string, ok: boolean) => {
        setApps(apps.filter((a) => a.name !== name));
        setNotice(ok ? `${name} ကို Instructor အဖြစ် အတည်ပြုပြီးပါပြီ (ဤ page မှာသာ)` : `${name} ရဲ့ လျှောက်လွှာကို ပယ်ချပြီးပါပြီ (ဤ page မှာသာ)`);
    };

    return (
        <LmsShell title="ဆရာ/ဆရာမ စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="ဆရာ/ဆရာမ စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="ဆရာ/ဆရာမ စီမံခန့်ခွဲမှု"
                description="Instructor များရဲ့ သင်တန်း၊ ကျောင်းသားနဲ့ ဝင်ငွေ ခွဲဝေမှုကို စီမံရန် · လျှောက်လွှာ အသစ်များ စစ်ဆေးရန်"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> Instructor အစီရင်ခံစာ ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="Instructor စုစုပေါင်း" value={`${list.length} ဦး`} sub="အားလုံး active ဖြစ်ပါတယ်" icon={Users} tone="blue" />
                <StatCard label="လျှောက်လွှာ စောင့်ဆိုင်းဆဲ" value={`${apps.length} ခု`} sub="စစ်ဆေး အတည်ပြုရန် လိုအပ်ပါတယ်" icon={Users} tone="amber" />
                <StatCard label="ပျမ်းမျှ Rating" value={`${avgRating.toFixed(1)} / 5`} sub="Review စုစုပေါင်း 3,910 ခု" icon={Star} tone="teal" />
                <StatCard label="ဒီလ Instructor ခွဲဝေငွေ" value={formatKyat(monthShare)} sub="ဝင်ငွေရဲ့ 50% ခွဲဝေမှု" icon={Wallet} tone="purple" />
            </div>

            <SectionCard title={`Instructor လျှောက်လွှာ အသစ်များ — ${apps.length} ခု`}>
                {apps.length === 0 ? (
                    <p className={`text-sm ${mutedCls}`}>စောင့်ဆိုင်းဆဲ လျှောက်လွှာ မရှိတော့ပါ — လျှောက်လွှာ အားလုံးကို စစ်ဆေးပြီးပါပြီ</p>
                ) : (
                    <div className="space-y-3.5">
                        {apps.map((a) => (
                            <LmsCard key={a.name} className="p-5">
                                <div className="flex flex-wrap items-start gap-3.5">
                                    <Avatar init={a.init} color={a.col} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{a.name}</p>
                                            <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>
                                        </div>
                                        <p className={`mt-0.5 text-[.8rem] font-semibold ${mutedCls}`}>
                                            {a.field} · {a.exp} · {a.when}
                                        </p>
                                        <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{a.note}</p>
                                    </div>
                                    <div className="flex flex-none flex-wrap gap-2">
                                        <button type="button" className={btnGhostCls} onClick={() => decide(a.name, true)}>
                                            <Check className="size-4" /> အတည်ပြုရန်
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => decide(a.name, false)}>
                                            <X className="size-4" /> ပယ်ချရန်
                                        </button>
                                    </div>
                                </div>
                            </LmsCard>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="လက်ရှိ Instructor များ">
                <div className="space-y-3.5">
                    {list.map((ins) => (
                        <LmsCard key={ins.name} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={ins.init} color={ins.col} size="lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{ins.name}</p>
                                    {ins.payout === 'paid' ? <Pill tone="teal">Payout ပေးပြီး</Pill> : <Pill tone="amber">Payout စောင့်ဆိုင်းဆဲ</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {ins.field} · သင်တန်း {ins.courses} ခု · ကျောင်းသား {formatNumber(ins.students)} ဦး · Rating {ins.rating}
                                </p>
                                <p className={`mt-1 text-[.84rem] font-bold ${inkCls}`}>
                                    ဒီလ ခွဲဝေငွေ <span className="text-teal-700 dark:text-teal-300">{formatKyat(ins.share)}</span>
                                </p>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            </SectionCard>
        </LmsShell>
    );
}

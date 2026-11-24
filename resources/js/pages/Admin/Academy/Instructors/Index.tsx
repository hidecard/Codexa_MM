import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, Download, Star, UserX, Users, Wallet, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatKyat, formatNumber } from '@/lib/format';
import { Avatar, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import type { SampleInstructor } from '@/pages/Admin/Academy/_sample';

type InstructorRow = SampleInstructor & { id: number; status: string };
type InstructorApp = { id: number; name: string; init: string; col: string; email: string; field: string; exp: string; note: string; portfolio_links: string[]; status: string; admin_note: string | null; when: string };

export default function Index({ instructors = [], applications = [] }: { instructors?: InstructorRow[]; applications?: InstructorApp[] }) {
    const [notice, setNotice] = useState('');
    const [appNotes, setAppNotes] = useState<Record<number, string>>({});

    const avgRating = instructors.length ? instructors.reduce((s, i) => s + i.rating, 0) / instructors.length : 0;
    const monthShare = instructors.reduce((s, i) => s + i.share, 0);
    const suspendedCount = instructors.filter((i) => i.status === 'suspended').length;
    const pendingApps = applications.filter((a) => a.status === 'pending');

    const setStatus = (id: number, action: 'activate' | 'suspend', done: string) => {
        router.post(`/admin/academy/instructors/${id}/${action}`, {}, { preserveScroll: true, onSuccess: () => setNotice(done) });
    };

    const reviewApp = (id: number, action: 'approve' | 'reject', done: string) => {
        router.post(
            `/admin/academy/instructor-applications/${id}/${action}`,
            { admin_note: (appNotes[id] ?? '').trim() || null },
            { preserveScroll: true, onSuccess: () => { setAppNotes({ ...appNotes, [id]: '' }); setNotice(done); } },
        );
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
                <StatCard label="Instructor စုစုပေါင်း" value={`${instructors.length} ဦး`} sub={suspendedCount ? `${suspendedCount} ဦး ဆိုင်းငံ့ထားသည်` : 'အားလုံး active ဖြစ်ပါတယ်'} icon={Users} tone="blue" />
                <StatCard label="လျှောက်လွှာ စောင့်ဆိုင်းဆဲ" value={`${pendingApps.length} ခု`} sub="စစ်ဆေး အတည်ပြုရန် လိုအပ်ပါတယ်" icon={Users} tone="amber" />
                <StatCard label="ပျမ်းမျှ Rating" value={`${avgRating.toFixed(1)} / 5`} icon={Star} tone="teal" />
                <StatCard label="ဒီလ Instructor ခွဲဝေငွေ" value={formatKyat(monthShare)} sub="ဝင်ငွေရဲ့ 50% ခွဲဝေမှု" icon={Wallet} tone="purple" />
            </div>

            <SectionCard title={`Instructor လျှောက်လွှာ အသစ်များ — ${pendingApps.length} ခု`}>
                {applications.length === 0 ? (
                    <p className={`text-sm ${mutedCls}`}>လျှောက်လွှာ မရှိသေးပါ — /teach စာမျက်နှာကနေ လျှောက်ထားသူများ ဒီမှာ ပေါ်လာပါမယ်</p>
                ) : (
                    <div className="space-y-3.5">
                        {applications.map((a) => (
                            <LmsCard key={a.id} className={`p-5 ${a.status !== 'pending' ? 'opacity-70' : ''}`}>
                                <div className="flex flex-wrap items-start gap-3.5">
                                    <Avatar init={a.init} color={a.col} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{a.name}</p>
                                            {a.status === 'pending' && <Pill tone="amber">စောင့်ဆိုင်းဆဲ</Pill>}
                                            {a.status === 'approved' && <Pill tone="teal">အတည်ပြုပြီး</Pill>}
                                            {a.status === 'rejected' && <Pill tone="rose">ပယ်ချပြီး</Pill>}
                                        </div>
                                        <p className={`mt-0.5 text-[.8rem] font-semibold ${mutedCls}`}>
                                            {a.email} · {a.field} · {a.exp} · {a.when}
                                        </p>
                                        {a.note && <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{a.note}</p>}
                                        {a.portfolio_links.length > 0 && (
                                            <p className={`mt-1.5 text-[.8rem] ${mutedCls}`}>
                                                Portfolio —{' '}
                                                {a.portfolio_links.map((link, i) => (
                                                    <span key={link}>
                                                        {i > 0 && ' · '}
                                                        <a href={link} target="_blank" rel="noreferrer" className="font-bold text-teal-700 underline dark:text-teal-300">
                                                            {link}
                                                        </a>
                                                    </span>
                                                ))}
                                            </p>
                                        )}
                                        {a.admin_note && <p className="mt-1.5 text-[.8rem] font-bold text-teal-700 dark:text-teal-300">Admin မှတ်ချက် — {a.admin_note}</p>}
                                        {a.status === 'pending' && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <input
                                                    className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                    placeholder="Admin မှတ်ချက် (မဖြစ်မနေ မဟုတ်)…"
                                                    value={appNotes[a.id] ?? ''}
                                                    onChange={(e) => setAppNotes({ ...appNotes, [a.id]: e.target.value })}
                                                />
                                                <button type="button" className={btnGhostCls} onClick={() => reviewApp(a.id, 'approve', `${a.name} ကို Instructor အဖြစ် အတည်ပြုပြီးပါပြီ`)}>
                                                    <Check className="size-4" /> အတည်ပြုရန်
                                                </button>
                                                <button type="button" className={btnGhostCls} onClick={() => reviewApp(a.id, 'reject', `${a.name} ရဲ့ လျှောက်လွှာကို ပယ်ချပြီးပါပြီ`)}>
                                                    <X className="size-4" /> ပယ်ချရန်
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </LmsCard>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="လက်ရှိ Instructor များ">
                <div className="space-y-3.5">
                    {instructors.map((ins) => (
                        <LmsCard key={ins.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={ins.init} color={ins.col} size="lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold ${inkCls}`}>{ins.name}</p>
                                    {ins.payout === 'paid' ? <Pill tone="teal">Payout ပေးပြီး</Pill> : <Pill tone="amber">Payout စောင့်ဆိုင်းဆဲ</Pill>}
                                    {ins.status === 'suspended' ? <Pill tone="rose">ဆိုင်းငံ့ထား</Pill> : <Pill tone="teal">Active</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {ins.field} · သင်တန်း {ins.courses} ခု · ကျောင်းသား {formatNumber(ins.students)} ဦး · Rating {ins.rating}
                                </p>
                                <p className={`mt-1 text-[.84rem] font-bold ${inkCls}`}>
                                    ဒီလ ခွဲဝေငွေ <span className="text-teal-700 dark:text-teal-300">{formatKyat(ins.share)}</span>
                                </p>
                            </div>
                            <div className="flex flex-none flex-wrap gap-2">
                                {ins.status === 'suspended' ? (
                                    <button type="button" className={btnGhostCls} onClick={() => setStatus(ins.id, 'activate', `${ins.name} ကို ပြန်ဖွင့်ပြီးပါပြီ`)}>
                                        ပြန်ဖွင့်ရန်
                                    </button>
                                ) : (
                                    <button type="button" className={btnGhostCls} onClick={() => setStatus(ins.id, 'suspend', `${ins.name} ကို ဆိုင်းငံ့ထားပြီးပါပြီ`)}>
                                        <UserX className="size-4" /> ဆိုင်းငံ့ရန်
                                    </button>
                                )}
                            </div>
                        </LmsCard>
                    ))}
                </div>
            </SectionCard>
        </LmsShell>
    );
}

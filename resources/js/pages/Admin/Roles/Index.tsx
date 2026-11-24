import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatNumber } from '@/lib/format';
import { LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type RoleRow = {
    id: number;
    name: string;
    users_count: number;
    permissions: string[];
};

type Props = { roles: RoleRow[] };

const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin',
    'super-admin': 'Super Admin',
    instructor: 'ဆရာ',
    student: 'ကျောင်းသား',
    client: 'Client',
    support: 'Support',
    finance: 'Finance',
};

const ROLE_DESC: Record<string, string> = {
    admin: 'Platform တစ်ခုလုံးကို စီမံနိုင်သည်',
    'super-admin': 'Admin အားလုံးထက် အခွင့်အရေး ပိုများသည်',
    instructor: 'ကိုယ်ပိုင် သင်တန်းများ ဖန်တီး၊ သင်ကြားနိုင်သည်',
    student: 'သင်တန်းများ ဝယ်ယူ၊ လေ့လာနိုင်သည်',
    client: 'Solutions project များကို ကြည့်ရှုနိုင်သည်',
    support: 'Support ticket များကို ဖြေကြားနိုင်သည်',
    finance: 'ငွေကြေးဆိုင်ရာ အချက်အလက်များကို ကြည့်ရှုနိုင်သည်',
};

export default function Index({ roles }: Props) {
    return (
        <LmsShell title="Role များ" nav="admin">
            <Head title="Role များ" />
            <PageIntro
                eyebrow="ADMIN"
                title="Role များ"
                description="အသုံးပြုသူ တစ်ဦးချင်းစီရဲ့ လုပ်ပိုင်ခွင့်ကို သတ်မှတ်ထားသော role များနှင့် permission များ"
                actions={
                    <Link href="/admin/users" className={btnGhostCls}>
                        <Users className="size-4" /> အသုံးပြုသူများ
                    </Link>
                }
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {roles.map((role) => (
                    <LmsCard key={role.id} className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid size-11 place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                                    <ShieldCheck className="size-5" />
                                </span>
                                <div>
                                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>{ROLE_LABEL[role.name] ?? role.name}</h2>
                                    <p className={`text-[.8rem] ${mutedCls}`}>{ROLE_DESC[role.name] ?? role.name}</p>
                                </div>
                            </div>
                            <Pill tone="teal">{formatNumber(role.users_count)} ဦး</Pill>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {role.permissions.length === 0 ? (
                                <p className={`text-[.82rem] ${mutedCls}`}>Permission မသတ်မှတ်ထားပါ။</p>
                            ) : (
                                role.permissions.map((permission) => (
                                    <span key={permission} className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 dark:bg-[#12234a] dark:text-slate-300">
                                        {permission}
                                    </span>
                                ))
                            )}
                        </div>
                        <Link href={`/admin/users?role=${role.name}`} className={`mt-4 inline-block text-sm font-bold text-teal-600 hover:text-teal-700`}>
                            ဒီ role ရှိသူ ကြည့်ရန် →
                        </Link>
                    </LmsCard>
                ))}
            </div>
            {roles.length === 0 && (
                <p className={`mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm ${mutedCls}`}>Role မရှိသေးပါ။</p>
            )}
        </LmsShell>
    );
}

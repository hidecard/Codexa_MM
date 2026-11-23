import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { MailPlus, ShieldCheck } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { Avatar, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type StaffRole = 'Super Admin' | 'Admin' | 'Support' | 'Finance' | 'Instructor';
type StaffRow = { id: number; name: string; init: string; col: string; email: string; role: StaffRole; status: 'active' | 'inactive' };

const PERMISSIONS: { action: string; roles: Record<string, string> }[] = [
    { action: 'သင်တန်း စီမံရန်', roles: { 'Super Admin': '✓', Admin: '✓', Support: '—', Finance: '—' } },
    { action: 'ကျောင်းသား စီမံရန်', roles: { 'Super Admin': '✓', Admin: '✓', Support: '✓ (ကြည့်သာ)', Finance: '—' } },
    { action: 'ငွေပေးချေမှု စစ်ဆေးရန်', roles: { 'Super Admin': '✓', Admin: '✓', Support: '—', Finance: '✓' } },
    { action: 'Refund အတည်ပြုရန်', roles: { 'Super Admin': '✓', Admin: '—', Support: '—', Finance: '✓' } },
    { action: 'Support Ticket ဖြေရန်', roles: { 'Super Admin': '✓', Admin: '✓', Support: '✓', Finance: '—' } },
    { action: 'Coupon / ကြေညာချက်', roles: { 'Super Admin': '✓', Admin: '✓', Support: '—', Finance: '—' } },
    { action: 'Staff & Roles စီမံရန်', roles: { 'Super Admin': '✓', Admin: '—', Support: '—', Finance: '—' } },
    { action: 'Platform Settings', roles: { 'Super Admin': '✓', Admin: '—', Support: '—', Finance: '—' } },
];

const ROLES = ['Super Admin', 'Admin', 'Support', 'Finance'] as const;
const ROLE_OPTIONS: StaffRole[] = [...ROLES, 'Instructor'];

function rolePill(role: string) {
    if (role === 'Super Admin') return <Pill tone="violet">Super Admin</Pill>;
    if (role === 'Admin') return <Pill tone="blue">Admin</Pill>;
    if (role === 'Finance') return <Pill tone="teal">Finance</Pill>;
    if (role === 'Instructor') return <Pill tone="green">Instructor</Pill>;
    return <Pill tone="amber">Support</Pill>;
}

export default function Index({ staff = [] }: { staff?: StaffRow[] }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<(typeof ROLES)[number]>('Support');
    const [notice, setNotice] = useState('');
    const [noticeError, setNoticeError] = useState(false);

    const showError = (errors: Record<string, string>) => {
        setNoticeError(true);
        setNotice(Object.values(errors)[0] ?? 'အမှား ဖြစ်သွားပါတယ် — ပြန်စမ်းကြည့်ပါ');
    };

    const invite = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        router.post(
            '/admin/academy/staff/invite',
            { name: name.trim(), email: email.trim(), role },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice(`${name.trim()} အတွက် အကောင့် ဖွင့်ပြီးပါပြီ — ဖိတ်ခေါ်စာ အီးမေးလ် မပို့ပါ၊ password reset နဲ့ ဝင်ရပါမယ်`);
                    setName('');
                    setEmail('');
                },
                onError: showError,
            },
        );
    };

    const changeRole = (id: number, newRole: StaffRole) => {
        router.put(
            `/admin/academy/staff/${id}/role`,
            { role: newRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice('Role ပြောင်းပြီးပါပြီ');
                },
                onError: showError,
            },
        );
    };

    const toggleStatus = (s: StaffRow) => {
        const next = s.status === 'active' ? 'inactive' : 'active';
        if (next === 'inactive' && !confirm(`${s.name} ရဲ့ အကောင့်ကို ပိတ်မှာ သေချာပါသလား?`)) return;
        router.put(
            `/admin/academy/staff/${s.id}/status`,
            { status: next },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoticeError(false);
                    setNotice(next === 'active' ? 'အကောင့် ပြန်ဖွင့်ပြီးပါပြီ' : 'အကောင့် ပိတ်ပြီးပါပြီ');
                },
                onError: showError,
            },
        );
    };

    return (
        <LmsShell title="Staff & Roles" nav="admin">
            <Head title="Staff & Roles" />
            <PageIntro
                eyebrow="ADMIN"
                title="Staff & Roles"
                description="Admin အဖွဲ့ဝင်များ ဖိတ်ခေါ်ရန်၊ အခန်းကဏ္ဍ (Role) သတ်မှတ်ရန်နဲ့ ခွင့်ပြုချက်များ စီမံရန်"
            />

            {notice && (
                <div
                    className={cn(
                        'mt-6 rounded-xl border px-4 py-3 text-sm font-medium',
                        noticeError
                            ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                            : 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200',
                    )}
                >
                    {notice}
                </div>
            )}

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <MailPlus className="size-5" /> အဖွဲ့ဝင် အသစ် ဖိတ်ခေါ်ရန်
                </h2>
                <form onSubmit={invite} className="mt-4 grid gap-3 sm:grid-cols-4">
                    <Input label="အမည်" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="အီးမေးလ်" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <div>
                        <label className={labelCls}>အခန်းကဏ္ဍ (Role)</label>
                        <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                            {ROLES.map((r) => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className={btnAccentCls}>
                            ဖိတ်ခေါ်စာ ပို့ရန်
                        </button>
                    </div>
                </form>
                <p className={`mt-3 text-[.8rem] ${mutedCls}`}>ဖိတ်ခေါ်စာ အီးမေးလ် မပို့သေးပါ — အကောင့် ဖွင့်ပြီး active ဖြစ်သွားပါမယ်၊ အဖွဲ့ဝင်က password reset နဲ့ ဝင်ရပါမယ်။</p>
            </LmsCard>

            <SectionCard title="အဖွဲ့ဝင်များ">
                <div className="space-y-3">
                    {staff.map((s) => (
                        <div key={s.id} className="flex flex-wrap items-center gap-3.5 rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                            <Avatar init={s.init} color={s.col} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    {rolePill(s.role)}
                                    {s.status === 'active' ? <Pill tone="teal">ဖွင့်ထား</Pill> : <Pill tone="slate">ပိတ်ထား</Pill>}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>{s.email}</p>
                            </div>
                            <select className={`${inputCls} w-40`} value={s.role} onChange={(e) => changeRole(s.id, e.target.value as StaffRole)}>
                                {ROLE_OPTIONS.map((r) => (
                                    <option key={r}>{r}</option>
                                ))}
                            </select>
                            <button type="button" className={btnGhostCls} onClick={() => toggleStatus(s)}>
                                {s.status === 'active' ? 'ပိတ်ရန်' : 'ဖွင့်ရန်'}
                            </button>
                        </div>
                    ))}
                    {staff.length === 0 && <p className={`py-4 text-center text-sm ${mutedCls}`}>အဖွဲ့ဝင် မရှိသေးပါ</p>}
                </div>
            </SectionCard>

            <SectionCard title="ခွင့်ပြုချက် ဇယား (Role အလိုက်)">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b border-slate-200 text-left dark:border-[#1e2c52] ${mutedCls}`}>
                                <th className="py-2 pr-3 font-semibold">လုပ်ဆောင်ချက်</th>
                                {ROLES.map((r) => (
                                    <th key={r} className="px-3 py-2 text-center font-semibold">
                                        {r}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#18264a]">
                            {PERMISSIONS.map((p) => (
                                <tr key={p.action}>
                                    <td className={`py-2.5 pr-3 font-medium ${inkCls}`}>{p.action}</td>
                                    {ROLES.map((r) => (
                                        <td key={r} className={`px-3 py-2.5 text-center ${p.roles[r] === '✓' ? 'font-bold text-teal-700 dark:text-teal-300' : mutedCls}`}>
                                            {p.roles[r]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className={`mt-4 flex items-start gap-2 text-[.8rem] ${mutedCls}`}>
                    <ShieldCheck className="mt-0.5 size-4 flex-none" />
                    ခွင့်ပြုချက်တွေကို ပြောင်းချင်ရင် အဖွဲ့ဝင်ရဲ့ Role ကို အပေါ်က စာရင်းမှာ ပြောင်းပေးပါ။ Super Admin ကသာ Settings နဲ့ Staff ကို စီမံနိုင်ပါတယ်။
                </p>
            </SectionCard>
        </LmsShell>
    );
}

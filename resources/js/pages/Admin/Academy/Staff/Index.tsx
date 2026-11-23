import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { MailPlus, ShieldCheck } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { Avatar, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type StaffRow = { id: number; name: string; init: string; col: string; email: string; role: 'Super Admin' | 'Admin' | 'Support' | 'Finance' };

const SAMPLE_STAFF: StaffRow[] = [
    { id: 1, name: 'Thura Aung', init: 'TA', col: '#0ea892', email: 'thura@codexamm.com', role: 'Super Admin' },
    { id: 2, name: 'May Thazin', init: 'MT', col: '#ec4899', email: 'may@codexamm.com', role: 'Admin' },
    { id: 3, name: 'Aung Khant', init: 'AK', col: '#38bdf8', email: 'aung@codexamm.com', role: 'Finance' },
    { id: 4, name: 'Su Myat Noe', init: 'SM', col: '#22c55e', email: 'sumyat@codexamm.com', role: 'Support' },
];

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

function rolePill(role: string) {
    if (role === 'Super Admin') return <Pill tone="violet">Super Admin</Pill>;
    if (role === 'Admin') return <Pill tone="blue">Admin</Pill>;
    if (role === 'Finance') return <Pill tone="teal">Finance</Pill>;
    return <Pill tone="amber">Support</Pill>;
}

export default function Index({ staff }: { staff?: StaffRow[] }) {
    // SAMPLE DATA fallback (prototype): roles/permissions are managed by
    // Spatie roles; no staff invite endpoint exists yet.
    const [items, setItems] = useState<StaffRow[]>(staff ?? SAMPLE_STAFF);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<(typeof ROLES)[number]>('Support');
    const [notice, setNotice] = useState('');

    const invite = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        const init = name
            .trim()
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        setItems([...items, { id: Date.now(), name: name.trim(), init, col: '#6366f1', email: email.trim(), role }]);
        setName('');
        setEmail('');
        setNotice(`${name.trim()} ထံ ဖိတ်ခေါ်စာ ပို့ပြီးပါပြီ (ဤ page မှာသာ — invite endpoint မရှိသေးပါ)`);
    };

    const changeRole = (id: number, newRole: (typeof ROLES)[number]) => {
        setItems(items.map((s) => (s.id === id ? { ...s, role: newRole } : s)));
        setNotice('Role ပြောင်းပြီးပါပြီ (ဤ page မှာသာ)');
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
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
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
            </LmsCard>

            <SectionCard title="အဖွဲ့ဝင်များ">
                <div className="space-y-3">
                    {items.map((s) => (
                        <div key={s.id} className="flex flex-wrap items-center gap-3.5 rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                            <Avatar init={s.init} color={s.col} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    {rolePill(s.role)}
                                </div>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>{s.email}</p>
                            </div>
                            <select
                                className={`${inputCls} w-40`}
                                value={s.role}
                                onChange={(e) => changeRole(s.id, e.target.value as (typeof ROLES)[number])}
                            >
                                {ROLES.map((r) => (
                                    <option key={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    ))}
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

import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type PermissionRow = {
    id: number;
    name: string;
};

type RoleRow = {
    id: number;
    name: string;
    permissions: string[];
};

type Props = {
    groups: Record<string, PermissionRow[]>;
    roles: RoleRow[];
};

const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin',
    'super-admin': 'Super Admin',
    instructor: 'ဆရာ',
    student: 'ကျောင်းသား',
    client: 'Client',
    support: 'Support',
    finance: 'Finance',
};

const GROUP_LABEL: Record<string, string> = {
    admin: 'Admin',
    users: 'အသုံးပြုသူများ',
    roles: 'Role များ',
    courses: 'သင်တန်းများ',
    enrollments: 'Enrollments',
    assignments: 'Assignments',
    grades: 'အမှတ်များ',
    projects: 'Projects',
    quotations: 'Quotations',
    invoices: 'Invoices',
    content: 'Content',
    reports: 'Reports',
    settings: 'Settings',
    tickets: 'Support Tickets',
    other: 'အခြား',
};

export default function Index({ groups, roles }: Props) {
    const [selectedId, setSelectedId] = useState<number>(roles[0]?.id ?? 0);
    const selected = roles.find((role) => role.id === selectedId) ?? roles[0];
    const { data, setData, post, processing, errors } = useForm<{ permissions: string[] }>({
        permissions: selected?.permissions ?? [],
    });

    const selectRole = (role: RoleRow) => {
        setSelectedId(role.id);
        setData('permissions', [...role.permissions]);
    };

    const toggle = (name: string) => {
        setData(
            'permissions',
            data.permissions.includes(name) ? data.permissions.filter((p) => p !== name) : [...data.permissions, name],
        );
    };

    const save = () => {
        if (!selected) return;
        post(`/admin/roles/${selected.id}/permissions`);
    };

    const dirty =
        selected !== undefined &&
        (data.permissions.length !== selected.permissions.length ||
            data.permissions.some((p) => !selected.permissions.includes(p)));

    return (
        <LmsShell title="Permission များ" nav="admin">
            <Head title="Permission များ" />
            <PageIntro
                eyebrow="ADMIN"
                title="Permission များ"
                description="Role တစ်တစ်ခုချင်းစီအတွက် လုပ်ပိုင်ခွင့်များကို စီမံပါ"
                actions={
                    <Link href="/admin/roles" className={btnGhostCls}>
                        <ShieldCheck className="size-4" /> Role များ
                    </Link>
                }
            />

            <div className="mt-6 flex flex-wrap gap-2">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => selectRole(role)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${
                            role.id === selected?.id
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-[#12234a] dark:text-slate-300'
                        }`}
                    >
                        {ROLE_LABEL[role.name] ?? role.name}
                    </button>
                ))}
            </div>

            {selected === undefined ? (
                <p className={`mt-6 text-sm ${mutedCls}`}>Role မရှိသေးပါ။</p>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {Object.entries(groups).map(([group, permissions]) => (
                            <LmsCard key={group} className="p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                                        <KeyRound className="size-5" />
                                    </span>
                                    <div>
                                        <h2 className={`text-[1.02rem] font-extrabold ${inkCls}`}>{GROUP_LABEL[group] ?? group}</h2>
                                        <p className={`text-[.8rem] ${mutedCls}`}>{permissions.length} ခု</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {permissions.map((permission) => (
                                        <label key={permission.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={data.permissions.includes(permission.name)}
                                                onChange={() => toggle(permission.name)}
                                                className="size-4 accent-teal-600"
                                            />
                                            <span className={`font-mono text-[.82rem] ${inkCls}`}>{permission.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </LmsCard>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={save} disabled={processing || !dirty} className={btnAccentCls}>
                            {processing ? 'သိမ်းဆည်းနေသည်…' : 'သိမ်းဆည်းမည်'}
                        </button>
                        {dirty && <Pill tone="amber">အပြောင်းအလဲ မသိမ်းရသေးပါ</Pill>}
                        {errors.permissions && <p className="text-sm font-bold text-red-600">{errors.permissions}</p>}
                    </div>
                </>
            )}
        </LmsShell>
    );
}

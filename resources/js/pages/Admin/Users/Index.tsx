import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Search, ShieldCheck, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate, formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type UserRow = {
    id: number;
    name: string;
    email: string;
    status: string;
    roles: string[];
    init: string;
    col: string;
    created_at: string | null;
    verified: boolean;
};

type PaginatedUsers = {
    data: UserRow[];
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    users: PaginatedUsers;
    roles: string[];
    filters: { search: string; role: string };
    flash?: { success?: string | null };
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

const ROLE_TONE: Record<string, 'teal' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate'> = {
    admin: 'rose',
    'super-admin': 'rose',
    instructor: 'blue',
    student: 'teal',
    client: 'violet',
    support: 'amber',
    finance: 'slate',
};

function RoleEditor({ user, allRoles }: { user: UserRow; allRoles: string[] }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<{ roles: string[] }>({ roles: user.roles });

    const toggle = (role: string) => {
        setData('roles', data.roles.includes(role) ? data.roles.filter((r) => r !== role) : [...data.roles, role]);
    };

    const save = () => {
        post(`/admin/users/${user.id}/roles`, {
            onSuccess: () => setOpen(false),
        });
    };

    if (!open) {
        return (
            <button type="button" className={btnGhostCls} onClick={() => setOpen(true)}>
                <ShieldCheck className="size-4" /> Role ပြင်ရန်
            </button>
        );
    }

    return (
        <div className="w-full rounded-xl border border-slate-200 p-3 dark:border-[#1e2c52]">
            <div className="flex flex-wrap gap-2">
                {allRoles.map((role) => (
                    <label key={role} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-[#1e2c52]">
                        <input type="checkbox" checked={data.roles.includes(role)} onChange={() => toggle(role)} className="accent-teal-600" />
                        {ROLE_LABEL[role] ?? role}
                    </label>
                ))}
            </div>
            {errors.roles && <p className="mt-2 text-xs text-rose-600">{errors.roles}</p>}
            <div className="mt-3 flex gap-2">
                <button type="button" className={btnAccentCls} onClick={save} disabled={processing || data.roles.length === 0}>
                    သိမ်းဆည်းရန်
                </button>
                <button
                    type="button"
                    className={btnGhostCls}
                    onClick={() => {
                        reset();
                        setOpen(false);
                    }}
                >
                    ပိတ်ရန်
                </button>
            </div>
        </div>
    );
}

export default function Index({ users, roles, filters }: Props) {
    const { flash } = usePage<Props>().props;
    const [query, setQuery] = useState(filters.search);

    const applyFilters = (search: string, role: string) => {
        router.get('/admin/users', { search, role }, { preserveState: true, replace: true });
    };

    return (
        <LmsShell title="အသုံးပြုသူ စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="အသုံးပြုသူ စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="အသုံးပြုသူ စီမံခန့်ခွဲမှု"
                description={`အသုံးပြုသူ ${formatNumber(users.total)} ဦးရဲ့ အကောင့်နဲ့ role များကို ကြည့်ရှု ပြင်ဆင်ရန်`}
                actions={
                    <Link href="/admin/roles" className={btnGhostCls}>
                        <ShieldCheck className="size-4" /> Role များ ကြည့်ရန်
                    </Link>
                }
            />

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    <Chip active={filters.role === 'all'} onClick={() => applyFilters(query, 'all')}>
                        အားလုံး
                    </Chip>
                    {roles.map((role) => (
                        <Chip key={role} active={filters.role === role} onClick={() => applyFilters(query, role)}>
                            {ROLE_LABEL[role] ?? role}
                        </Chip>
                    ))}
                </div>
                <form
                    className="relative ml-auto w-full sm:w-64"
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters(query, filters.role);
                    }}
                >
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="အမည် သို့မဟုတ် အီးမေးလ် ရှာရန်…"
                        className={`${inputCls} pl-9`}
                    />
                </form>
            </div>

            {users.data.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="အသုံးပြုသူ မတွေ့ပါ" description="ရှာဖွေမှု သို့မဟုတ် role စစ်ထုတ်မှုနဲ့ ကိုက်ညီသူ မရှိပါ" />
                </div>
            ) : (
                <LmsCard className="mt-6 divide-y divide-slate-200 dark:divide-[#1e2c52]">
                    {users.data.map((user) => (
                        <div key={user.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                            <Avatar init={user.init} color={user.col} size="lg" />
                            <div className="min-w-0 flex-1 basis-[220px]">
                                <p className={`truncate text-[.95rem] font-extrabold ${inkCls}`}>{user.name}</p>
                                <p className={`mt-0.5 truncate text-[.8rem] ${mutedCls}`}>{user.email}</p>
                                <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                    {user.verified ? 'အတည်ပြုပြီး' : 'အတည်ပြုမထားပါ'} · {user.status} · {formatDate(user.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {user.roles.map((role) => (
                                    <Pill key={role} tone={ROLE_TONE[role] ?? 'slate'}>
                                        {ROLE_LABEL[role] ?? role}
                                    </Pill>
                                ))}
                            </div>
                            <RoleEditor user={user} allRoles={roles} />
                        </div>
                    ))}
                </LmsCard>
            )}

            {users.last_page > 1 && (
                <div className="mt-5 flex items-center justify-between">
                    <p className={`text-sm font-semibold ${mutedCls}`}>
                        စာမျက်နှာ {users.current_page} / {users.last_page}
                    </p>
                    <div className="flex gap-2">
                        {users.prev_page_url ? (
                            <Link href={users.prev_page_url} className={btnGhostCls}>
                                ← ရှေ့သို့
                            </Link>
                        ) : null}
                        {users.next_page_url ? (
                            <Link href={users.next_page_url} className={btnGhostCls}>
                                နောက်သို့ →
                            </Link>
                        ) : null}
                    </div>
                </div>
            )}

            <p className={`mt-6 flex items-center gap-2 text-[.8rem] ${mutedCls}`}>
                <Users className="size-4" /> Staff အကောင့် အသစ် ဖိတ်ခေါ်ရန် — Admin/Academy/Staff စာမျက်နှာကို သုံးပါ။
            </p>
        </LmsShell>
    );
}

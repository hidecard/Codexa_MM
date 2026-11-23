import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatKyat } from '@/lib/format';
import { Download, Receipt } from 'lucide-react';

type Payment = {
    id: number | string;
    order_id?: string | null;
    title?: string | null;
    course_slug?: string | null;
    amount: number;
    method?: string | null;
    status?: string | null;
    paid_at?: string | null;
    date?: string | null;
};

type Props = { payments: Payment[] };

function statusBadge(status?: string | null) {
    if (status === 'approved' || status === 'paid' || status === 'completed' || status === 'success') {
        return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">ပေးချေပြီး</span>;
    }
    if (status === 'pending') {
        return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">စောင့်နေဆဲ</span>;
    }
    if (status === 'refunded') {
        return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ငွေပြန်အမ်းပြီး</span>;
    }
    if (status === 'rejected') {
        return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ပယ်ချပြီး</span>;
    }
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{status ?? '—'}</span>;
}

const isPaid = (status?: string | null) => status === 'approved' || status === 'paid' || status === 'completed' || status === 'success';

export default function Index({ payments }: Props) {
    const list = payments;
    const total = list.filter((p) => isPaid(p.status)).reduce((s, p) => s + Number(p.amount), 0);

    return (
        <LmsShell title="ငွေပေးချေမှု မှတ်တမ်း" nav="student">
            <Head title="Payments" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ငွေပေးချေမှု မှတ်တမ်း</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဝယ်ယူခဲ့တဲ့ သင်တန်းတိုင်းရဲ့ ပြေစာနဲ့ ငွေပေးချေမှု အခြေအနေ</p>
                </div>
                <Link href="/student/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">ဝယ်ယူမှု မှတ်တမ်း</Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
                <StatCard label="ဝယ်ယူမှု စုစုပေါင်း" value={list.length} tone="teal" />
                <StatCard label="သုံးစွဲငွေ စုစုပေါင်း" value={formatKyat(total)} tone="blue" />
                <StatCard label="ပေးချေပြီး" value={list.filter((p) => isPaid(p.status)).length} tone="green" />
            </div>

            {list.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Receipt className="size-10" />}
                    title="ငွေပေးချေမှု မှတ်တမ်း မရှိသေးပါ"
                    description="ပထမဆုံး သင်တန်း ဝယ်ယူပြီးတာနဲ့ ဒီမှာ ပေါ်လာပါမယ်။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="hidden grid-cols-[1fr_140px_120px_130px_120px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid dark:border-slate-800 dark:text-slate-400">
                        <span>သင်တန်း</span><span>နည်းလမ်း</span><span>ရက်စွဲ</span><span>ငွေပမာဏ</span><span className="text-right">အခြေအနေ / ပြေစာ</span>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {list.map((p) => (
                            <li key={p.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_140px_120px_130px_120px] md:items-center md:gap-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white">{p.title ?? 'သင်တန်း'}</p>
                                    {p.order_id && <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{p.order_id}</p>}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300">{p.method ?? '—'}</span>
                                <span className="text-sm text-slate-600 dark:text-slate-300">{p.date ?? p.paid_at ?? '—'}</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{formatKyat(Number(p.amount))}</span>
                                <span className="flex items-center gap-2 md:justify-end">
                                    {statusBadge(p.status)}
                                    <button
                                        onClick={() => window.print()}
                                        title="ပြေစာ ဒေါင်းလုဒ်ရန်"
                                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        <Download className="size-4" />
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </LmsShell>
    );
}

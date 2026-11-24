import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatKyat } from '@/lib/format';
import { Download, Package } from 'lucide-react';

type Order = { id: string; orderId: number; courseId?: number | null; title: string; items?: string[]; amount: number; method: string; date?: string | null; status: 'pending' | 'paid' | 'cancelled' | string };
type Props = { orders?: Order[] };

function statusBadge(status: string) {
    if (status === 'paid') return <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">ပေးချေပြီး</span>;
    if (status === 'cancelled') return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ပယ်ဖျက်ပြီး</span>;
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">အတည်ပြုရန် စောင့်နေဆဲ</span>;
}

export default function Index({ orders = [] }: Props) {
    const total = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0);

    return (
        <LmsShell title="ဝယ်ယူမှု မှတ်တမ်း" nav="student">
            <Head title="Orders" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ဝယ်ယူမှု မှတ်တမ်း</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဝယ်ယူခဲ့တဲ့ သင်တန်းတိုင်းရဲ့ ပြေစာနဲ့ ငွေပေးချေမှု အခြေအနေကို ဒီမှာ ပြန်ကြည့်နိုင်ပါတယ်</p>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Download className="size-4" /> မှတ်တမ်း အားလုံး ဒေါင်းလုဒ်ရန်
                </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
                <StatCard label="ဝယ်ယူမှု စုစုပေါင်း" value={orders.length} tone="teal" />
                <StatCard label="သုံးစွဲငွေ စုစုပေါင်း" value={formatKyat(total)} tone="blue" />
                <StatCard label="အတည်ပြုရန် စောင့်နေဆဲ" value={orders.filter((o) => o.status === 'pending').length} tone="amber" />
            </div>

            {orders.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Package className="size-10" />}
                    title="ဝယ်ယူမှု မှတ်တမ်း မရှိသေးပါ"
                    description="ပထမဆုံး သင်တန်း ဝယ်ယူပြီးတာနဲ့ ဒီမှာ ပေါ်လာပါမယ်။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {orders.map((o) => (
                        <article key={o.orderId} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-slate-950 font-mono text-lg font-bold text-white dark:bg-slate-800">
                                {o.title.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-extrabold leading-snug text-slate-900 dark:text-white">{o.title}</h2>
                                    {statusBadge(o.status)}
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.id} · {formatDate(o.date)} · {o.method}</p>
                                {o.items && o.items.length > 1 && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.items.join(' · ')}</p>
                                )}
                            </div>
                            <span className="shrink-0 font-extrabold text-slate-900 dark:text-white">{formatKyat(o.amount)}</span>
                            <div className="flex shrink-0 gap-2">
                                {o.courseId && o.status === 'paid' && <Link href={`/student/courses/${o.courseId}/learn`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">သင်တန်း ဖွင့်ရန်</Link>}
                                {o.status === 'paid' && <Link href="/student/refunds" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ငွေပြန်အမ်းရန်</Link>}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

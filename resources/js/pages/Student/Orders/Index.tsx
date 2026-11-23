import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatKyat } from '@/lib/format';
import { Download, Package } from 'lucide-react';

type Order = { id: string; courseId?: number; title: string; amount: number; method: string; date: string; status: 'paid' | 'refunded' | string };
type Props = { orders?: Order[] };

/* SAMPLE DATA — fallback only; no Order model exists yet (from prototype). */
const SAMPLE_ORDERS: Order[] = [
    { id: 'ORD-2026-0307', courseId: 7, title: 'UI/UX Design with Figma', amount: 40000, method: 'KBZPay', date: 'အောက်တိုဘာ 02', status: 'paid' },
    { id: 'ORD-2026-0289', courseId: 10, title: 'Git, GitHub & Team Workflow', amount: 25000, method: 'WavePay', date: 'စက်တင်ဘာ 28', status: 'paid' },
    { id: 'ORD-2026-0264', courseId: 3, title: 'Python for Beginners', amount: 45000, method: 'KBZPay', date: 'စက်တင်ဘာ 15', status: 'paid' },
    { id: 'ORD-2026-0241', courseId: 2, title: 'JavaScript Deep Dive', amount: 75000, method: 'Bank Transfer', date: 'စက်တင်ဘာ 03', status: 'paid' },
    { id: 'ORD-2026-0218', courseId: 1, title: 'HTML & CSS Foundations', amount: 45000, method: 'KBZPay', date: 'ဩဂုတ် 21', status: 'paid' },
];

export default function Index({ orders }: Props) {
    const list = orders && orders.length > 0 ? orders : SAMPLE_ORDERS;
    const total = list.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0);

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
                <StatCard label="ဝယ်ယူမှု စုစုပေါင်း" value={list.length} tone="teal" />
                <StatCard label="သုံးစွဲငွေ စုစုပေါင်း" value={formatKyat(total)} tone="blue" />
                <StatCard label="ငွေပြန်အမ်းပြီး" value={list.filter((o) => o.status === 'refunded').length} tone="rose" />
            </div>

            {list.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Package className="size-10" />}
                    title="ဝယ်ယူမှု မှတ်တမ်း မရှိသေးပါ"
                    description="ပထမဆုံး သင်တန်း ဝယ်ယူပြီးတာနဲ့ ဒီမှာ ပေါ်လာပါမယ်။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {list.map((o) => (
                        <article key={o.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-slate-950 font-mono text-lg font-bold text-white dark:bg-slate-800">
                                {o.title.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-extrabold leading-snug text-slate-900 dark:text-white">{o.title}</h2>
                                    {o.status === 'refunded' ? (
                                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">ငွေပြန်အမ်းပြီး</span>
                                    ) : (
                                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">ပေးချေပြီး</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.id} · {o.date} · {o.method}</p>
                            </div>
                            <span className="shrink-0 font-extrabold text-slate-900 dark:text-white">{formatKyat(o.amount)}</span>
                            <div className="flex shrink-0 gap-2">
                                {o.courseId && <Link href={`/student/courses/${o.courseId}/learn`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">သင်တန်း ဖွင့်ရန်</Link>}
                                <Link href="/student/refunds" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ငွေပြန်အမ်းရန်</Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

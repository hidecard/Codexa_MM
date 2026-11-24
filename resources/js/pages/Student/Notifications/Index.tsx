import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell, CheckCheck } from 'lucide-react';

type Notification = { id: number; title: string; message: string; type?: string | null; is_read: boolean; created_at?: string | null };
type Paginator = { data: Notification[]; links?: { url: string | null; label: string; active: boolean }[]; next_page_url?: string | null; prev_page_url?: string | null };

type Props = { notifications?: Paginator | Notification[] };

function typeLabel(type?: string | null) {
    switch (type) {
        case 'live': return 'Live Class';
        case 'assignment': return 'Assignment';
        case 'certificate': return 'လက်မှတ်';
        case 'community': return 'Community';
        case 'payment': return 'ငွေပေးချေမှု';
        case 'course': return 'သင်တန်း';
        default: return type ?? 'အသိပေးချက်';
    }
}

export default function Index({ notifications }: Props) {
    const items = Array.isArray(notifications) ? notifications : (notifications?.data ?? []);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const unread = items.some((n) => !n.is_read);
    const shown = filter === 'unread' ? items.filter((n) => !n.is_read) : items;
    const markAll = () => router.post('/student/notifications/read-all', {}, { preserveScroll: true });
    const markOne = (id: number) => router.post(`/student/notifications/${id}/read`, {}, { preserveScroll: true });

    return (
        <LmsShell title="အသိပေးချက်များ" nav="student">
            <Head title="Notifications" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">အသိပေးချက်များ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live class, assignment, လက်မှတ်နဲ့ community အကြောင်းကြားချက်များ အားလုံး</p>
                </div>
                {unread && (
                    <button type="button" onClick={markAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        <CheckCheck className="size-4" /> အားလုံး ဖတ်ပြီးကြောင်း မှတ်ရန်
                    </button>
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'အားလုံး' },
                    { key: 'unread', label: 'မဖတ်ရသေးသော' },
                ] as { key: 'all' | 'unread'; label: string }[]).map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f.key ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Bell className="size-10" />}
                    title={filter === 'unread' ? 'မဖတ်ရသေတဲ့ အသိပေးချက် မရှိပါ' : 'အသိပေးချက် မရှိသေးပါ'}
                    description="အသိပေးချက် အသစ်ရှိရင် ဒီနေရာမှာ ပေါ်လာပါမယ်။"
                />
            ) : (
                <ul className="mt-6 space-y-3">
                    {shown.map((n) => (
                        <li key={n.id} className={`rounded-2xl border p-4 ${n.is_read ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' : 'border-teal-200 bg-teal-50/60 dark:border-teal-800 dark:bg-teal-900/10'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${n.is_read ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300'}`}><Bell className="size-5" /></span>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                                        <p className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold dark:bg-slate-800">{typeLabel(n.type)}</span>
                                            {n.created_at && <span>{n.created_at}</span>}
                                        </p>
                                    </div>
                                </div>
                                {!n.is_read && <button type="button" onClick={() => markOne(n.id)} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">ဖတ်ပြီးကြောင်း မှတ်ရန်</button>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </LmsShell>
    );
}

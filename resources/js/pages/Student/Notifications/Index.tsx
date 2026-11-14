import { Head, router } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Bell, CheckCheck } from 'lucide-react';

type Notification = { id: number; title: string; message: string; type: string; is_read: boolean; created_at?: string | null };
type Paginator = { data: Notification[]; links?: { url: string | null; label: string; active: boolean }[]; next_page_url?: string | null; prev_page_url?: string | null };

const nav = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'My courses', href: '/student/my-courses' },
    { label: 'Notifications', href: '/student/notifications' },
];

export default function Index({ notifications }: { notifications: Paginator }) {
    const items = notifications?.data ?? [];
    const unread = items.some((n) => !n.is_read);
    const markAll = () => router.post('/student/notifications/read-all', {}, { preserveScroll: true });
    const markOne = (id: number) => router.post(`/student/notifications/${id}/read`, {}, { preserveScroll: true });
    return (
        <AppShell navItems={nav}>
            <Head title="Notifications" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Student</p>
                    <h1 className="mt-1 text-3xl font-black text-slate-950">Notifications</h1>
                    <p className="mt-1 text-slate-600">Updates about your courses and activity.</p>
                </div>
                {unread && <button type="button" onClick={markAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><CheckCheck className="size-4" /> Mark all read</button>}
            </div>

            {items.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Bell className="mx-auto size-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No notifications yet.</p>
                    <p className="mt-1 text-sm text-slate-500">Notifications about your learning will appear here.</p>
                </div>
            ) : (
                <ul className="mt-8 space-y-3">
                    {items.map((n) => (
                        <li key={n.id} className={`rounded-2xl border p-4 ${n.is_read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/50'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{n.title}</p>
                                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                                    {n.created_at && <p className="mt-2 text-xs text-slate-500">{n.created_at}</p>}
                                </div>
                                {!n.is_read && <button type="button" onClick={() => markOne(n.id)} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Mark read</button>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </AppShell>
    );
}

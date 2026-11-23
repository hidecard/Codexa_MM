import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Eye, LifeBuoy, Send, X } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type TicketRow = { id: number; subject: string; student: string; init: string; col: string; message: string; date: string; status: 'open' | 'in_progress' | 'resolved'; priority: 'low' | 'medium' | 'high' };
type TicketMessage = { id: number; author: string; is_admin: boolean; is_internal: boolean; message: string; date: string };
type SelectedTicket = Omit<TicketRow, 'message'> & { messages: TicketMessage[] };

function statusPill(status: string) {
    if (status === 'open') return <Pill tone="rose">Open</Pill>;
    if (status === 'in_progress') return <Pill tone="amber">လုပ်ဆောင်ဆဲ</Pill>;
    return <Pill tone="teal">ဖြေရှင်းပြီး</Pill>;
}

function priorityPill(priority: string) {
    if (priority === 'high') return <Pill tone="rose">အရေးကြီး</Pill>;
    if (priority === 'medium') return <Pill tone="amber">အလယ်အလတ်</Pill>;
    return <Pill tone="slate">သာမန်</Pill>;
}

export default function Index({ tickets = [], selectedTicket = null }: { tickets?: TicketRow[]; selectedTicket?: SelectedTicket | null }) {
    const [tab, setTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [reply, setReply] = useState<Record<number, string>>({});
    const [internal, setInternal] = useState(false);
    const [notice, setNotice] = useState('');

    const list = tickets.filter((t) => tab === 'all' || t.status === tab);

    const setStatus = (id: number, status: string, done: string) => {
        router.post(`/admin/academy/tickets/${id}/status`, { status }, { preserveScroll: true, onSuccess: () => setNotice(done) });
    };

    const sendReply = (id: number, isInternal = false) => {
        if (!(reply[id] ?? '').trim()) return;
        router.post(
            `/admin/academy/tickets/${id}/reply`,
            { message: reply[id].trim(), is_internal: isInternal },
            { preserveScroll: true, onSuccess: () => { setReply({ ...reply, [id]: '' }); setInternal(false); setNotice('အကြောင်းပြန်ချက် ပို့ပြီးပါပြီ'); } },
        );
    };

    return (
        <LmsShell title="Support Tickets" nav="admin">
            <Head title="Support Tickets" />
            <PageIntro
                eyebrow="ADMIN"
                title="Support Tickets"
                description="ကျောင်းသားတွေ Help page ကနေ တင်တဲ့ ticket များကို ဖြေကြား၊ အခြေအနေ စီမံရန်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            {selectedTicket && (
                <LmsCard className="mt-6 p-5">
                    <div className="flex flex-wrap items-start gap-3.5">
                        <Avatar init={selectedTicket.init} color={selectedTicket.col} />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <LifeBuoy className="size-4 text-teal-700 dark:text-teal-300" />
                                <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{selectedTicket.subject}</p>
                                {statusPill(selectedTicket.status)}
                                {priorityPill(selectedTicket.priority)}
                            </div>
                            <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                {selectedTicket.student} · {selectedTicket.date}
                            </p>
                        </div>
                        <button type="button" className={btnGhostCls} onClick={() => router.get('/admin/academy/tickets')}>
                            <X className="size-4" /> ပိတ်ရန်
                        </button>
                    </div>
                    <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 dark:border-[#1e2c52]">
                        {selectedTicket.messages.length === 0 ? (
                            <p className={`text-sm ${mutedCls}`}>မက်ဆေ့ချ် မရှိသေးပါ။</p>
                        ) : (
                            selectedTicket.messages.map((m) => (
                                <div key={m.id} className={cn('rounded-xl px-3.5 py-3 text-sm', m.is_admin ? 'bg-teal-600/10' : 'bg-slate-100 dark:bg-[#0d1730]')}>
                                    <p className={`text-[.78rem] font-bold ${inkCls}`}>
                                        {m.author} {m.is_admin && '· Admin'} · {m.date}
                                        {m.is_internal && <span className="ml-2 text-amber-600">အတွင်းမှတ်စု (ကျောင်းသား မမြင်ရပါ)</span>}
                                    </p>
                                    <p className={`mt-1 leading-relaxed ${mutedCls}`}>{m.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <input
                            className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                            placeholder="အကြောင်းပြန်ရန်…"
                            value={reply[selectedTicket.id] ?? ''}
                            onChange={(e) => setReply({ ...reply, [selectedTicket.id]: e.target.value })}
                        />
                        <button type="button" className={btnAccentCls} onClick={() => sendReply(selectedTicket.id, internal)}>
                            <Send className="size-4" /> ပို့ရန်
                        </button>
                        <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="size-4 accent-teal-700" />
                            အတွင်းမှတ်စု အဖြစ်
                        </label>
                        {selectedTicket.status !== 'resolved' && (
                            <button type="button" className={btnGhostCls} onClick={() => setStatus(selectedTicket.id, 'resolved', 'Ticket ကို ဖြေရှင်းပြီးအဖြစ် မှတ်ပြီးပါပြီ')}>
                                ဖြေရှင်းပြီး မှတ်ရန်
                            </button>
                        )}
                    </div>
                </LmsCard>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'open'} onClick={() => setTab('open')}>
                    Open
                </Chip>
                <Chip active={tab === 'in_progress'} onClick={() => setTab('in_progress')}>
                    လုပ်ဆောင်ဆဲ
                </Chip>
                <Chip active={tab === 'resolved'} onClick={() => setTab('resolved')}>
                    ဖြေရှင်းပြီး
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အခြေအနေမှာ ticket မရှိပါ" description="Ticket အသစ် ဝင်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((t) => (
                        <LmsCard key={t.id} className="p-5">
                            <div className="flex flex-wrap items-start gap-3.5">
                                <Avatar init={t.init} color={t.col} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <LifeBuoy className="size-4 text-teal-700 dark:text-teal-300" />
                                        <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{t.subject}</p>
                                        {statusPill(t.status)}
                                        {priorityPill(t.priority)}
                                    </div>
                                    <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                        {t.student} · {t.date}
                                    </p>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{t.message}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button type="button" className={btnGhostCls} onClick={() => router.get(`/admin/academy/tickets/${t.id}`, {}, { preserveScroll: true })}>
                                            <Eye className="size-4" /> ကြည့်ရန်
                                        </button>
                                        {t.status !== 'resolved' && (
                                            <>
                                                <input
                                                    className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                    placeholder="အကြောင်းပြန်ရန်…"
                                                    value={reply[t.id] ?? ''}
                                                    onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })}
                                                />
                                                <button type="button" className={btnAccentCls} onClick={() => sendReply(t.id)}>
                                                    <Send className="size-4" /> ပို့ရန်
                                                </button>
                                                <button type="button" className={btnGhostCls} onClick={() => setStatus(t.id, 'resolved', 'Ticket ကို ဖြေရှင်းပြီးအဖြစ် မှတ်ပြီးပါပြီ')}>
                                                    ဖြေရှင်းပြီး မှတ်ရန်
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

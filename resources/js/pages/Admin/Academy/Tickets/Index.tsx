import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LifeBuoy, Send } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type TicketRow = { id: number; subject: string; student: string; init: string; col: string; message: string; date: string; status: 'open' | 'in_progress' | 'resolved'; priority: 'low' | 'medium' | 'high' };

// SAMPLE DATA fallback (prototype): SupportTicket model exists (client-linked)
// but no admin ticket controller is wired yet.
const SAMPLE_TICKETS: TicketRow[] = [
    { id: 1, subject: 'Video ဖွင့်မရပါ — React သင်တန်း', student: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', message: 'React.js Complete Course ရဲ့ အခန်း ၃ video တွေ ဖုန်းမှာ ဖွင့်မရပါ။ WiFi ကောင်းပါတယ်။', date: 'ယနေ့ · မနက် 9:12', status: 'open', priority: 'high' },
    { id: 2, subject: 'KBZPay ပေးချေပြီး သင်တန်း မပေါ်ပါ', student: 'Ei Mon Kyaw', init: 'EM', col: '#f43f5e', message: 'Flutter သင်တန်း ဝယ်ပြီး ငွေ ဖြတ်သွားပေမယ့် My Learning မှာ မပေါ်သေးပါ။ TXN-8839 ပါ။', date: 'မနေ့က · ည 8:40', status: 'in_progress', priority: 'high' },
    { id: 3, subject: 'Certificate ဒေါင်းလုဒ် လုပ်မရပါ', student: 'Su Su Win', init: 'SW', col: '#22c55e', message: 'HTML & CSS သင်တန်း ပြီးပြီး လက်မှတ် ဒေါင်းလုဒ် လုပ်တာ error တက်ပါတယ်။', date: 'နိုဝင်ဘာ 20', status: 'open', priority: 'medium' },
    { id: 4, subject: 'Pro Plan သက်တမ်း မေးမြန်းခြင်း', student: 'Nanda Win', init: 'NW', col: '#14b8a6', message: 'Pro Plan သက်တမ်း ကုန်ရင် သင်တန်းတွေ ဆက်ကြည့်လို့ ရပါသလား သိချင်ပါတယ်။', date: 'နိုဝင်ဘာ 18', status: 'resolved', priority: 'low' },
];

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

export default function Index({ tickets }: { tickets?: TicketRow[] }) {
    const [items, setItems] = useState<TicketRow[]>(tickets ?? SAMPLE_TICKETS);
    const [tab, setTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [reply, setReply] = useState<Record<number, string>>({});
    const [notice, setNotice] = useState('');

    const list = items.filter((t) => tab === 'all' || t.status === tab);

    const setStatus = (id: number, status: TicketRow['status']) => {
        setItems(items.map((t) => (t.id === id ? { ...t, status } : t)));
    };

    const sendReply = (id: number) => {
        if (!(reply[id] ?? '').trim()) return;
        setItems(items.map((t) => (t.id === id ? { ...t, status: 'in_progress' as const } : t)));
        setReply({ ...reply, [id]: '' });
        setNotice('အကြောင်းပြန်ချက် ပို့ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
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
                                    {t.status !== 'resolved' && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <input
                                                className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                placeholder="အကြောင်းပြန်ရန်…"
                                                value={reply[t.id] ?? ''}
                                                onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })}
                                            />
                                            <button type="button" className={btnAccentCls} onClick={() => sendReply(t.id)}>
                                                <Send className="size-4" /> ပို့ရန်
                                            </button>
                                            <button type="button" className={btnGhostCls} onClick={() => setStatus(t.id, 'resolved')}>
                                                ဖြေရှင်းပြီး မှတ်ရန်
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

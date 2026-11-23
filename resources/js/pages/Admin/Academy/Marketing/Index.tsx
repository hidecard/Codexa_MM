import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CalendarClock, Mail, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Campaign = {
    id: number;
    name: string;
    subject: string;
    body: string;
    audience: string;
    audience_label: string;
    status: 'draft' | 'scheduled' | 'sent';
    scheduled_at: string | null;
    sent_at: string | null;
    sent: number;
    when: string;
};

type Props = {
    campaigns?: Campaign[];
    audiences?: Record<string, string>;
    mailConfigured?: boolean;
};

export default function Index({ campaigns = [], audiences = {}, mailConfigured = false }: Props) {
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [scheduleFor, setScheduleFor] = useState<number | null>(null);
    const [scheduleAt, setScheduleAt] = useState('');

    const form = useForm({ name: '', subject: '', audience: 'all', body: '' });

    const totalSent = campaigns.filter((c) => c.status === 'sent').reduce((s, c) => s + c.sent, 0);

    const startEdit = (c: Campaign) => {
        setEditingId(c.id);
        form.setData({ name: c.name, subject: c.subject, audience: c.audience, body: c.body });
        setNotice('');
        setError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setNotice(editingId ? 'Campaign ပြင်ဆင်ပြီးပါပြီ' : 'Campaign မူကြမ်း သိမ်းပြီးပါပြီ');
                setEditingId(null);
                form.reset();
            },
            onError: () => setError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အချက်အလက်များ စစ်ဆေးပါ'),
        };
        if (editingId) {
            form.put(`/admin/academy/marketing/campaigns/${editingId}`, opts);
        } else {
            form.post('/admin/academy/marketing/campaigns', opts);
        }
    };

    const sendNow = (c: Campaign) => {
        setError('');
        router.post(
            `/admin/academy/marketing/campaigns/${c.id}/send`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice(`Campaign "${c.subject}" ပို့ပြီးပါပြီ`),
                onError: (errs) => setError((errs.send as string) ?? 'Campaign ပို့ခြင်း မအောင်မြင်ပါ'),
            },
        );
    };

    const schedule = (c: Campaign) => {
        if (!scheduleAt) return;
        setError('');
        router.post(
            `/admin/academy/marketing/campaigns/${c.id}/schedule`,
            { scheduled_at: scheduleAt },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotice(`Campaign "${c.subject}" ပို့ရန် အချိန်သတ်မှတ်ပြီးပါပြီ`);
                    setScheduleFor(null);
                    setScheduleAt('');
                },
                onError: (errs) => setError((errs.scheduled_at as string) ?? 'အချိန်သတ်မှတ်ခြင်း မအောင်မြင်ပါ'),
            },
        );
    };

    const remove = (c: Campaign) => {
        router.delete(`/admin/academy/marketing/campaigns/${c.id}`, {
            preserveScroll: true,
            onSuccess: () => setNotice(`Campaign "${c.subject}" ဖျက်ပြီးပါပြီ`),
        });
    };

    return (
        <LmsShell title="Email Campaign စီမံရန်" nav="admin">
            <Head title="Email Campaign စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="Email Campaign စီမံရန်"
                description={`ကျောင်းသားတွေထံ အီးမေးလ် campaign များ ပို့ပြီး ရလဒ်ကို တိုင်းတာပါ — Campaign ${campaigns.length} ခု · ပို့ပြီး email ${formatNumber(totalSent)} စောင်`}
            />

            {!mailConfigured && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    Email ပို့ရန် mail server မပြင်ဆင်ထားသေးပါ (MAIL_MAILER ကို SMTP / SES / Mailgun အဖြစ် ပြင်ဆင်ရန် လိုပါတယ်)။ Campaign များကို မူကြမ်းအဖြစ် သိမ်းနိုင်ပြီး အချိန်သတ်မှတ်နိုင်ပါတယ် — mail ပြင်ဆင်ပြီးမှ ပို့နိုင်ပါမယ်။
                </div>
            )}

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}
            {error && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
                </div>
            )}

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <Plus className="size-5" /> {editingId ? 'Campaign ပြင်ဆင်ရန်' : 'Campaign အသစ်'}
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Campaign အမည် (မဖြည့်ပါက ခေါင်းစဉ်ကို သုံးပါမယ်)" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        <Input label="ခေါင်းစဉ် (Subject)" value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} required />
                    </div>
                    {form.errors.subject && <p className="-mt-1 text-xs font-semibold text-rose-600">{form.errors.subject}</p>}
                    <div>
                        <label className={labelCls}>လက်ခံမည့်သူများ</label>
                        <select className={inputCls} value={form.data.audience} onChange={(e) => form.setData('audience', e.target.value)}>
                            {Object.entries(audiences).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>အီးမေးလ် အကြောင်းအရာ</label>
                        <Textarea rows={4} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button type="submit" className={btnAccentCls} disabled={form.processing}>
                            {editingId ? 'ပြင်ဆင်မှု သိမ်းရန်' : 'မူကြမ်း သိမ်းရန်'}
                        </button>
                        {editingId && (
                            <button type="button" className={btnGhostCls} onClick={cancelEdit}>
                                ပြင်ဆင်မှု ပယ်ဖျက်ရန်
                            </button>
                        )}
                    </div>
                </form>
            </LmsCard>

            {campaigns.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Campaign မရှိသေးပါ" description="အပေါ်က form မှာ ပထမဆုံး campaign ဖန်တီးနိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {campaigns.map((c) => (
                        <LmsCard key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                <Mail className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{c.subject}</p>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {c.audience_label} · {c.when}
                                    {c.name !== c.subject ? ` · ${c.name}` : ''}
                                </p>
                                {c.status === 'sent' ? (
                                    <p className={`mt-1 text-[.8rem] font-semibold ${inkCls}`}>ပို့ပြီး {formatNumber(c.sent)} ဦး</p>
                                ) : c.status === 'scheduled' ? (
                                    <p className={`mt-1 text-[.8rem] font-semibold ${mutedCls}`}>ပို့ရန် အချိန်သတ်မှတ်ထားပါတယ်</p>
                                ) : (
                                    <p className={`mt-1 text-[.8rem] font-semibold ${mutedCls}`}>မပို့ရသေးပါ</p>
                                )}
                                {scheduleFor === c.id && (
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <input className={inputCls} type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                                        <button type="button" className={btnAccentCls} onClick={() => schedule(c)}>
                                            အချိန်သတ်မှတ်ရန်
                                        </button>
                                        <button type="button" className={btnGhostCls} onClick={() => setScheduleFor(null)}>
                                            ပယ်ဖျက်ရန်
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-none flex-wrap items-center gap-2">
                                {c.status === 'sent' ? (
                                    <Pill tone="teal">ပို့ပြီး</Pill>
                                ) : c.status === 'scheduled' ? (
                                    <>
                                        <Pill tone="amber">စီစဉ်ထား</Pill>
                                        <button type="button" className={btnAccentCls} onClick={() => sendNow(c)}>
                                            <Send className="size-4" /> အခု ပို့ရန်
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Pill tone="slate">မူကြမ်း</Pill>
                                        <button type="button" className={btnGhostCls} onClick={() => setScheduleFor(c.id)}>
                                            <CalendarClock className="size-4" /> အချိန်သတ်ရန်
                                        </button>
                                        <button type="button" className={btnAccentCls} onClick={() => sendNow(c)}>
                                            <Send className="size-4" /> အခု ပို့ရန်
                                        </button>
                                    </>
                                )}
                                {c.status !== 'sent' && (
                                    <button type="button" className={btnGhostCls} onClick={() => startEdit(c)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                )}
                                <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(c)} title="ဖျက်ရန်">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

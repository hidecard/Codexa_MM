import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { Mail, Plus, Send } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatNumber } from '@/lib/format';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Campaign = { id: number; subject: string; audience: string; status: 'sent' | 'draft'; sent: number; opened: number; clicked: number; when: string };

// SAMPLE DATA fallback (prototype): no campaign backend yet.
const SAMPLE_CAMPAIGNS: Campaign[] = [
    { id: 1, subject: 'နိုဝင်ဘာ လျှော့ဈေး — သင်တန်း အားလုံး 50% OFF', audience: 'ကျောင်းသား အားလုံး', status: 'sent', sent: 4820, opened: 2892, clicked: 964, when: 'နိုဝင်ဘာ 15' },
    { id: 2, subject: 'React သင်တန်း အသစ် ရောက်ပါပြီ', audience: 'အခမဲ့ အသင်းဝင်များ', status: 'sent', sent: 1960, opened: 1020, clicked: 388, when: 'နိုဝင်ဘာ 08' },
    { id: 3, subject: 'ဒီဇင်ဘာ Hackathon ဖိတ်ခေါ်စာ', audience: 'Pro အသင်းဝင်များ', status: 'draft', sent: 0, opened: 0, clicked: 0, when: 'မူကြမ်း' },
];

const REACH: Record<string, number> = { 'ကျောင်းသား အားလုံး': 4820, 'Pro အသင်းဝင်များ': 1240, 'အခမဲ့ အသင်းဝင်များ': 3580, 'သင်တန်း မဝယ်ရသေးသူများ': 1960 };

export default function Index({ campaigns }: { campaigns?: Campaign[] }) {
    const [items, setItems] = useState<Campaign[]>(campaigns ?? SAMPLE_CAMPAIGNS);
    const [subject, setSubject] = useState('');
    const [audience, setAudience] = useState('ကျောင်းသား အားလုံး');
    const [body, setBody] = useState('');
    const [notice, setNotice] = useState('');

    const totalSent = items.filter((c) => c.status === 'sent').reduce((s, c) => s + c.sent, 0);

    const add = (draft: boolean) => {
        if (!subject.trim()) return;
        const reach = REACH[audience] ?? 1000;
        setItems([{ id: Date.now(), subject: subject.trim(), audience, status: draft ? 'draft' : 'sent', sent: draft ? 0 : reach, opened: 0, clicked: 0, when: draft ? 'မူကြမ်း' : 'ယနေ့' }, ...items]);
        setSubject('');
        setBody('');
        setNotice(draft ? 'Campaign မူကြမ်း သိမ်းပြီးပါပြီ (ဤ page မှာသာ)' : `Campaign ပို့ပြီးပါပြီ — လက်ခံသူ ${formatNumber(reach)} ဦး (ဤ page မှာသာ)`);
    };

    const sendNow = (id: number) => {
        setItems(
            items.map((c) => {
                if (c.id !== id) return c;
                const reach = REACH[c.audience] ?? 1000;
                return { ...c, status: 'sent' as const, sent: reach, when: 'ယနေ့' };
            }),
        );
        setNotice('Campaign ပို့ပြီးပါပြီ (ဤ page မှာသာ)');
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        add(false);
    };

    return (
        <LmsShell title="Email Campaign စီမံရန်" nav="admin">
            <Head title="Email Campaign စီမံရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="Email Campaign စီမံရန်"
                description={`ကျောင်းသားတွေထံ အီးမေးလ် campaign များ ပို့ပြီး ရလဒ်ကို တိုင်းတာပါ — Campaign ${items.length} ခု · ပို့ပြီး email ${formatNumber(totalSent)} စောင်`}
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <Plus className="size-5" /> Campaign အသစ်
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="ခေါင်းစဉ် (Subject)" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                        <div>
                            <label className={labelCls}>လက်ခံမည့်သူများ</label>
                            <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)}>
                                <option>ကျောင်းသား အားလုံး</option>
                                <option>Pro အသင်းဝင်များ</option>
                                <option>အခမဲ့ အသင်းဝင်များ</option>
                                <option>သင်တန်း မဝယ်ရသေးသူများ</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>အီးမေးလ် အကြောင်းအရာ</label>
                        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button type="button" className={btnGhostCls} onClick={() => add(true)}>
                            မူကြမ်း သိမ်းရန်
                        </button>
                        <button type="submit" className={btnAccentCls}>
                            <Send className="size-4" /> ချက်ချင်း ပို့ရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            {items.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Campaign မရှိသေးပါ" description="အပေါ်က form မှာ ပထမဆုံး campaign ဖန်တီးနိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {items.map((c) => {
                        const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
                        const clickRate = c.sent ? Math.round((c.clicked / c.sent) * 100) : 0;
                        return (
                            <LmsCard key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                    <Mail className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{c.subject}</p>
                                    <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                        {c.audience} · {c.when}
                                    </p>
                                    {c.status === 'sent' ? (
                                        <p className={`mt-1 text-[.8rem] font-semibold ${inkCls}`}>
                                            ပို့ပြီး {formatNumber(c.sent)} · ဖွင့်ကြည့် {openRate}% · နှိပ်ကြည့် {clickRate}%
                                        </p>
                                    ) : (
                                        <p className={`mt-1 text-[.8rem] font-semibold ${mutedCls}`}>မပို့ရသေးပါ</p>
                                    )}
                                </div>
                                {c.status === 'sent' ? (
                                    <Pill tone="teal">ပို့ပြီး</Pill>
                                ) : (
                                    <div className="flex flex-none items-center gap-2">
                                        <Pill tone="slate">မူကြမ်း</Pill>
                                        <button type="button" className={btnAccentCls} onClick={() => sendNow(c.id)}>
                                            အခု ပို့ရန်
                                        </button>
                                    </div>
                                )}
                            </LmsCard>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

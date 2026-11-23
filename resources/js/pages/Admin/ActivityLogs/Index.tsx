import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, faintCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type AuditEntry = {
    who: string;
    init: string;
    col: string;
    action: string;
    target: string;
    type: 'course' | 'payment' | 'user' | 'system';
    time: string;
};

type Props = {
    logs?: AuditEntry[];
};

const AUDIT_TYPES: { key: 'all' | AuditEntry['type']; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'course', label: 'သင်တန်း' },
    { key: 'payment', label: 'ငွေပေးချေမှု' },
    { key: 'user', label: 'အသုံးပြုသူ' },
    { key: 'system', label: 'စနစ်' },
];

const TYPE_TONE: Record<AuditEntry['type'], 'blue' | 'teal' | 'violet' | 'slate'> = {
    course: 'blue',
    payment: 'teal',
    user: 'violet',
    system: 'slate',
};

/* SAMPLE DATA — fallback only; replace with real logs prop when the backend provides one. */
const SAMPLE_LOGS: AuditEntry[] = [
    { who: 'Admin (Owner)', init: 'AD', col: '#dc2626', action: 'Coupon အသစ် ဖန်တီးခဲ့သည်', target: 'STUDENT20 · 20%', time: 'ယနေ့ · မနက် 9:42', type: 'system' },
    { who: 'Admin (Owner)', init: 'AD', col: '#dc2626', action: 'ငွေပေးချေမှု အတည်ပြုခဲ့သည်', target: 'TXN-2093 · Flutter Mobile Development · 90,000 ကျပ်', time: 'ယနေ့ · မနက် 9:15', type: 'payment' },
    { who: 'May Thazin (Staff)', init: 'MT', col: '#ec4899', action: 'သင်တန်း အခြေအနေ ပြောင်းခဲ့သည်', target: 'Data Science with Python · Draft → Review', time: 'မနေ့က · ညနေ 4:30', type: 'course' },
    { who: 'Admin (Owner)', init: 'AD', col: '#dc2626', action: 'ဆရာ လျှောက်လွှာ လက်ခံခဲ့သည်', target: 'Aye Chan Moe · Data Science & Python', time: 'မနေ့က · နေ့လယ် 1:05', type: 'user' },
    { who: 'Zaw Lin (Support)', init: 'ZL', col: '#f59e0b', action: 'Support ticket ပိတ်ခဲ့သည်', target: 'TKT-1035 · လက်မှတ် ပြဿနာ', time: 'မနေ့က · မနက် 11:20', type: 'user' },
    { who: 'System', init: 'SY', col: '#64748b', action: 'အလိုအလျောက် backup ပြီးစီးသည်', target: 'Database snapshot · 1.2 GB', time: 'မနေ့က · ည 11:30', type: 'system' },
    { who: 'May Thazin (Staff)', init: 'MT', col: '#ec4899', action: 'Live session အသစ် စီစဉ်ခဲ့သည်', target: 'JavaScript Async Patterns — Q&A Live · နိုဝင်ဘာ 23', time: 'နိုဝင်ဘာ 21 · ညနေ 3:44', type: 'course' },
    { who: 'Admin (Owner)', init: 'AD', col: '#dc2626', action: 'Refund အတည်ပြုခဲ့သည်', target: 'MySQL & Database Design · Kaung Htet · 35,000 ကျပ်', time: 'နိုဝင်ဘာ 20 · မနက် 10:02', type: 'payment' },
    { who: 'Zaw Lin (Support)', init: 'ZL', col: '#f59e0b', action: 'Review ဖျောက်ထားခဲ့သည်', target: 'Node.js API Development · spam သံသယ', time: 'နိုဝင်ဘာ 20 · မနက် 9:18', type: 'course' },
    { who: 'Admin (Owner)', init: 'AD', col: '#dc2626', action: 'Staff အသစ် ဖိတ်ခေါ်ခဲ့သည်', target: 'maythazin@codexamm.com · Content Editor', time: 'နိုဝင်ဘာ 19 · ညနေ 5:26', type: 'user' },
];

export default function ActivityLogsIndex({ logs }: Props) {
    const [tab, setTab] = useState<'all' | AuditEntry['type']>('all');
    const list = (logs && logs.length > 0 ? logs : SAMPLE_LOGS).filter((a) => tab === 'all' || a.type === tab);

    const download = () => {
        const lines = ['Codexa MM — Audit Log Export', ''];
        (logs && logs.length > 0 ? logs : SAMPLE_LOGS).forEach((a) => {
            lines.push(`${a.time} · ${a.who} · ${a.action} · ${a.target} · ${a.type}`);
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codexa-mm-audit-log.txt';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <LmsShell title="လုပ်ဆောင်ချက် မှတ်တမ်း" nav="admin">
            <Head title="လုပ်ဆောင်ချက် မှတ်တမ်း" />
            <PageIntro
                eyebrow="ADMIN"
                title="လုပ်ဆောင်ချက် မှတ်တမ်း"
                description="Admin နဲ့ staff တွေရဲ့ platform ပေါ် လုပ်ဆောင်ချက်တိုင်းကို လုံခြုံရေး အတွက် မှတ်တမ်း တင်ထားပါတယ်"
                actions={
                    <button type="button" className={btnGhostCls} onClick={download}>
                        <Download className="size-4" />
                        မှတ်တမ်း ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            <div className="mt-5 flex flex-wrap gap-2">
                {AUDIT_TYPES.map((t) => (
                    <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                        {t.label}
                    </Chip>
                ))}
            </div>

            {list.length === 0 ? (
                <div className="mt-5">
                    <EmptyBox title="ဒီ အမျိုးအစားမှာ မှတ်တမ်း မရှိပါ" />
                </div>
            ) : (
                <LmsCard className="mt-5 divide-y divide-slate-200 dark:divide-[#1e2c52]">
                    {list.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 p-4">
                            <Avatar init={a.init} color={a.col} />
                            <div className="min-w-0 flex-1">
                                <p className={`text-[.9rem] leading-snug ${inkCls}`}>
                                    <b>{a.who}</b> — {a.action}
                                </p>
                                <p className={`mt-0.5 text-[.78rem] ${mutedCls}`}>{a.target}</p>
                            </div>
                            <div className="flex flex-none flex-col items-end gap-1.5">
                                <Pill tone={TYPE_TONE[a.type]}>
                                    {AUDIT_TYPES.find((t) => t.key === a.type)?.label ?? a.type}
                                </Pill>
                                <span className={`text-[.74rem] font-semibold ${faintCls}`}>{a.time}</span>
                            </div>
                        </div>
                    ))}
                </LmsCard>
            )}
        </LmsShell>
    );
}

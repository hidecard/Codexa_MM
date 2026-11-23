import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate } from '@/lib/format';
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
    logs: AuditEntry[];
    filterType?: string;
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

function formatLogTime(iso: string): string {
    const d = new Date(iso.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return iso;
    return `${formatDate(iso)} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ActivityLogsIndex({ logs }: Props) {
    const [tab, setTab] = useState<'all' | AuditEntry['type']>('all');
    const list = logs.filter((a) => tab === 'all' || a.type === tab);

    const download = () => {
        const lines = ['Codexa MM — Audit Log Export', ''];
        logs.forEach((a) => {
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
                                <span className={`text-[.74rem] font-semibold ${faintCls}`}>{formatLogTime(a.time)}</span>
                            </div>
                        </div>
                    ))}
                </LmsCard>
            )}
        </LmsShell>
    );
}

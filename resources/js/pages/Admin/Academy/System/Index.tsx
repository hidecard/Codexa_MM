import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Download, HardDrive, Server, Wrench } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

const SERVICES = [
    { name: 'Web Server', desc: 'Laravel app · PHP 8.5', status: 'ok', uptime: '99.98%' },
    { name: 'Database', desc: 'MySQL · primary', status: 'ok', uptime: '99.99%' },
    { name: 'Queue Worker', desc: 'Email / certificate jobs', status: 'ok', uptime: '99.95%' },
    { name: 'Storage', desc: 'Video / uploads · 68% သုံးထား', status: 'ok', uptime: '—' },
    { name: 'Payment Webhook', desc: 'KBZPay / WavePay callbacks', status: 'ok', uptime: '99.97%' },
];

const BACKUPS = [
    { name: 'codexa-mm-backup-2026-11-22.sql', size: '184 MB', date: 'နိုဝင်ဘာ 22 · မနက် 3:00' },
    { name: 'codexa-mm-backup-2026-11-21.sql', size: '182 MB', date: 'နိုဝင်ဘာ 21 · မနက် 3:00' },
    { name: 'codexa-mm-backup-2026-11-20.sql', size: '179 MB', date: 'နိုဝင်ဘာ 20 · မနက် 3:00' },
];

export default function Index() {
    const [maintenance, setMaintenance] = useState(false);
    const [notice, setNotice] = useState('');

    return (
        <LmsShell title="စနစ် အခြေအနေ" nav="admin">
            <Head title="စနစ် အခြေအနေ" />
            <PageIntro
                eyebrow="ADMIN"
                title="စနစ် အခြေအနေ"
                description="Platform ရဲ့ server, storage နဲ့ နောက်ခံ လုပ်ငန်းစဉ်များ အခြေအနေ"
                actions={
                    <button type="button" className={btnGhostCls}>
                        <Download className="size-4" /> Backup ဒေါင်းလုဒ်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="ဝန်ဆောင်မှု အခြေအနေ">
                    <div className="space-y-3">
                        {SERVICES.map((s) => (
                            <div key={s.name} className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                    {s.name === 'Storage' ? <HardDrive className="size-5" /> : <Server className="size-5" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    <p className={`mt-0.5 text-[.78rem] ${mutedCls}`}>{s.desc}</p>
                                </div>
                                <div className="flex flex-none flex-col items-end gap-1">
                                    <Pill tone="teal">
                                        <CheckCircle2 className="mr-1 size-3" /> ပုံမှန်
                                    </Pill>
                                    {s.uptime !== '—' && <span className={`text-[.72rem] font-semibold ${mutedCls}`}>{s.uptime}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className={`mt-4 text-[.78rem] ${mutedCls}`}>မှတ်ချက် — အခြေအနေတွေက နမူနာ (sample) ဖြစ်ပါတယ်။ အစစ်အမှန် health check endpoint မရှိသေးပါ။</p>
                </SectionCard>

                <div className="space-y-5">
                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                            <Wrench className="size-5" /> ထိန်းသိမ်းမှု ပုံစံ
                        </h2>
                        <p className={`mt-2 text-sm leading-relaxed ${mutedCls}`}>
                            Maintenance mode ဖွင့်ထားရင် ကျောင်းသားတွေ ခဏ ရပ်နားထားကြောင်း မြင်ရပါမယ်
                        </p>
                        <p className={`mt-2 text-sm font-bold ${inkCls}`}>
                            လက်ရှိ — {maintenance ? 'ဖွင့်ထားပါတယ် (ထိန်းသိမ်းနေပါတယ်)' : 'ပိတ်ထားပါတယ် (ပုံမှန် လည်ပတ်နေပါတယ်)'}
                        </p>
                        <button
                            type="button"
                            className={`${maintenance ? btnAccentCls : btnGhostCls} mt-4`}
                            onClick={() => {
                                setMaintenance(!maintenance);
                                setNotice(maintenance ? 'Maintenance mode ပိတ်ပြီးပါပြီ (ဤ page မှာသာ)' : 'Maintenance mode ဖွင့်ပြီးပါပြီ (ဤ page မှာသာ — artisan down/up မလုပ်ရသေးပါ)');
                            }}
                        >
                            {maintenance ? 'Maintenance ပိတ်ရန်' : 'Maintenance ဖွင့်ရန်'}
                        </button>
                    </LmsCard>

                    <SectionCard title="နောက်ဆုံး Backup များ">
                        <div className="space-y-2.5">
                            {BACKUPS.map((b) => (
                                <div key={b.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate font-mono text-[.82rem] font-bold ${inkCls}`}>{b.name}</p>
                                        <p className={`mt-0.5 text-[.76rem] ${mutedCls}`}>
                                            {b.size} · {b.date}
                                        </p>
                                    </div>
                                    <button type="button" className={btnGhostCls}>
                                        <Download className="size-4" /> ဒေါင်းလုဒ်
                                    </button>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </LmsShell>
    );
}

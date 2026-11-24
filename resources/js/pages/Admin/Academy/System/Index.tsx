import { Head } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Database, HardDrive, Mail, Server, Users, Wrench, XCircle } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { StatCard } from '@/components/lms/stat-card';
import { LmsCard, PageIntro, Pill, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type SystemInfo = {
    php_version: string;
    laravel_version: string;
    app_env: string;
    app_debug: boolean;
    maintenance: boolean;
    database: { driver: string; ok: boolean; file: string; size_human: string };
    storage: { free_human: string; total_human: string; used_percent: number | null; writable: boolean };
    queue: string;
    cache: string;
    mail: string;
    counts: { users: number; courses: number; enrollments: number };
};

type Props = { system?: SystemInfo };

export default function Index({ system }: Props) {
    if (!system) {
        return (
            <LmsShell title="စနစ် အခြေအနေ" nav="admin">
                <Head title="စနစ် အခြေအနေ" />
                <PageIntro eyebrow="ADMIN" title="စနစ် အခြေအနေ" description="Platform ရဲ့ server, storage နဲ့ နောက်ခံ လုပ်ငန်းစဉ်များ အခြေအနေ" />
                <p className={`mt-6 text-sm ${mutedCls}`}>စနစ် အချက်အလက် ရယူ၍ မရပါ။</p>
            </LmsShell>
        );
    }

    const services = [
        { name: 'Web Server', desc: `Laravel ${system.laravel_version} · PHP ${system.php_version} · ${system.app_env}`, ok: true, icon: Server },
        { name: 'Database', desc: `${system.database.driver} · ${system.database.file} · ${system.database.size_human}`, ok: system.database.ok, icon: Database },
        { name: 'Queue Worker', desc: `Connection — ${system.queue}`, ok: true, icon: Server },
        { name: 'Storage', desc: `အလွတ် ${system.storage.free_human} / စုစုပေါင်း ${system.storage.total_human}${system.storage.used_percent !== null ? ` · ${system.storage.used_percent}% သုံးထား` : ''}`, ok: system.storage.writable, icon: HardDrive },
        { name: 'Cache', desc: `Driver — ${system.cache}`, ok: true, icon: Server },
        { name: 'Mail', desc: `Mailer — ${system.mail}${['log', 'array', 'fail'].includes(system.mail) ? ' · အစစ်အမှန် ပို့ခြင်း မဟုတ်ပါ' : ''}`, ok: !['log', 'array', 'fail'].includes(system.mail), icon: Mail },
    ];

    return (
        <LmsShell title="စနစ် အခြေအနေ" nav="admin">
            <Head title="စနစ် အခြေအနေ" />
            <PageIntro eyebrow="ADMIN" title="စနစ် အခြေအနေ" description="Platform ရဲ့ server, storage နဲ့ နောက်ခံ လုပ်ငန်းစဉ်များ အခြေအနေ — အချက်အလက်အားလုံး အစစ်အမှန်ပါ" />

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-3">
                <StatCard label="အသုံးပြုသူ စုစုပေါင်း" value={`${system.counts.users} ဦး`} icon={Users} tone="teal" />
                <StatCard label="သင်တန်း စုစုပေါင်း" value={`${system.counts.courses} ခု`} icon={BookOpen} tone="blue" />
                <StatCard label="အပ်နှံမှု စုစုပေါင်း" value={`${system.counts.enrollments} ခု`} icon={Users} tone="purple" />
            </div>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="ဝန်ဆောင်မှု အခြေအနေ">
                    <div className="space-y-3">
                        {services.map((s) => (
                            <div key={s.name} className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                    <s.icon className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    <p className={`mt-0.5 text-[.78rem] ${mutedCls}`}>{s.desc}</p>
                                </div>
                                <div className="flex flex-none flex-col items-end gap-1">
                                    {s.ok ? (
                                        <Pill tone="teal">
                                            <CheckCircle2 className="mr-1 size-3" /> ပုံမှန်
                                        </Pill>
                                    ) : (
                                        <Pill tone="rose">
                                            <XCircle className="mr-1 size-3" /> စစ်ဆေးရန်
                                        </Pill>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
                            လက်ရှိ — {system.maintenance ? 'ဖွင့်ထားပါတယ် (ထိန်းသိမ်းနေပါတယ်)' : 'ပိတ်ထားပါတယ် (ပုံမှန် လည်ပတ်နေပါတယ်)'}
                        </p>
                        <p className={`mt-2 text-[.8rem] ${mutedCls}`}>ဖွင့်/ပိတ် လုပ်ရန် server မှာ php artisan down / up သုံးရပါမယ် — ဒီ page က ကြည့်ရန်သာ ဖြစ်ပါတယ်။</p>
                    </LmsCard>

                    <SectionCard title="နောက်ဆုံး Backup များ">
                        <p className={`text-sm ${mutedCls}`}>Backup ဖိုင် မရှိသေးပါ — အလိုအလျောက် backup လုပ်ငန်းစဉ် မပြင်ဆင်ထားသေးပါ။</p>
                    </SectionCard>
                </div>
            </div>
        </LmsShell>
    );
}

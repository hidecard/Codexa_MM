import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { FileUp, Upload } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type ImportLog = { id: number; type: string; ok: number; skipped: number; date: string; errors: string[] };

const SAMPLE_LOGS: ImportLog[] = [
    { id: 1, type: 'ကျောင်းသားများ', ok: 48, skipped: 2, date: 'နိုဝင်ဘာ 20', errors: ['လိုင်း 12: email မပါပါ', 'လိုင်း 31: အမည် ထပ်နေပါတယ်'] },
    { id: 2, type: 'သင်တန်းများ', ok: 5, skipped: 0, date: 'နိုဝင်ဘာ 15', errors: [] },
];

export default function Index() {
    const [type, setType] = useState('သင်တန်းများ');
    const [csv, setCsv] = useState('');
    const [logs, setLogs] = useState<ImportLog[]>(SAMPLE_LOGS);
    const [notice, setNotice] = useState('');

    const sample = () => {
        if (type === 'သင်တန်းများ') {
            setCsv('React Hooks Masterclass, Web Development, 95000\nPython Data Analysis, Programming, 110000\nFigma for Beginners, Design, 40000');
        } else {
            setCsv('Aye Chan Moe, Yangon, pro\nMay Myat Noe, Mandalay, free\nThura Kyaw, Yangon, free');
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return;
        const errors: string[] = [];
        let ok = 0;
        lines.forEach((l, i) => {
            const parts = l.split(',').map((p) => p.trim());
            if (parts.length < 3 || !parts[0]) {
                errors.push(`လိုင်း ${i + 1}: ပုံစံ မှားနေပါတယ် — "${l}"`);
            } else {
                ok += 1;
            }
        });
        setLogs([{ id: Date.now(), type, ok, skipped: errors.length, date: 'ယနေ့', errors }, ...logs]);
        setNotice(`${ok} မှတ်တမ်း သွင်းပြီးပါပြီ${errors.length ? ` · ${errors.length} ကြောင်း ကျော်သွားပါတယ်` : ''} (ဤ page မှာသာ — backend import မရှိသေးပါ)`);
        setCsv('');
    };

    return (
        <LmsShell title="Bulk Import" nav="admin">
            <Head title="Bulk Import" />
            <PageIntro
                eyebrow="ADMIN"
                title="Bulk Import"
                description="CSV စာသား ကူးထည့်ပြီး သင်တန်း/ကျောင်းသား အစုလိုက် သွင်းပါ — သွင်းပြီးရင် သက်ဆိုင်ရာ page တွေမှာ ချက်ချင်း ပေါ်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                        <FileUp className="size-5" /> ဒေတာ သွင်းရန်
                    </h2>
                    <form onSubmit={submit} className="mt-4 grid gap-4">
                        <div>
                            <label className={labelCls}>အမျိုးအစား</label>
                            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
                                <option>သင်တန်းများ — title, category, price</option>
                                <option>ကျောင်းသားများ — name, city, plan</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>CSV စာသား (တစ်ကြောင်း = မှတ်တမ်း တစ်ခု)</label>
                            <textarea
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                rows={8}
                                value={csv}
                                onChange={(e) => setCsv(e.target.value)}
                                placeholder={type.startsWith('သင်တန်း') ? 'React Hooks Masterclass, Web Development, 95000' : 'Aye Chan Moe, Yangon, pro'}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <button type="submit" className={btnAccentCls}>
                                <Upload className="size-4" /> သွင်းရန်
                            </button>
                            <button type="button" className={btnGhostCls} onClick={sample}>
                                နမူနာ ထည့်ရန်
                            </button>
                        </div>
                        <p className={`text-[.8rem] ${mutedCls}`}>ပုံစံ မှားတဲ့ ကြောင်းတွေကို ကျော်ပြီး အမှား အကြောင်းရင်းနဲ့အတူ ရလဒ်မှာ ပြပေးပါတယ်။</p>
                    </form>
                </LmsCard>

                <SectionCard title="သွင်းမှု မှတ်တမ်း">
                    {logs.length === 0 ? (
                        <p className={`text-sm ${mutedCls}`}>သွင်းမှု မှတ်တမ်း မရှိသေးပါ။</p>
                    ) : (
                        <div className="space-y-3.5">
                            {logs.map((l) => (
                                <div key={l.id} className="rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{l.type}</p>
                                        <Pill tone="teal">{l.ok} အောင်မြင်</Pill>
                                        {l.skipped > 0 && <Pill tone="amber">{l.skipped} ကျော်သွား</Pill>}
                                        <span className={`ml-auto text-[.76rem] font-semibold ${mutedCls}`}>{l.date}</span>
                                    </div>
                                    {l.errors.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {l.errors.map((err, i) => (
                                                <li key={i} className="text-[.8rem] text-rose-600">
                                                    {err}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </LmsShell>
    );
}

import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { KeyRound, Link2, Plus, Send, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

const SERVICES = [
    { name: 'KBZPay', desc: 'ငွေပေးချေမှု gateway · QR / App', connected: true },
    { name: 'WavePay', desc: 'ငွေပေးချေမှု gateway · QR / App', connected: true },
    { name: 'CB Pay', desc: 'ငွေပေးချေမှု gateway', connected: true },
    { name: 'YouTube', desc: 'သင်ခန်းစာ video embed', connected: true },
    { name: 'Zoom', desc: 'Live class ချိတ်ဆက်မှု', connected: false },
    { name: 'Google Analytics', desc: 'ဝင်ရောက်မှု တိုင်းတာခြင်း', connected: false },
];

type ApiKey = { id: number; name: string; last4: string; created: string };

export default function Index() {
    const [connected, setConnected] = useState<Record<string, boolean>>(Object.fromEntries(SERVICES.map((s) => [s.name, s.connected])));
    const [webhook, setWebhook] = useState('https://codexamm.com/webhooks/payments');
    const [lastTest, setLastTest] = useState('မရှိသေး');
    const [keys, setKeys] = useState<ApiKey[]>([
        { id: 1, name: 'Mobile App API', last4: '8f3a', created: 'နိုဝင်ဘာ 10' },
        { id: 2, name: 'Partner Integration', last4: 'c21e', created: 'အောက်တိုဘာ 28' },
    ]);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyValue, setNewKeyValue] = useState('');
    const [notice, setNotice] = useState('');

    const toggle = (name: string) => setConnected({ ...connected, [name]: !connected[name] });

    const saveWebhook = (e: FormEvent) => {
        e.preventDefault();
        setNotice('Webhook သိမ်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const testWebhook = () => setLastTest('ယနေ့ · အောင်မြင်ပါတယ် (စမ်းသပ်မှု — အစစ် မဟုတ်ပါ)');

    const createKey = (e: FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        const rand = Math.random().toString(16).slice(2, 6);
        // NOTE: demo-only key shown once; a real implementation must generate
        // and store this server-side.
        setNewKeyValue(`cmx_live_${rand}${Math.random().toString(16).slice(2, 10)}`);
        setKeys([...keys, { id: Date.now(), name: newKeyName.trim(), last4: rand, created: 'ယနေ့' }]);
        setNewKeyName('');
    };

    return (
        <LmsShell title="Integrations & API Keys" nav="admin">
            <Head title="Integrations & API Keys" />
            <PageIntro
                eyebrow="ADMIN"
                title="Integrations & API Keys"
                description="ပြင်ပ service ချိတ်ဆက်မှုများ၊ API key များနဲ့ webhook ကို စီမံပါ"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <SectionCard title="ချိတ်ဆက်ထားသော Service များ">
                    <div className="space-y-3">
                        {SERVICES.map((s) => (
                            <div key={s.name} className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300">
                                    <Link2 className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{s.name}</p>
                                    <p className={`mt-0.5 text-[.78rem] ${mutedCls}`}>{s.desc}</p>
                                </div>
                                <button type="button" className={btnGhostCls} onClick={() => toggle(s.name)}>
                                    {connected[s.name] ? 'ချိတ်ထားပြီး' : 'ချိတ်ဆက်ရန်'}
                                </button>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <div className="space-y-5">
                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>Webhook</h2>
                        <form onSubmit={saveWebhook} className="mt-4 grid gap-3">
                            <div>
                                <label className={labelCls}>Webhook URL (ငွေပေးချေမှု အတည်ပြုချက် လက်ခံရန်)</label>
                                <Input value={webhook} onChange={(e) => setWebhook(e.target.value)} />
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                <button type="submit" className={btnAccentCls}>
                                    Webhook သိမ်းရန်
                                </button>
                                <button type="button" className={btnGhostCls} onClick={testWebhook}>
                                    <Send className="size-4" /> စမ်းသပ် ပို့ရန်
                                </button>
                            </div>
                            <p className={`text-[.8rem] ${mutedCls}`}>နောက်ဆုံး စမ်းသပ်မှု — {lastTest}</p>
                        </form>
                    </LmsCard>

                    <LmsCard className="p-5 sm:p-6">
                        <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                            <KeyRound className="size-5" /> API Keys
                        </h2>
                        <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                            Key အပြည့်ကို ထုတ်ပြီးချိန်မှာပဲ တစ်ခါ ပြပါတယ်။ လုံခြုံစွာ သိမ်းထားပါ — ဒီ page မှာ နောက်ဆုံး 4 လုံးပဲ ပြန်ပြပါတယ်။
                        </p>
                        {newKeyValue && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900 dark:bg-amber-950/30">
                                <p className="text-[.76rem] font-bold text-amber-800 dark:text-amber-200">Key အသစ် — ယခု တစ်ခါသာ မြင်ရပါမယ်</p>
                                <p className="mt-1 break-all font-mono text-sm font-bold text-amber-900 dark:text-amber-100">{newKeyValue}</p>
                            </div>
                        )}
                        <div className="mt-4 space-y-2.5">
                            {keys.map((k) => (
                                <div key={k.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[.9rem] font-extrabold ${inkCls}`}>{k.name}</p>
                                        <p className={`mt-0.5 font-mono text-[.78rem] ${mutedCls}`}>
                                            •••• {k.last4} · {k.created}
                                        </p>
                                    </div>
                                    <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => setKeys(keys.filter((x) => x.id !== k.id))}>
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={createKey} className="mt-4 flex flex-wrap gap-2">
                            <input className={`${inputCls} min-w-[160px] flex-1`} placeholder="Key အမည်" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required />
                            <button type="submit" className={btnAccentCls}>
                                <Plus className="size-4" /> Key အသစ် ထုတ်ရန်
                            </button>
                        </form>
                    </LmsCard>
                </div>
            </div>
        </LmsShell>
    );
}

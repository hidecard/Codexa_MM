import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, Link2, Pencil, Plus, RefreshCw, Send, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Input } from '@/components/ui/input';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

const SERVICES = [
    { name: 'KBZPay', desc: 'ငွေပေးချေမှု gateway · QR / App', connected: true },
    { name: 'WavePay', desc: 'ငွေပေးချေမှု gateway · QR / App', connected: true },
    { name: 'CB Pay', desc: 'ငွေပေးချေမှု gateway', connected: true },
    { name: 'YouTube', desc: 'သင်ခန်းစာ video embed', connected: true },
    { name: 'Zoom', desc: 'Live class ချိတ်ဆက်မှု', connected: false },
    { name: 'Google Analytics', desc: 'ဝင်ရောက်မှု တိုင်းတာခြင်း', connected: false },
];

type ApiKeyRow = { id: number; name: string; provider: string; last4: string; is_active: boolean; last_used_at: string | null; created: string };

type Props = {
    keys?: ApiKeyRow[];
    providers?: string[];
    newKey?: string | null;
    newKeyName?: string | null;
};

export default function Index({ keys = [], providers = ['general'], newKey = null, newKeyName = null }: Props) {
    const [connected, setConnected] = useState<Record<string, boolean>>(Object.fromEntries(SERVICES.map((s) => [s.name, s.connected])));
    const [webhook, setWebhook] = useState('https://codexamm.com/webhooks/payments');
    const [lastTest, setLastTest] = useState('မရှိသေး');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editProvider, setEditProvider] = useState('general');

    const form = useForm({ name: '', provider: 'general' });

    const toggle = (name: string) => setConnected({ ...connected, [name]: !connected[name] });

    const saveWebhook = (e: FormEvent) => {
        e.preventDefault();
        // Webhook URL persistence has no settings model yet — kept as a
        // local display value until one exists.
        setNotice('Webhook URL ကို ဤ page မှာသာ မှတ်ထားပါပြီ (server မှာ သိမ်းရန် setting မရှိသေးပါ)');
    };

    const testWebhook = () => setLastTest('ယနေ့ · အောင်မြင်ပါတယ် (စမ်းသပ်မှု — အစစ် မဟုတ်ပါ)');

    const createKey = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.name.trim()) return;
        setError('');
        form.post('/admin/academy/integrations/api-keys', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setNotice('API key အသစ် ထုတ်ပြီးပါပြီ — အဝါရောင် box မှာ တစ်ခါသာ မြင်ရပါမယ်');
            },
            onError: () => setError('Key ထုတ်ခြင်း မအောင်မြင်ပါ'),
        });
    };

    const startEdit = (k: ApiKeyRow) => {
        setEditingId(k.id);
        setEditName(k.name);
        setEditProvider(k.provider);
    };

    const saveEdit = (k: ApiKeyRow) => {
        router.put(
            `/admin/academy/integrations/api-keys/${k.id}`,
            { name: editName, provider: editProvider },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    setNotice(`"${editName}" ပြင်ဆင်ပြီးပါပြီ`);
                },
            },
        );
    };

    const regenerate = (k: ApiKeyRow) => {
        router.post(
            `/admin/academy/integrations/api-keys/${k.id}/regenerate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice(`"${k.name}" အတွက် key အသစ် ထုတ်ပြီးပါပြီ — အဝါရောင် box မှာ တစ်ခါသာ မြင်ရပါမယ်`),
            },
        );
    };

    const toggleActive = (k: ApiKeyRow) => {
        router.post(
            `/admin/academy/integrations/api-keys/${k.id}/${k.is_active ? 'revoke' : 'reactivate'}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice(`"${k.name}" ${k.is_active ? 'ပိတ်သိမ်းပြီးပါပြီ' : 'ပြန်ဖွင့်ပြီးပါပြီ'}`),
            },
        );
    };

    const remove = (k: ApiKeyRow) => {
        router.delete(`/admin/academy/integrations/api-keys/${k.id}`, {
            preserveScroll: true,
            onSuccess: () => setNotice(`"${k.name}" ဖျက်ပြီးပါပြီ`),
        });
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
            {error && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
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
                        {newKey && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900 dark:bg-amber-950/30">
                                <p className="text-[.76rem] font-bold text-amber-800 dark:text-amber-200">Key အသစ်{newKeyName ? ` — ${newKeyName}` : ''} · ယခု တစ်ခါသာ မြင်ရပါမယ်</p>
                                <p className="mt-1 break-all font-mono text-sm font-bold text-amber-900 dark:text-amber-100">{newKey}</p>
                            </div>
                        )}
                        <div className="mt-4 space-y-2.5">
                            {keys.length === 0 ? (
                                <p className={`text-sm ${mutedCls}`}>API key မရှိသေးပါ — အောက်က form မှာ အသစ် ထုတ်နိုင်ပါတယ်။</p>
                            ) : (
                                keys.map((k) => (
                                    <div key={k.id} className="rounded-xl border border-slate-100 p-3.5 dark:border-[#18264a]">
                                        {editingId === k.id ? (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <input className={`${inputCls} min-w-[140px] flex-1`} value={editName} onChange={(e) => setEditName(e.target.value)} />
                                                <select className={inputCls} value={editProvider} onChange={(e) => setEditProvider(e.target.value)}>
                                                    {providers.map((p) => (
                                                        <option key={p} value={p}>
                                                            {p}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button type="button" className={btnAccentCls} onClick={() => saveEdit(k)}>
                                                    သိမ်းရန်
                                                </button>
                                                <button type="button" className={btnGhostCls} onClick={() => setEditingId(null)}>
                                                    ပယ်ဖျက်ရန်
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className={`text-[.9rem] font-extrabold ${inkCls}`}>{k.name}</p>
                                                        <Pill tone={k.is_active ? 'teal' : 'slate'}>{k.is_active ? 'အသက်ဝင်သည်' : 'ပိတ်သိမ်းထား'}</Pill>
                                                    </div>
                                                    <p className={`mt-0.5 font-mono text-[.78rem] ${mutedCls}`}>
                                                        {k.provider} · •••• {k.last4} · {k.created}
                                                        {k.last_used_at ? ` · နောက်ဆုံး သုံး ${k.last_used_at.slice(0, 10)}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-none items-center gap-1">
                                                    <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => regenerate(k)} title="Key အသစ် ထုတ်ရန်">
                                                        <RefreshCw className="size-4" />
                                                    </button>
                                                    <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => startEdit(k)} title="ပြင်ရန်">
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button type="button" className={btnGhostCls} onClick={() => toggleActive(k)}>
                                                        {k.is_active ? 'ပိတ်သိမ်းရန်' : 'ပြန်ဖွင့်ရန်'}
                                                    </button>
                                                    <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(k)} title="ဖျက်ရန်">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={createKey} className="mt-4 flex flex-wrap gap-2">
                            <input className={`${inputCls} min-w-[160px] flex-1`} placeholder="Key အမည်" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            <select className={inputCls} value={form.data.provider} onChange={(e) => form.setData('provider', e.target.value)}>
                                {providers.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className={btnAccentCls} disabled={form.processing}>
                                <Plus className="size-4" /> Key အသစ် ထုတ်ရန်
                            </button>
                        </form>
                        {form.errors.name && <p className="mt-2 text-xs font-semibold text-rose-600">{form.errors.name}</p>}
                        {form.errors.provider && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.provider}</p>}
                    </LmsCard>
                </div>
            </div>
        </LmsShell>
    );
}

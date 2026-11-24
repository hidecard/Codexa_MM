import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Download, FileUp, Upload } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type PreviewRow = { line: number; title: string; category: string; price: number; level: string };

type Preview = {
    token: string;
    filename: string;
    total_rows: number;
    valid_rows: number;
    errors: string[];
    sample: PreviewRow[];
};

type ImportResult = { created: number; skipped: number; failed?: number; errors: string[]; date: string };

type HistoryRow = {
    id: number;
    filename: string;
    status: 'completed' | 'partial' | 'failed';
    rows_total: number;
    rows_imported: number;
    rows_skipped: number;
    rows_failed: number;
    errors: string[];
    imported_by: string;
    date: string;
};

type Props = { preview?: Preview | null; result?: ImportResult | null; history?: HistoryRow[] };

const HISTORY_STATUS: Record<HistoryRow['status'], { tone: 'teal' | 'amber' | 'rose'; label: string }> = {
    completed: { tone: 'teal', label: 'ပြီးဆုံး' },
    partial: { tone: 'amber', label: 'တစ်စိတ်တစ်ပိုင်း' },
    failed: { tone: 'rose', label: 'မအောင်မြင်' },
};

const SAMPLE_CSV = 'title,category,price,level\nReact Hooks Masterclass,Web Development,95000,intermediate\nPython Data Analysis,Programming,110000,beginner\nFigma for Beginners,Design,40000,beginner\n';

export default function Index({ preview = null, result = null, history = [] }: Props) {
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [dismissedPreview, setDismissedPreview] = useState(false);
    const form = useForm({ file: null as File | null });

    const showPreview = preview && !dismissedPreview;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.file) return;
        setError('');
        setDismissedPreview(false);
        form.post('/admin/academy/import/preview', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => setNotice('CSV ဖတ်ပြီးပါပြီ — အောက်မှာ အစမ်းကြည့်ပြီး အတည်ပြုနိုင်ပါတယ်'),
            onError: (errs) => setError((errs.file as string) ?? 'ဖိုင် တင်ခြင်း မအောင်မြင်ပါ'),
        });
    };

    const confirm = () => {
        if (!preview) return;
        router.post(
            '/admin/academy/import/confirm',
            { token: preview.token },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotice('သွင်းပြီးပါပြီ — သင်တန်းများ page မှာ စစ်ဆေးနိုင်ပါတယ်');
                    setDismissedPreview(true);
                },
                onError: (errs) => setError((errs.file as string) ?? 'သွင်းခြင်း မအောင်မြင်ပါ'),
            },
        );
    };

    const downloadSample = () => {
        const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'courses-sample.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <LmsShell title="Bulk Import" nav="admin">
            <Head title="Bulk Import" />
            <PageIntro
                eyebrow="ADMIN"
                title="Bulk Import"
                description="CSV ဖိုင် တင်ပြီး သင်တန်းများ အစုလိုက် သွင်းပါ — အစမ်းကြည့်ပြီးမှ အတည်ပြုရပါတယ်"
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
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                        <FileUp className="size-5" /> သင်တန်းများ သွင်းရန်
                    </h2>
                    <form onSubmit={submit} className="mt-4 grid gap-4">
                        <div>
                            <label className={labelCls}>CSV ဖိုင် (အများဆုံး 2MB)</label>
                            <input
                                type="file"
                                accept=".csv,.txt"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                                required
                            />
                            {form.errors.file && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.file}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <button type="submit" className={btnAccentCls} disabled={form.processing || !form.data.file}>
                                <Upload className="size-4" /> တင်ပြီး အစမ်းကြည့်ရန်
                            </button>
                            <button type="button" className={btnGhostCls} onClick={downloadSample}>
                                <Download className="size-4" /> နမူနာ CSV ဒေါင်းလုဒ်
                            </button>
                        </div>
                        <p className={`text-[.8rem] leading-relaxed ${mutedCls}`}>
                            ကော်လံ — title, category, price, level (header ပါလည်း ရသည်၊ မပါလည်း ရသည်)။ Category အသစ်ဆိုရင် အလိုအလျောက် ဖန်တီးပေးပါတယ်။ ခေါင်းစဉ် မပါတဲ့ ကြောင်းတွေကို ကျော်ပါတယ်။ သွင်းထားသော
                            သင်တန်းများသည် မူကြမ်း (draft) အဖြစ် သိမ်းပါမယ်။
                        </p>
                    </form>

                    {showPreview && (
                        <div className="mt-5 rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className={`text-[.92rem] font-extrabold ${inkCls}`}>အစမ်းကြည့်မှု — {preview.filename}</p>
                                <Pill tone="teal">{preview.valid_rows} ကြောင်း အဆင်ပြေ</Pill>
                                <Pill tone="slate">စုစုပေါင်း {preview.total_rows} ကြောင်း</Pill>
                                {preview.errors.length > 0 && <Pill tone="amber">{preview.errors.length} အမှား</Pill>}
                            </div>
                            {preview.sample.length > 0 && (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-left text-[.8rem]">
                                        <thead>
                                            <tr className={mutedCls}>
                                                <th className="py-1 pr-3 font-bold">ခေါင်းစဉ်</th>
                                                <th className="py-1 pr-3 font-bold">Category</th>
                                                <th className="py-1 pr-3 font-bold">ဈေး</th>
                                                <th className="py-1 font-bold">Level</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.sample.map((r) => (
                                                <tr key={r.line} className={inkCls}>
                                                    <td className="py-1 pr-3 font-semibold">{r.title || '(ခေါင်းစဉ် မပါ)'}</td>
                                                    <td className="py-1 pr-3">{r.category || 'General'}</td>
                                                    <td className="py-1 pr-3">{r.price.toLocaleString()}</td>
                                                    <td className="py-1">{r.level}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {preview.errors.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {preview.errors.map((err, i) => (
                                        <li key={i} className="text-[.8rem] text-rose-600">
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2.5">
                                <button type="button" className={btnAccentCls} onClick={confirm} disabled={preview.valid_rows === 0}>
                                    <Upload className="size-4" /> {preview.valid_rows} သင်တန်း သွင်းရန် အတည်ပြုမည်
                                </button>
                                <button type="button" className={btnGhostCls} onClick={() => setDismissedPreview(true)}>
                                    ပယ်ဖျက်ရန်
                                </button>
                            </div>
                        </div>
                    )}
                </LmsCard>

                <SectionCard title="သွင်းမှု ရလဒ်">
                    {result ? (
                        <div className="rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className={`text-[.92rem] font-extrabold ${inkCls}`}>သင်တန်းများ</p>
                                <Pill tone="teal">{result.created} အောင်မြင်</Pill>
                                {result.skipped > 0 && <Pill tone="amber">{result.skipped} ကျော်သွား</Pill>}
                                {(result.failed ?? 0) > 0 && <Pill tone="rose">{result.failed} မအောင်မြင်</Pill>}
                                <span className={`ml-auto text-[.76rem] font-semibold ${mutedCls}`}>{result.date}</span>
                            </div>
                            {result.errors.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="text-[.8rem] text-rose-600">
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <p className={`text-sm ${mutedCls}`}>သွင်းမှု ရလဒ် မရှိသေးပါ — CSV တင်ပြီး အတည်ပြုရင် ဒီမှာ ရလဒ် ပေါ်လာပါမယ်။</p>
                    )}
                </SectionCard>
            </div>

            <div className="mt-5">
                <SectionCard title={`သွင်းမှု မှတ်တမ်း — ${history.length} ခု`}>
                    {history.length === 0 ? (
                        <p className={`text-sm ${mutedCls}`}>သွင်းမှု မှတ်တမ်း မရှိသေးပါ — ပထမဆုံး CSV သွင်းပြီးရင် ဒီမှာ ပေါ်လာပါမယ်။</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((h) => (
                                <div key={h.id} className="rounded-xl border border-slate-100 p-4 dark:border-[#18264a]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{h.filename}</p>
                                        <Pill tone={HISTORY_STATUS[h.status].tone}>{HISTORY_STATUS[h.status].label}</Pill>
                                        <span className={`ml-auto text-[.76rem] font-semibold ${mutedCls}`}>
                                            {h.imported_by ? `${h.imported_by} · ` : ''}
                                            {h.date}
                                        </span>
                                    </div>
                                    <p className={`mt-1.5 text-[.8rem] font-semibold ${mutedCls}`}>
                                        စုစုပေါင်း {h.rows_total} ကြောင်း · သွင်းပြီး {h.rows_imported} · ကျော်သွား {h.rows_skipped} · မအောင်မြင် {h.rows_failed}
                                    </p>
                                    {h.errors.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {h.errors.slice(0, 3).map((err, i) => (
                                                <li key={i} className="text-[.8rem] text-rose-600">
                                                    {err}
                                                </li>
                                            ))}
                                            {h.errors.length > 3 && <li className={`text-[.8rem] ${mutedCls}`}>… အမှား {h.errors.length - 3} ခု ကျန်သေးသည်</li>}
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

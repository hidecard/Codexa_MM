import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, EyeOff, Flag, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type ReportRow = { id: number; author: string; init: string; col: string; post: string; reason: string; reporter: string; date: string; status: 'pending' | 'hidden' | 'kept' | 'removed' };

// SAMPLE DATA fallback (prototype): no community report model exists yet.
const SAMPLE_REPORTS: ReportRow[] = [
    { id: 1, author: 'Anonymous User', init: 'AU', col: '#64748b', post: 'အပြင် link တွေ နှိပ်ကြည့်ပါ — အခမဲ့ သင်တန်း ရယူရန် ဒီ link ကို နှိပ်ပါ…', reason: 'Spam / ကြော်ငြာ link ပါဝင်သည်', reporter: 'May Thandar', date: 'နိုဝင်ဘာ 21', status: 'pending' },
    { id: 2, author: 'Zaw Min', init: 'ZM', col: '#f59e0b', post: 'ဒီ သင်တန်းက အလကား မဟုတ်ဘူး၊ ငွေ အလကား ဖြုန်းတာပဲ ဆိုတဲ့ မဟုတ်မမှန် စွပ်စွဲချက်များ…', reason: 'မဟုတ်မမှန် စွပ်စွဲချက်', reporter: 'Kaung Htet', date: 'နိုဝင်ဘာ 20', status: 'pending' },
    { id: 3, author: 'Thinzar', init: 'TH', col: '#ec4899', post: 'React သင်တန်းမှာ Hooks အခန်း အရမ်း ကောင်းပါတယ် — ဒါပေမယ့် comment မှာ ရန်ဖြစ်စကား ပါဝင်နေပါတယ်…', reason: 'မလျော်ကန်သော စကားလုံး', reporter: 'Thiri Nanda', date: 'နိုဝင်ဘာ 19', status: 'hidden' },
];

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စစ်ဆေးရန်</Pill>;
    if (status === 'hidden') return <Pill tone="slate">ဖျောက်ထား</Pill>;
    if (status === 'kept') return <Pill tone="teal">ထားရှိပြီး</Pill>;
    return <Pill tone="rose">ဖျက်ပြီး</Pill>;
}

export default function Index({ reports }: { reports?: ReportRow[] }) {
    const [items, setItems] = useState<ReportRow[]>(reports ?? SAMPLE_REPORTS);
    const [tab, setTab] = useState<'all' | 'pending' | 'hidden' | 'kept'>('all');
    const [notice, setNotice] = useState('');

    const pending = items.filter((r) => r.status === 'pending').length;
    const list = items.filter((r) => tab === 'all' || r.status === tab);

    const setStatus = (id: number, status: ReportRow['status']) => {
        setItems(items.map((r) => (r.id === id ? { ...r, status } : r)));
        setNotice('အခြေအနေ ပြောင်းပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    return (
        <LmsShell title="Community Moderation" nav="admin">
            <Head title="Community Moderation" />
            <PageIntro
                eyebrow="ADMIN"
                title="Community Moderation"
                description={`Report တင်ထားတဲ့ post တွေကို စစ်ဆေးပါ — ဖျောက်ရင် Community ကနေ ချက်ချင်း ပျောက်သွားပါတယ် · စစ်ဆေးရန် ကျန်ရှိ ${pending} ခု`}
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                    အားလုံး
                </Chip>
                <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>
                    စစ်ဆေးရန်
                </Chip>
                <Chip active={tab === 'hidden'} onClick={() => setTab('hidden')}>
                    ဖျောက်ထား
                </Chip>
                <Chip active={tab === 'kept'} onClick={() => setTab('kept')}>
                    ထားရှိပြီး
                </Chip>
            </div>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ အခြေအနေမှာ report မရှိပါ" description="Report အသစ် ဝင်ရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((r) => (
                        <LmsCard key={r.id} className={`p-5 ${r.status === 'hidden' || r.status === 'removed' ? 'opacity-60' : ''}`}>
                            <div className="flex flex-wrap items-start gap-3.5">
                                <Avatar init={r.init} color={r.col} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.93rem] font-extrabold ${inkCls}`}>{r.author}</p>
                                        {statusPill(r.status)}
                                        <span className={`flex items-center gap-1 text-[.74rem] font-semibold ${mutedCls}`}>
                                            <Flag className="size-3" /> {r.reporter} က report လုပ်ထား · {r.date}
                                        </span>
                                    </div>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{r.post}</p>
                                    <p className="mt-1.5 text-[.8rem] font-bold text-rose-600">Report အကြောင်းရင်း — {r.reason}</p>
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    {r.status === 'pending' && (
                                        <>
                                            <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'kept')}>
                                                <Check className="size-4" /> ပြဿနာ မရှိ
                                            </button>
                                            <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'hidden')}>
                                                <EyeOff className="size-4" /> ဖျောက်ရန်
                                            </button>
                                        </>
                                    )}
                                    {r.status !== 'removed' && (
                                        <button type="button" className={btnGhostCls} onClick={() => setStatus(r.id, 'removed')}>
                                            <Trash2 className="size-4" /> ဖျက်ရန်
                                        </button>
                                    )}
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

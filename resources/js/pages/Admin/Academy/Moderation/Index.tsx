import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, Eye, EyeOff, Flag, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, Pill, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';

// Moderation covers course reviews only: reviews that are hidden or awaiting
// approval. There is no community-post model yet, so community-post
// moderation is out of scope.
type ReportRow = { id: number; author: string; init: string; col: string; post: string; course: string; reason: string; reporter: string; date: string; status: 'pending' | 'hidden' | 'kept' | 'removed' };

function statusPill(status: string) {
    if (status === 'pending') return <Pill tone="amber">စစ်ဆေးရန်</Pill>;
    if (status === 'hidden') return <Pill tone="slate">ဖျောက်ထား</Pill>;
    if (status === 'kept') return <Pill tone="teal">ထားရှိပြီး</Pill>;
    return <Pill tone="rose">ဖျက်ပြီး</Pill>;
}

export default function Index({ reports = [] }: { reports?: ReportRow[] }) {
    const [tab, setTab] = useState<'all' | 'pending' | 'hidden' | 'kept'>('all');
    const [notice, setNotice] = useState('');

    const pending = reports.filter((r) => r.status === 'pending').length;
    const list = reports.filter((r) => tab === 'all' || r.status === tab);

    const approve = (id: number) => {
        router.post(`/admin/academy/moderation/${id}/approve`, {}, { preserveScroll: true, onSuccess: () => setNotice('Review ကို အတည်ပြုပြီး ထားရှိပါပြီ') });
    };
    const hide = (id: number) => {
        router.post(`/admin/academy/moderation/${id}/hide`, {}, { preserveScroll: true, onSuccess: () => setNotice('Review ကို ဖျောက်ထားပြီးပါပြီ') });
    };
    const remove = (id: number) => {
        if (confirm('ဒီ review ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/moderation/${id}`, { preserveScroll: true, onSuccess: () => setNotice('Review ကို ဖျက်ပြီးပါပြီ') });
        }
    };

    return (
        <LmsShell title="Community Moderation" nav="admin">
            <Head title="Community Moderation" />
            <PageIntro
                eyebrow="ADMIN"
                title="Community Moderation"
                description={`စစ်ဆေးရန် လိုတဲ့ review တွေကို ကြည့်ပါ — ဖျောက်ရင် သင်တန်းမှာ ချက်ချင်း ပျောက်သွားပါတယ် · စစ်ဆေးရန် ကျန်ရှိ ${pending} ခု`}
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
                                            <Flag className="size-3" /> {r.course} · {r.date}
                                        </span>
                                    </div>
                                    <p className={`mt-1.5 text-[.88rem] leading-relaxed ${mutedCls}`}>{r.post}</p>
                                    <p className="mt-1.5 text-[.8rem] font-bold text-rose-600">Report အကြောင်းရင်း — {r.reason}</p>
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    {r.status === 'pending' && (
                                        <>
                                            <button type="button" className={btnGhostCls} onClick={() => approve(r.id)}>
                                                <Check className="size-4" /> ပြဿနာ မရှိ
                                            </button>
                                            <button type="button" className={btnGhostCls} onClick={() => hide(r.id)}>
                                                <EyeOff className="size-4" /> ဖျောက်ရန်
                                            </button>
                                        </>
                                    )}
                                    {r.status === 'hidden' && (
                                        <button type="button" className={btnGhostCls} onClick={() => approve(r.id)}>
                                            <Eye className="size-4" /> ပြန်ပြရန်
                                        </button>
                                    )}
                                    {r.status !== 'removed' && (
                                        <button type="button" className={btnGhostCls} onClick={() => remove(r.id)}>
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

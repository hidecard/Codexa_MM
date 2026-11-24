import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat, formatNumber } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES } from '@/pages/Admin/Academy/_sample';

type AdminCourse = {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived' | 'review';
    pricing_type: string;
    price: number;
    level: string;
    category?: string | null;
    instructor?: string | null;
    modules_count?: number;
    lessons_count?: number;
    enrollments_count?: number;
    rating?: number;
};

function statusPill(status: string) {
    if (status === 'published') return <Pill tone="teal">PUBLISHED</Pill>;
    if (status === 'review') return <Pill tone="violet">REVIEW လိုအပ်</Pill>;
    if (status === 'archived') return <Pill tone="slate">ARCHIVED</Pill>;
    return <Pill tone="amber">DRAFT</Pill>;
}

export default function Index({ courses }: { courses?: AdminCourse[] }) {
    // SAMPLE DATA fallback (prototype): used until Admin/Academy/CourseController is wired.
    const list: AdminCourse[] =
        courses ??
        SAMPLE_COURSES.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            status: c.status,
            pricing_type: 'paid',
            price: c.price,
            level: c.level,
            category: c.cat,
            instructor: c.instructor,
            modules_count: Math.max(1, Math.round(c.lessons / 10)),
            lessons_count: c.lessons,
            enrollments_count: c.students,
            rating: c.rating,
        }));
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'review'>('all');
    const [showForm, setShowForm] = useState(false);
    const [notice, setNotice] = useState('');

    const filtered = list.filter((c) => {
        if (tab !== 'all' && c.status !== tab) return false;
        if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="သင်တန်း စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="သင်တန်း စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="သင်တန်း စီမံခန့်ခွဲမှု"
                description="သင်တန်းအားလုံးကို publish / draft စီမံရန်၊ အသစ် ထည့်ရန်နဲ့ ဝင်ငွေ ကြည့်ရန်"
                actions={
                    <button type="button" className={btnAccentCls} onClick={() => setShowForm(!showForm)}>
                        <Plus className="size-4" /> သင်တန်း အသစ် ထည့်ရန်
                    </button>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            {showForm && (
                <LmsCard className="mt-6 p-5">
                    <h2 className={`text-[1.05rem] font-extrabold ${inkCls}`}>သင်တန်း အသစ် ထည့်ရန်</h2>
                    <p className={`mt-1 text-sm ${mutedCls}`}>အခြေခံ အချက်အလက်တွေ ဖြည့်ပြီး စာရင်းထဲ ထည့်နိုင်ပါတယ် — အသေးစိတ် သင်ရိုးကို နောက်မှ ဆက်ဖြည့်နိုင်ပါတယ်</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <input className={inputCls} placeholder="သင်တန်း အမည်" />
                        <select className={inputCls}>
                            <option>Thura Aung</option>
                            <option>May Thazin</option>
                            <option>Kaung Htet Oo</option>
                            <option>Aung Khant</option>
                            <option>Su Myat Noe</option>
                            <option>Nilar Win</option>
                        </select>
                        <select className={inputCls}>
                            <option>Web Development</option>
                            <option>Programming</option>
                            <option>Backend</option>
                            <option>Mobile</option>
                            <option>Design</option>
                            <option>Tools</option>
                        </select>
                        <input className={inputCls} type="number" placeholder="ဈေးနှုန်း (ကျပ်)" />
                    </div>
                    <button type="button" className={`${btnAccentCls} mt-4`} onClick={() => setNotice('သင်တန်း ထည့်ခြင်း — admin course store endpoint မရှိသေးပါ။ Instructor ဘက်က ဖန်တီးတဲ့ သင်တန်းတွေကို ဒီမှာ စီမံနိုင်ပါတယ်။')}>
                        Draft အဖြစ် ထည့်ရန်
                    </button>
                </LmsCard>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input className={`${inputCls} pl-9`} placeholder="သင်တန်း ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip active={tab === 'all'} onClick={() => setTab('all')}>
                        အားလုံး
                    </Chip>
                    <Chip active={tab === 'published'} onClick={() => setTab('published')}>
                        Published
                    </Chip>
                    <Chip active={tab === 'draft'} onClick={() => setTab('draft')}>
                        Draft
                    </Chip>
                    <Chip active={tab === 'review'} onClick={() => setTab('review')}>
                        Review လိုအပ်
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>သင်တန်း {formatNumber(filtered.length)} ခု</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ကိုက်ညီတဲ့ သင်တန်း မတွေ့ပါ" description="Filter သို့မဟုတ် ရှာဖွေမှု ပြောင်းပြီး ပြန်ကြည့်ပါ" />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((c) => (
                        <LmsCard key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <div className="grid size-[92px] flex-none place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 font-mono text-xl font-bold text-white">
                                {c.title.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{c.title}</p>
                                    {statusPill(c.status)}
                                </div>
                                <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                    {c.category ?? ''} · {c.level} · {c.instructor ?? ''} · သင်ခန်းစာ {c.lessons_count ?? 0} ခု · ကျောင်းသား {formatNumber(c.enrollments_count ?? 0)} ဦး
                                    {c.rating ? ` · Rating ${c.rating}` : ''}
                                </p>
                                <p className={`mt-1 text-[.84rem] font-bold ${inkCls}`}>
                                    {c.pricing_type === 'free' ? 'အခမဲ့' : formatKyat(c.price)} · ဝင်ငွေ {formatKyat(c.price * (c.enrollments_count ?? 0))}
                                </p>
                            </div>
                            <div className="flex flex-none flex-wrap gap-2">
                                <Link href={`/courses/${c.slug}`} className={btnGhostCls}>
                                    <Eye className="size-4" /> ကြည့်ရန်
                                </Link>
                                <Link href="/admin/academy/curriculum" className={btnGhostCls}>
                                    <Pencil className="size-4" /> သင်ရိုး
                                </Link>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

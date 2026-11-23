import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatKyat, formatNumber } from '@/lib/format';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Course = {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    pricing_type: 'free' | 'paid' | 'package';
    level: string;
    price?: number | string | null;
    modules_count: number;
    enrollments_count?: number;
    updated_at?: string;
    category?: { id: number; name: string } | null;
};

function statusPill(status: Course['status']) {
    if (status === 'published') return <Pill tone="teal">PUBLISHED</Pill>;
    if (status === 'archived') return <Pill tone="slate">ARCHIVED</Pill>;
    return <Pill tone="amber">DRAFT</Pill>;
}

export default function Index({ courses = [] }: { courses: Course[] }) {
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

    const destroy = (id: number) => {
        if (confirm('ဒီ သင်တန်းကို ဖျက်မှာ သေချာပါသလား?')) router.delete(`/instructor/courses/${id}`);
    };

    const filtered = courses.filter((c) => {
        if (tab !== 'all' && c.status !== tab) return false;
        if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="ဆရာ၏ သင်တန်းများ" nav="instructor">
            <Head title="ဆရာ၏ သင်တန်းများ" />
            <PageIntro
                title="ဆရာ၏ သင်တန်းများ"
                description="သင် သင်ကြားတဲ့ သင်တန်းများ — အသစ် ဖန်တီးရင် Catalog နဲ့ Admin သင်တန်း စီမံရန် နှစ်ခုလုံးမှာ ပေါ်ပါတယ်"
                actions={
                    <Link href="/instructor/courses/create" className={btnAccentCls}>
                        <Plus className="size-4" /> သင်တန်း အသစ် ဖန်တီးရန်
                    </Link>
                }
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                    <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                    <input
                        className={`${inputCls} pl-9`}
                        placeholder="သင်တန်း ရှာရန်…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
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
                    <Chip active={tab === 'archived'} onClick={() => setTab('archived')}>
                        Archived
                    </Chip>
                </div>
                <p className={`ml-auto text-sm font-semibold ${mutedCls}`}>သင်တန်း {formatNumber(filtered.length)} ခု</p>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox
                        title="သင်တန်း မရှိသေးပါ"
                        description="သင်တန်း အသစ် ဖန်တီးပြီး သင်ရိုးကို Curriculum Builder မှာ ပြင်နိုင်ပါတယ်။"
                    />
                </div>
            ) : (
                <div className="mt-6 space-y-3.5">
                    {filtered.map((course) => {
                        const price = Number(course.price ?? 0);
                        const students = course.enrollments_count ?? 0;
                        const revenue = price * students;
                        return (
                            <LmsCard key={course.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                <div className="grid size-[92px] flex-none place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 font-mono text-xl font-bold text-white">
                                    {course.title.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{course.title}</p>
                                        {statusPill(course.status)}
                                    </div>
                                    <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                        {course.category?.name ?? 'Uncategorized'} · {course.level} · Module {course.modules_count} ခု · ကျောင်းသား{' '}
                                        {formatNumber(students)} ဦး
                                    </p>
                                    <p className={`mt-1 text-[.84rem] font-bold ${inkCls}`}>
                                        {course.pricing_type === 'free' ? 'အခမဲ့ သင်တန်း' : `ဈေးနှုန်း ${formatKyat(price)}`}
                                        {revenue > 0 && (
                                            <>
                                                {' '}· ဝင်ငွေ {formatKyat(revenue)} · ခွဲဝေငွေ{' '}
                                                <span className="text-teal-700 dark:text-teal-300">{formatKyat(Math.round(revenue * 0.5))}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-none flex-wrap gap-2">
                                    <Link href={`/courses/${course.slug}`} className={btnGhostCls}>
                                        <Eye className="size-4" /> ကြည့်ရန်
                                    </Link>
                                    <Link href={`/instructor/courses/${course.id}/edit`} className={btnGhostCls}>
                                        <Pencil className="size-4" /> သင်ရိုး ပြင်ရန်
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => destroy(course.id)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-[#0d1730] dark:hover:bg-rose-950/40"
                                    >
                                        <Trash2 className="size-4" /> ဖျက်ရန်
                                    </button>
                                </div>
                            </LmsCard>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

import { useEffect, useState, type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import { MessageSquareText, Star } from 'lucide-react';

type Review = {
    id: number;
    rating: number;
    comment?: string | null;
    is_approved?: boolean;
    created_at?: string | null;
    course?: { id: number; title: string; slug: string } | null;
};

type EnrolledCourse = {
    id: number;
    title: string;
    slug: string;
    review?: { id: number; rating: number; comment?: string | null } | null;
};

type Props = {
    reviews?: Review[];
    enrolledCourses?: EnrolledCourse[];
    flash?: { success?: string | null };
};

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`size-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
        </span>
    );
}

export default function Index({ reviews = [], enrolledCourses = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        course_id: enrolledCourses[0]?.id ?? 0,
        rating: 5,
        comment: '',
    });

    const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

    // Prefill the form with the existing review for the selected course.
    useEffect(() => {
        const selected = enrolledCourses.find((c) => c.id === data.course_id);
        if (selected?.review) {
            setData('rating', selected.review.rating);
            setData('comment', selected.review.comment ?? '');
        } else {
            setData('rating', 5);
            setData('comment', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.course_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.course_id) return;
        post('/student/reviews', {
            onSuccess: () => setShowForm(false),
        });
    };

    const selectedHasReview = enrolledCourses.find((c) => c.id === data.course_id)?.review;

    return (
        <LmsShell title="ကျွန်ုပ်၏ သုံးသပ်ချက်များ" nav="student">
            <Head title="My Reviews" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ကျွန်ုပ်၏ သုံးသပ်ချက်များ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သုံးသပ်ချက် {reviews.length} ခု · ပျမ်းမျှ အဆင့်သတ်မှတ်ချက် {avg}/5</p>
                </div>
                {enrolledCourses.length > 0 && (
                    <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                        <MessageSquareText className="size-4" /> သုံးသပ်ချက် ရေးရန်
                    </button>
                )}
            </div>

            {flash?.success && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                    {flash.success}
                </div>
            )}

            {showForm && (
                <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">သုံးသပ်ချက် ရေးရန်</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">သင်တန်း</span>
                            <select value={data.course_id} onChange={(e) => setData('course_id', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {enrolledCourses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                        {c.review ? ' (ရေးပြီးသား — ပြင်ဆင်ရန်)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.course_id && <p className="mt-1 text-xs text-rose-600">{errors.course_id}</p>}
                        </label>
                        <div>
                            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">အဆင့်သတ်မှတ်ချက်</span>
                            <div className="flex gap-1 py-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <button key={i} type="button" onClick={() => setData('rating', i)} aria-label={`${i} ကြယ်`}>
                                        <Star className={`size-7 ${i <= data.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                    </button>
                                ))}
                            </div>
                            {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating}</p>}
                        </div>
                    </div>
                    <label className="mt-3 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">မှတ်ချက်</span>
                        <textarea value={data.comment} onChange={(e) => setData('comment', e.target.value)} rows={3} placeholder="သင်တန်းအကြောင်း ရေးပါ…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        {errors.comment && <p className="mt-1 text-xs text-rose-600">{errors.comment}</p>}
                    </label>
                    {selectedHasReview && <p className="mt-2 text-xs text-amber-600">ဤသင်တန်းအတွက် သုံးသပ်ချက် ရေးပြီးသားဖြစ်သည် — ပြန်တင်လျှင် အသစ်ဖြင့် အစားထိုးပြီး အတည်ပြုရန် ပြန်စောင့်ရမည်။</p>}
                    <div className="mt-4 flex gap-2">
                        <button type="submit" disabled={processing || !data.course_id} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                            {selectedHasReview ? 'ပြင်ဆင်မှု တင်ပြရန်' : 'သုံးသပ်ချက် တင်ပြရန်'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            ပယ်ဖျက်ရန်
                        </button>
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<MessageSquareText className="size-10" />}
                    title="သုံးသပ်ချက် မရှိသေးပါ"
                    description="သင်တန်း ပြီးစီးပြီးနောက် သုံးသပ်ချက် ရေးနိုင်ပါသည်။"
                    action={<Link href="/student/my-courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4">
                    {reviews.map((r) => {
                        const approved = r.is_approved ?? false;
                        const title = r.course?.title ?? 'သင်တန်း';
                        const slug = r.course?.slug;
                        return (
                            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(r.created_at)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Stars n={r.rating} />
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${approved ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                            {approved ? 'ထုတ်ဝေပြီးပါပြီ' : 'အတည်ပြုရန် စောင့်နေသည်'}
                                        </span>
                                    </div>
                                </div>
                                {r.comment && <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{r.comment}</p>}
                                {slug && <Link href={`/courses/${slug}`} className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">သင်တန်း ကြည့်ရန် →</Link>}
                            </article>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

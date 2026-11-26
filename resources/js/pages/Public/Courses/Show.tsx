import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Award, BookOpen, CheckCircle2, ChevronDown, Clock3, Flag, GraduationCap, Infinity as InfinityIcon, Play, ShoppingCart, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { formatKyat } from '@/lib/format';
import { categoryMeta, formatCount, initials, instructorInfo } from '@/lib/ui-utils';

type Module = {
    id: number;
    title: string;
    description?: string | null;
    position: number;
    lessons?: { id: number; title: string; duration: number; type: string; is_free: boolean }[];
};

type Course = {
    id?: number;
    title: string;
    slug: string;
    description?: string | null;
    short_description?: string | null;
    level: string;
    duration: number;
    price: string;
    sale_price?: string | null;
    pricing_type: 'free' | 'paid' | 'package';
    thumbnail?: string | null;
    packages?: { id: number; name: string; price: string; sale_price?: string | null }[];
    outcomes?: string[] | null;
    category?: { name: string } | null;
    instructor?: { id?: number; name: string } | null;
    instructors?: { id?: number; name: string }[];
    modules: Module[];
    announcements?: { id: number; title: string; content: string }[];
    reviews?: { id: number; rating: number; comment?: string | null; student?: { name: string } }[];
};

type Props = {
    course: Course;
    enrollment?: { id: number; status: string } | null;
    canEnroll?: boolean;
    canReview?: boolean;
    myReview?: { id: number; rating: number; comment?: string | null; is_approved: boolean } | null;
};

type SharedProps = { auth?: { user?: { id: number; name: string } | null } };

export default function Show({ course, enrollment = null, canEnroll = false, canReview = false, myReview = null }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isGuest = !auth?.user;
    const [openModule, setOpenModule] = useState<number | null>(course.modules[0]?.id ?? null);
    const [cartAdded, setCartAdded] = useState(false);
    const [rating, setRating] = useState(myReview?.rating ?? 5);
    const [comment, setComment] = useState(myReview?.comment ?? '');
    const [reviewSent, setReviewSent] = useState(false);
    const [reportingId, setReportingId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [reportNotice, setReportNotice] = useState('');

    const submitReport = (reviewId: number) => {
        if (!reportReason.trim()) return;
        router.post(`/student/reviews/${reviewId}/report`, { reason: reportReason.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setReportingId(null); setReportReason(''); setReportNotice('Report တင်ပြီးပါပြီ — Admin အဖွဲ့က စစ်ဆေးပါမယ်'); },
        });
    };

    const price = course.sale_price ?? course.price;
    const hasDiscount = course.sale_price != null && Number(course.sale_price) < Number(course.price);
    const pricingLabel =
        course.pricing_type === 'free' ? 'အခမဲ့ သင်တန်း' : course.pricing_type === 'package' ? 'Package မှာ ပါဝင်ပါတယ်' : 'တစ်ခါဝယ် · အမြဲတမ်း ကြည့်နိုင်ပါတယ်';
    const instructorNames = Array.from(
        new Set([course.instructor?.name, ...(course.instructors ?? []).map((i) => i.name)].filter((n): n is string => Boolean(n))),
    );
    const mainInstructor = course.instructor?.name ?? instructorNames[0];
    const info = instructorInfo(mainInstructor);
    const meta = categoryMeta(course.category?.name);

    const totalLessons = course.modules.reduce((s, m) => s + (m.lessons?.length ?? 0), 0);
    const totalMinutes = course.modules.reduce((s, m) => s + (m.lessons ?? []).reduce((ls, l) => ls + (l.duration ?? 0), 0), 0);
    const avgRating =
        course.reviews && course.reviews.length > 0 ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length : null;

    const enroll = () => router.post(`/student/courses/${course.slug}/enroll`);

    const addToCart = () => {
        if (!course.id) return;
        router.post('/student/cart', { course_id: course.id }, { preserveScroll: true, onSuccess: () => setCartAdded(true) });
    };

    const submitReview = () => {
        if (!course.id) return;
        router.post(
            '/student/reviews',
            { course_id: course.id, rating, comment: comment.trim() || null },
            { preserveScroll: true, onSuccess: () => setReviewSent(true) },
        );
    };

    return (
        <PublicLayout>
            <Head title={course.title} />
            {/* Hero */}
            <section className="text-white" style={{ background: 'linear-gradient(150deg,#0b2a4a,#07332e)' }}>
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-teal-200 hover:text-white">
                        <ArrowLeft className="size-4" /> သင်တန်း အားလုံး
                    </Link>
                    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                {course.category && (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{course.category.name}</span>
                                )}
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{course.level}</span>
                                {avgRating != null && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {avgRating.toFixed(1)} · သုံးသပ်ချက် {course.reviews?.length ?? 0} ခု
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{course.title}</h1>
                            <p className="mt-4 text-base leading-relaxed text-teal-100/90">{course.short_description ?? course.description}</p>
                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-teal-100/90">
                                <span className="inline-flex items-center gap-2">
                                    <GraduationCap className="size-4 text-teal-300" /> {course.level}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Clock3 className="size-4 text-teal-300" /> {course.duration} နာရီ
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <BookOpen className="size-4 text-teal-300" /> သင်ခန်းစာ {totalLessons} ခု
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Users className="size-4 text-teal-300" /> ဆရာ: {instructorNames.length ? instructorNames.join(', ') : 'TBA'}
                                </span>
                            </div>
                        </div>
                        <div className="hidden overflow-hidden rounded-2xl lg:block" style={{ background: meta.grad }}>
                            <div className="grid aspect-[4/3] place-items-center">
                                <span className="font-mono text-5xl font-bold text-white/95" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                    {meta.glyph}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-12">
                <div className="min-w-0">
                    {course.description && (
                        <section className="rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">သင်တန်း အကြောင်း</h2>
                            <p className="mt-4 whitespace-pre-line leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">{course.description}</p>
                        </section>
                    )}

                    {course.outcomes && course.outcomes.length > 0 && (
                        <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">ဘာတွေ တတ်မြောက်မလဲ</h2>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                {course.outcomes.map((outcome) => (
                                    <div key={outcome} className="flex gap-3 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal-600 dark:text-teal-300" />
                                        <span>{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-extrabold">သင်ရိုးညွှန်းတမ်း</h2>
                            <span className="text-sm font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                အခန်း {course.modules.length} ခု · သင်ခန်းစာ {totalLessons} ခု
                                {totalMinutes > 0 ? ` · ${Math.floor(totalMinutes / 60)} နာရီ ${totalMinutes % 60} မိနစ်` : ''}
                            </span>
                        </div>
                        {course.modules.length === 0 ? (
                            <p className="mt-5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">သင်ရိုးညွှန်းတမ်း မကြာမီ ထွက်ရှိပါမယ်။</p>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {course.modules.map((module, mi) => (
                                    <div key={module.id} className="overflow-hidden rounded-xl ring-1 ring-[#e7ecf5] dark:ring-[#18264a]">
                                        <button
                                            type="button"
                                            onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                                            className="flex w-full items-center gap-3 bg-[#eef3fb] px-4 py-3.5 text-left dark:bg-[#12234a]"
                                        >
                                            <span className="grid size-8 flex-none place-items-center rounded-lg bg-teal-600 text-sm font-extrabold text-white">
                                                {mi + 1}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-bold">{module.title}</span>
                                                <span className="block text-xs text-[#5a6a8a] dark:text-[#97a6c6]">သင်ခန်းစာ {module.lessons?.length ?? 0} ခု</span>
                                            </span>
                                            <ChevronDown className={`size-4 flex-none text-[#8494b3] transition-transform dark:text-[#67779c] ${openModule === module.id ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openModule === module.id && (
                                            <div className="divide-y divide-[#e7ecf5] dark:divide-[#18264a]">
                                                {module.description && (
                                                    <p className="px-4 pt-3 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{module.description}</p>
                                                )}
                                                {(module.lessons ?? []).map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                                                        <span className="flex min-w-0 items-center gap-2.5">
                                                            <Play className="size-3.5 flex-none text-teal-600 dark:text-teal-300" />
                                                            <span className="truncate">{lesson.title}</span>
                                                        </span>
                                                        <span className="flex-none text-xs font-semibold text-[#8494b3] dark:text-[#67779c]">
                                                            {lesson.is_free ? (
                                                                <span className="rounded-full bg-teal-500/10 px-2 py-0.5 font-bold text-teal-700 dark:text-teal-300">အခမဲ့ ကြည့်ရန်</span>
                                                            ) : (
                                                                `${lesson.duration} မိနစ်`
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                                {(module.lessons ?? []).length === 0 && (
                                                    <p className="px-4 py-3 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ဒီ အခန်းမှာ သင်ခန်းစာ မရှိသေးပါ</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href={`/courses/${course.slug}/curriculum`} className="mt-5 inline-block text-sm font-bold text-teal-700 dark:text-teal-300">
                            သင်ရိုးညွှန်းတမ်း အပြည့်အစုံ ကြည့်ရန် →
                        </Link>
                    </section>

                    {/* Instructor card */}
                    {mainInstructor && (
                        <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">သင်ကြားပေးမည့် ဆရာ</h2>
                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                                <span className="grid size-16 flex-none place-items-center rounded-2xl text-base font-extrabold text-white" style={{ background: info.grad }}>
                                    {initials(mainInstructor)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold">{mainInstructor}</h3>
                                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{info.role}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{info.bio}</p>
                                    {course.instructor?.id && (
                                        <Link
                                            href={`/instructors/${course.instructor.id}`}
                                            className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                        >
                                            Instructor အသေးစိတ်
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {course.announcements && course.announcements.length > 0 && (
                        <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">သင်တန်း အပ်ဒိတ်များ</h2>
                            <div className="mt-5 space-y-4">
                                {course.announcements.map((a) => (
                                    <article key={a.id} className="border-l-2 border-teal-500 pl-4">
                                        <h3 className="font-bold">{a.title}</h3>
                                        <p className="mt-1 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">{a.content}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {course.reviews && course.reviews.length > 0 && (
                        <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">ကျောင်းသားများ၏ သုံးသပ်ချက်များ</h2>
                            {reportNotice && (
                                <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                                    {reportNotice}
                                </p>
                            )}
                            <div className="mt-5 space-y-4">
                                {course.reviews.map((review) => (
                                    <blockquote key={review.id} className="rounded-2xl bg-[#eef3fb] p-4 dark:bg-[#12234a]">
                                        <p className="flex items-center gap-1 font-bold text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`size-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                            ))}
                                        </p>
                                        {review.comment && <p className="mt-2 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">“{review.comment}”</p>}
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <cite className="block text-sm font-semibold not-italic text-[#8494b3] dark:text-[#67779c]">
                                                {review.student?.name ?? 'Codexa ကျောင်းသား'}
                                            </cite>
                                            {!isGuest && (
                                                <button type="button" onClick={() => { setReportingId(reportingId === review.id ? null : review.id); setReportReason(''); }} className="inline-flex items-center gap-1 text-xs font-bold text-[#8494b3] hover:text-rose-600 dark:text-[#67779c]">
                                                    <Flag className="size-3.5" /> Report
                                                </button>
                                            )}
                                        </div>
                                        {reportingId === review.id && (
                                            <div className="mt-3 flex gap-2">
                                                <input
                                                    value={reportReason}
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                    placeholder="Report အကြောင်းရင်း ရေးပါ…"
                                                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                                />
                                                <button type="button" onClick={() => submitReport(review.id)} disabled={!reportReason.trim()} className="shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">
                                                    တင်ရန်
                                                </button>
                                            </div>
                                        )}
                                    </blockquote>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Review form — enrolled students only, one review per course. */}
                    {canReview && (
                        <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-7">
                            <h2 className="text-xl font-extrabold">{myReview ? 'သင့် သုံးသပ်ချက် ပြင်ဆင်ရန်' : 'သုံးသပ်ချက် ရေးရန်'}</h2>
                            {reviewSent && (
                                <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                                    သုံးသပ်ချက် တင်ပြီးပါပြီ — အတည်ပြုပြီးတာနဲ့ ပေါ်လာပါမယ်။
                                </p>
                            )}
                            {myReview && !reviewSent && (
                                <p className="mt-4 text-sm font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                    {myReview.is_approved ? 'သင့် သုံးသပ်ချက်ကို အတည်ပြုပြီးပါပြီ — ပြန်ပြင်နိုင်ပါတယ်။' : 'သင့် သုံးသပ်ချက်ကို အတည်ပြုရန် စောင့်နေပါတယ် — ပြန်ပြင်နိုင်ပါတယ်။'}
                                </p>
                            )}
                            <div className="mt-4 flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setRating(i + 1)}
                                        aria-label={`${i + 1} stars`}
                                        className="rounded p-0.5"
                                    >
                                        <Star className={`size-7 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-bold text-[#5a6a8a] dark:text-[#97a6c6]">{rating} / 5</span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                maxLength={2000}
                                placeholder="ဒီ သင်တန်းအကြောင်း ဘယ်လို ထင်ပါသလဲ…"
                                className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                            />
                            <button
                                type="button"
                                onClick={submitReview}
                                className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                            >
                                {myReview ? 'သုံးသပ်ချက် ပြင်ဆင်ရန်' : 'သုံးသပ်ချက် တင်ရန်'}
                            </button>
                            <p className="mt-2 text-xs text-[#8494b3] dark:text-[#67779c]">သုံးသပ်ချက်ကို admin အတည်ပြုပြီးမှ အများပြည်သူ မြင်ရပါမယ်။</p>
                        </section>
                    )}
                </div>

                {/* Price / enroll card */}
                <aside className="h-fit rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:shadow-none lg:sticky lg:top-24 sm:p-7">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8494b3] dark:text-[#67779c]">သင်တန်းကြေး</p>
                    <p className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold">
                            {course.pricing_type === 'free' ? 'အခမဲ့' : course.pricing_type === 'package' ? 'Package' : formatKyat(Number(price))}
                        </span>
                        {hasDiscount && <span className="text-sm font-semibold text-[#8494b3] line-through dark:text-[#67779c]">{formatKyat(Number(course.price))}</span>}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-300">{pricingLabel}</p>
                    {course.pricing_type === 'package' &&
                        course.packages?.map((pkg) => (
                            <p key={pkg.id} className="mt-3 rounded-xl bg-teal-500/10 p-3 text-sm leading-6 text-teal-800 dark:text-teal-200">
                                <strong>{pkg.name}</strong> package မှာ {formatKyat(Number(pkg.sale_price ?? pkg.price))} ဖြင့် ပါဝင်ပါတယ်။
                            </p>
                        ))}

                    <ul className="mt-5 space-y-2.5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                        <li className="flex items-center gap-2.5">
                            <InfinityIcon className="size-4 flex-none text-teal-600 dark:text-teal-300" /> Lifetime access
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Award className="size-4 flex-none text-teal-600 dark:text-teal-300" /> ပြီးဆုံးရင် လက်မှတ် ရရှိမည်
                        </li>
                        <li className="flex items-center gap-2.5">
                            <BookOpen className="size-4 flex-none text-teal-600 dark:text-teal-300" /> သင်ခန်းစာ {formatCount(totalLessons)} ခု · Assignment ပါဝင်
                        </li>
                    </ul>

                    {enrollment ? (
                        <>
                            <p className="mt-5 text-sm leading-6 text-[#5a6a8a] dark:text-[#97a6c6]">
                                {enrollment.status === 'active' || enrollment.status === 'completed'
                                    ? 'သင် ဒီ သင်တန်းကို တက်ရောက်ခွင့် ရှိပါပြီ။'
                                    : 'စာရင်းသွင်းမှု အတည်ပြုရန် စောင့်ဆိုင်းနေပါတယ်။'}
                            </p>
                            {enrollment.status === 'active' || enrollment.status === 'completed' ? (
                                <Link
                                    href={`/student/courses/${course.id}/learn`}
                                    className="mt-5 block rounded-xl bg-teal-600 px-5 py-3.5 text-center font-bold text-white transition hover:bg-teal-700"
                                >
                                    ဆက်လက် သင်ယူရန်
                                </Link>
                            ) : (
                                <Link
                                    href="/student/my-courses"
                                    className="mt-5 block rounded-xl bg-[#0d1730] px-5 py-3.5 text-center font-bold text-white transition hover:bg-[#1e2c52]"
                                >
                                    စာရင်းသွင်းမှု ကြည့်ရန်
                                </Link>
                            )}
                        </>
                    ) : isGuest ? (
                        <>
                            <p className="mt-5 text-sm leading-6 text-[#5a6a8a] dark:text-[#97a6c6]">အကောင့် ဖွင့်ပြီး စာရင်းသွင်းကာ တိုးတက်မှုကို မှတ်တမ်းတင်ပါ။</p>
                            <Link href="/register" className="mt-5 block rounded-xl bg-teal-600 px-5 py-3.5 text-center font-bold text-white transition hover:bg-teal-700">
                                အကောင့် ဖွင့်ရန်
                            </Link>
                            <Link
                                href="/login"
                                className="mt-3 block rounded-xl px-5 py-3 text-center font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                            >
                                Login ဝင်ရန်
                            </Link>
                        </>
                    ) : canEnroll ? (
                        <>
                            <p className="mt-5 text-sm leading-6 text-[#5a6a8a] dark:text-[#97a6c6]">
                                {course.pricing_type === 'free' ? 'အခု စာရင်းသွင်းပြီး ချက်ချင်း စတင် သင်ယူနိုင်ပါတယ်။' : 'စာရင်းသွင်းရန် နှိပ်ပြီး ငွေပေးချေမှု အဆင့်သို့ သွားပါ။'}
                            </p>
                            <button
                                type="button"
                                onClick={enroll}
                                className="mt-5 block w-full rounded-xl bg-teal-600 px-5 py-3.5 text-center font-bold text-white transition hover:bg-teal-700"
                            >
                                {course.pricing_type === 'free' ? 'အခမဲ့ စာရင်းသွင်းရန်' : 'စာရင်းသွင်းရန်'}
                            </button>
                            {course.pricing_type !== 'free' && (
                                cartAdded ? (
                                    <p className="mt-3 rounded-xl bg-teal-50 px-4 py-3 text-center text-sm font-bold text-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
                                        ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ · <Link href="/student/cart" className="underline">ခြင်းတောင်း ကြည့်ရန်</Link>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={addToCart}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                    >
                                        <ShoppingCart className="size-4" /> ခြင်းတောင်းထဲ ထည့်ရန်
                                    </button>
                                )
                            )}
                        </>
                    ) : (
                        <p className="mt-5 text-sm leading-6 text-[#5a6a8a] dark:text-[#97a6c6]">စာရင်းသွင်းရန် student အကောင့်ဖြင့် Login ဝင်ပါ။</p>
                    )}
                    <p className="mt-4 text-center text-xs text-[#8494b3] dark:text-[#67779c]">7 ရက်အတွင်း ငွေပြန်အမ်း မူဝါဒ ရှိပါတယ်</p>
                </aside>
            </div>
        </PublicLayout>
    );
}

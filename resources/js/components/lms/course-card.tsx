import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Check, Play, ShoppingCart, Star, Users } from 'lucide-react';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatKyat, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type LmsCourse = {
    id: number | string;
    slug: string;
    title: string;
    category?: string;
    instructor?: string;
    price?: number;
    oldPrice?: number;
    rating?: number;
    students?: number;
    level?: string;
    image?: string;
    progress?: number;
};

const coverGradients = [
    'from-[#0b3b5e] to-lms-teal',
    'from-[#7c2d12] to-lms-amber',
    'from-[#123a6d] to-sky-400',
    'from-[#14532d] to-lms-green',
    'from-[#4c1d95] to-violet-500',
    'from-[#831843] to-lms-pink',
    'from-[#134e4a] to-lms-teal-bright',
    'from-[#312e81] to-lms-indigo',
];

function coverGradient(id: number | string): string {
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return coverGradients[hash % coverGradients.length];
}

type CourseCardProps = {
    course: LmsCourse;
    href?: string;
    /** Show an add-to-cart button (real catalog courses, logged-in students). */
    showAddToCart?: boolean;
};

type SharedProps = { auth?: { user?: { roles?: string[] } | null } };

export function CourseCard({ course, href, showAddToCart = false }: CourseCardProps) {
    const detailHref = href ?? `/courses/${course.slug}`;
    const hasProgress = typeof course.progress === 'number';
    const { auth } = usePage<SharedProps>().props;
    const isStudent = auth?.user?.roles?.includes('student') ?? false;
    const [added, setAdded] = useState(false);
    // Sample-data cards carry string ids; only real (numeric id) courses
    // can be added to the cart.
    const canAddToCart = showAddToCart && !hasProgress && isStudent && typeof course.id === 'number' && (course.price ?? 0) > 0;

    const addToCart = () => {
        router.post('/student/cart', { course_id: course.id }, { preserveScroll: true, onSuccess: () => setAdded(true) });
    };

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-lms-line bg-lms-surface transition duration-200 hover:-translate-y-1 hover:border-lms-accent hover:shadow-[0_10px_30px_rgba(13,30,70,0.08)] dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
            <Link href={detailHref} className="relative block aspect-video overflow-hidden bg-gradient-to-br text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500" aria-label={course.title}>
                {course.image ? (
                    <img src={course.image} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                    <span className={cn('absolute inset-0 bg-gradient-to-br', coverGradient(course.id))} aria-hidden="true" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    {course.category ? (
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-extrabold text-slate-800">{course.category}</span>
                    ) : null}
                    {course.level ? <span className="rounded-full bg-black/45 px-2.5 py-1 text-[0.68rem] font-bold text-white backdrop-blur-sm">{course.level}</span> : null}
                </span>
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <Link href={detailHref} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
                    <h3 className="clamp-2 text-[0.95rem] font-bold leading-snug text-lms-ink group-hover:text-lms-accent">{course.title}</h3>
                </Link>
                {course.instructor ? <p className="text-xs font-medium text-lms-faint">{course.instructor}</p> : null}

                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs font-semibold text-lms-muted">
                    {typeof course.rating === 'number' ? (
                        <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {course.rating.toFixed(1)}
                        </span>
                    ) : null}
                    {typeof course.students === 'number' ? (
                        <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" />
                            {formatNumber(course.students)}
                        </span>
                    ) : null}
                </div>

                {hasProgress ? (
                    <div className="pt-2">
                        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                            <span className="text-lms-muted">ပြီးစီးမှု</span>
                            <span className="text-lms-accent">{course.progress}%</span>
                        </div>
                        <ProgressBar value={course.progress ?? 0} />
                        <Link
                            href={`/student/courses/${course.id}/learn`}
                            className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-lms-teal to-teal-700 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(14,168,146,0.28)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                        >
                            <Play className="size-4 fill-current" />
                            ဆက်လက်သင်ယူရန်
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-2 pt-1">
                            {typeof course.price === 'number' ? (
                                course.price === 0 ? (
                                    <span className="text-base font-extrabold text-lms-accent">အခမဲ့</span>
                                ) : (
                                    <span className="text-base font-extrabold text-lms-ink">{formatKyat(course.price)}</span>
                                )
                            ) : null}
                            {typeof course.oldPrice === 'number' && course.oldPrice > 0 ? (
                                <span className="text-xs font-semibold text-lms-faint line-through">{formatKyat(course.oldPrice)}</span>
                            ) : null}
                        </div>
                        {canAddToCart && (
                            added ? (
                                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                                    <Check className="size-4" /> ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={addToCart}
                                    className="mt-2 inline-flex items-center gap-1.5 self-start rounded-lg border border-lms-line px-3 py-2 text-xs font-bold text-lms-ink transition hover:border-lms-accent hover:text-lms-accent"
                                >
                                    <ShoppingCart className="size-4" /> ခြင်းတောင်းထဲ ထည့်ရန်
                                </button>
                            )
                        )}
                    </>
                )}
            </div>
        </article>
    );
}

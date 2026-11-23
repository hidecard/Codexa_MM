import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import { MessageSquareText, Star } from 'lucide-react';

type Review = {
    id: number;
    rating: number;
    comment?: string | null;
    is_approved?: boolean;
    status?: string | null;
    created_at?: string | null;
    date?: string | null;
    course?: { id: number; title: string; slug: string } | null;
    course_title?: string | null;
    course_slug?: string | null;
};

type Props = { reviews?: Review[] };

/* SAMPLE DATA — fallback only, shown when the student has no reviews yet (from prototype). */
const SAMPLE_REVIEWS: Review[] = [
    { id: 1, rating: 5, comment: 'Figma ကို သုညကနေ စသူတောင် လိုက်နိုင်အောင် တစ်ဆင့်ချင်း ရှင်းပြထားပါတယ်။ Auto Layout အခန်းက အရမ်း အထောက်အကူ ဖြစ်ပါတယ်။', status: 'approved', date: 'အောက်တိုဘာ 20', course_title: 'UI/UX Design with Figma', course_slug: 'ui-ux-design-with-figma' },
    { id: 2, rating: 5, comment: 'Python ကို မြန်မာလို ရှင်းရှင်းလင်းလင်း သင်ပေးတာ ကျေးဇူးပါ။ Mini project တွေက လက်တွေ့ အသုံးချလို့ ကောင်းပါတယ်။', status: 'approved', date: 'နိုဝင်ဘာ 10', course_title: 'Python for Beginners', course_slug: 'python-for-beginners' },
    { id: 3, rating: 4, comment: 'Portfolio project လုပ်ရတာ အရမ်း ကောင်းပါတယ်။ Flexbox အခန်းမှာ လေ့ကျင့်ခန်း နည်းနည်း ပိုထည့်ရင် ပိုကောင်းပါမယ်။', status: 'pending', date: 'နိုဝင်ဘာ 21', course_title: 'HTML & CSS Foundations', course_slug: 'html-css-foundations' },
];

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`size-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
        </span>
    );
}

export default function Index({ reviews }: Props) {
    const list = reviews && reviews.length > 0 ? reviews : SAMPLE_REVIEWS;
    const usingSample = !reviews || reviews.length === 0;
    const avg = list.length > 0 ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : '0';

    return (
        <LmsShell title="ကျွန်ုပ်၏ သုံးသပ်ချက်များ" nav="student">
            <Head title="My Reviews" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">ကျွန်ုပ်၏ သုံးသပ်ချက်များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သုံးသပ်ချက် {list.length} ခု · ပျမ်းမျှ အဆင့်သတ်မှတ်ချက် {avg}/5</p>
            </div>
            {usingSample && <p className="mt-3 text-xs text-slate-400">သုံးသပ်ချက် အစစ်အမှန် မရှိသေးသဖြင့် နမူနာ ပြထားသည်။</p>}

            {list.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<MessageSquareText className="size-10" />}
                    title="သုံးသပ်ချက် မရှိသေးပါ"
                    description="သင်တန်း ပြီးစီးပြီးနောက် သုံးသပ်ချက် ရေးနိုင်ပါသည်။"
                    action={<Link href="/student/my-courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4">
                    {list.map((r) => {
                        const approved = r.is_approved ?? r.status === 'approved';
                        const title = r.course?.title ?? r.course_title ?? 'သင်တန်း';
                        const slug = r.course?.slug ?? r.course_slug;
                        return (
                            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.date ?? formatDate(r.created_at)}</p>
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

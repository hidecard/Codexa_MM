import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    Code2,
    GraduationCap,
    MessagesSquare,
    Play,
    Star,
    Users,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { CourseCard } from '@/components/lms/course-card';
import {
    categoryMeta,
    formatCount,
    initials,
    instructorInfo,
    mapApiCourse,
    type ApiCourse,
    type LmsCourse,
} from '@/lib/ui-utils';

type ApiCategory = { id: number; name: string; slug: string; courses_count?: number };
type ApiInstructor = { id: number; name: string; courses_count?: number; profile?: { bio?: string | null } | null };
type LearningPath = { id: number; title: string; goal: string; glyph: string; grad: string; months: string; level: string; steps: string[]; outcomes: string[] };
type Props = {
    courses?: ApiCourse[];
    categories?: ApiCategory[];
    instructors?: ApiInstructor[];
    learningPaths?: LearningPath[];
    stats?: { courses?: number; students?: number; instructors?: number; rating?: number | null };
    landing?: { promo?: string | null; heroTitle?: string | null; heroIntro?: string | null };
};

const features = [
    { icon: BookOpen, tint: 'bg-teal-500/10 text-teal-600 dark:text-teal-300', title: 'မြန်မာဘာသာ သင်ခန်းစာများ', text: 'Concept တိုင်းကို မြန်မာလို ရှင်းရှင်းလင်းလင်း ရှင်းပြပြီး English technical term တွေကိုပါ တွဲဖက် သင်ပေးတာမို့ အခြေခံမရှိသူလည်း လိုက်နိုင်ပါတယ်။' },
    { icon: Play, tint: 'bg-rose-500/10 text-rose-600 dark:text-rose-300', title: 'Video Class + မှတ်တမ်း', text: 'Video သင်ခန်းစာတွေမှာ ဆရာကို တိုက်ရိုက် မေးမြန်းနိုင်ပြီး လွတ်သွားရင်လည်း မှတ်တမ်းကို အချိန်မရွေး ပြန်ကြည့်နိုင်ပါတယ်။' },
    { icon: Code2, tint: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300', title: 'Project-based သင်ယူမှု', text: 'သင်ခန်းစာတိုင်းမှာ လက်တွေ့ လေ့ကျင့်ခန်းနဲ့ assignment ပါဝင်ပြီး ဆရာက အမှတ်ပေး မှတ်ချက် ပြန်ပေးတာမို့ portfolio အတွက် project တွေ စုဆောင်းပြီးသား ဖြစ်ပါတယ်။' },
    { icon: Award, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', title: 'အတည်ပြုနိုင်သော လက်မှတ်', text: 'သင်တန်း ပြီးဆုံးရင် Certificate ID ပါတဲ့ လက်မှတ် ရရှိပြီး အလုပ်ရှင်က link ဖြင့် တိုက်ရိုက် အတည်ပြုနိုင်တာမို့ CV နဲ့ LinkedIn မှာ ယုံကြည်စိတ်ချစွာ ထည့်သုံးနိုင်ပါတယ်။' },
    { icon: Wallet, tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', title: 'မြန်မာ ငွေပေးချေမှုများ', text: 'KBZPay, WavePay, CB Pay နဲ့ bank transfer — ကိုယ် အဆင်ပြေတဲ့ နည်းလမ်းနဲ့ ပေးချေနိုင်ပြီး အတည်ပြုပြီးတာနဲ့ သင်ခန်းစာတွေ ချက်ချင်း ပွင့်သွားပါမယ်。' },
    { icon: MessagesSquare, tint: 'bg-pink-500/10 text-pink-600 dark:text-pink-300', title: 'Community + ဆရာ Support', text: 'တစ်ယောက်တည်း မဟုတ်ပါ — မေးခွန်းတွေကို community မှာ ဆွေးနွေးနိုင်ပြီး ဆရာတွေကလည်း message ဖြင့် ကူညီ ဖြေကြားပေးပါတယ်。' },
];

const plans = [
    {
        name: 'Free',
        desc: 'စတင် စမ်းသပ်ချင်သူများအတွက်',
        monthly: 0,
        yearly: 0,
        period: 'အမြဲတမ်း အခမဲ့',
        noteMonthly: '',
        noteYearly: '',
        featured: false,
        cta: 'အခမဲ့ စတင်ရန်',
        features: ['သင်တန်းတိုင်းရဲ့ အခမဲ့ preview သင်ခန်းစာများ', 'Community မှာ မေးမြန်း ဆွေးနွေးခွင့်', 'Quiz လေ့ကျင့်ခန်းများ', 'Wishlist ဖြင့် သင်တန်း သိမ်းထားခွင့်'],
    },
    {
        name: 'Pro',
        desc: 'တကယ် ကျွမ်းကျင်အောင် သင်ယူချင်သူများအတွက်',
        monthly: 25000,
        yearly: 20000,
        period: '/လ',
        noteMonthly: 'အချိန်မရွေး ရပ်တန့်နိုင်ပါတယ်',
        noteYearly: 'နှစ်စဉ် 240,000 ကျပ် တစ်ကြိမ်တည်း ပေးချေရန်',
        featured: true,
        cta: 'Pro စတင်ရန်',
        features: ['သင်တန်း ဝယ်ယူမှုတိုင်းမှာ အပို 20% လျှော့ဈေး', 'Video class အားလုံး ဝင်ရောက်ခွင့်', 'လက်မှတ် ထုတ်ပေးမှု အခမဲ့', 'Assignment ဦးစားပေး အမှတ်ပေးမှု', 'ဆရာများထံ message support'],
    },
    {
        name: 'Team',
        desc: 'အဖွဲ့လိုက် / ကုမ္ပဏီအလိုက် သင်ယူရန်',
        monthly: 99000,
        yearly: 79200,
        period: '/လ',
        noteMonthly: 'အဖွဲ့ဝင် 10 ဦး အထိ ပါဝင်ပါတယ်',
        noteYearly: 'နှစ်စဉ် 950,400 ကျပ် တစ်ကြိမ်တည်း ပေးချေရန်',
        featured: false,
        cta: 'Team စတင်ရန်',
        features: ['Pro အကျိုးခံစားခွင့် အားလုံး', 'အဖွဲ့ဝင် 10 ဦး အထိ အကောင့်', 'အဖွဲ့ တိုးတက်မှု အစီရင်ခံစာ', 'Admin dashboard ဖြင့် စီမံခွင့်', 'ဦးစားပေး support'],
    },
];

const testimonials = [
    { name: 'May Thandar', init: 'MT', color: '#ec4899', city: 'Yangon', course: 'JavaScript Deep Dive', text: 'အရင်က tutorial တွေ လိုက်ကြည့်ရင်း လမ်းပျောက်နေခဲ့တာ။ Codexa MM မှာ အခန်းလိုက် လေ့ကျင့်ခန်းတွေနဲ့ ဆရာ့ feedback ပါလာတော့ ၃ လအတွင်း ကိုယ်ပိုင် project ၂ ခု ပြီးအောင် လုပ်နိုင်ခဲ့ပါတယ်။' },
    { name: 'Zaw Lin Htet', init: 'ZL', color: '#f59e0b', city: 'Yangon', course: 'Python for Beginners', text: 'Programming ကို သုညကနေ စတာပါ။ မြန်မာလို ရှင်းပြထားတာမို့ concept တွေ မြန်မြန် နားလည်ပြီး quiz တွေက ကိုယ် ဘယ်နေရာ အားနည်းလဲဆိုတာ တန်းသိရပါတယ်။' },
    { name: 'Thiri Nanda', init: 'TN', color: '#6366f1', city: 'Mandalay', course: 'UI/UX Design with Figma', text: 'Figma ကို အခြေခံကနေ component, prototype အထိ စနစ်တကျ သင်ခဲ့ရတယ်။ ရလာတဲ့ လက်မှတ်ကို portfolio မှာ ထည့်ထားတာ အလုပ်လျှောက်တဲ့အခါ အထောက်အကူ အများကြီး ဖြစ်ပါတယ်။' },
];

const steps = [
    { n: 1, grad: 'linear-gradient(135deg,#0ea892,#2563eb)', title: 'အကောင့် ဖွင့်ရန်', text: 'အခမဲ့ အကောင့် ဖွင့်ပြီး profile ကို ပြင်ဆင်ပါ', cta: 'အကောင့် ဖွင့်ရန်', href: '/register' },
    { n: 2, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)', title: 'သင်တန်း ရွေးရန်', text: 'နယ်ပယ်အလိုက် သင်တန်းတွေကို ရှာပြီး ရွေးပါ', cta: 'သင်တန်းများ ကြည့်ရန်', href: '/courses' },
    { n: 3, grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', title: 'စတင်သင်ယူမှု', text: 'စာရင်းသွင်းပြီး Video, Assignment တွေနဲ့ ဆက်လက်သင်ယူပါ', cta: 'သင်ယူရန်', href: '/student/dashboard' },
];

export default function Home({ courses: apiCourses, categories: apiCategories, instructors: apiInstructors, learningPaths, stats, landing }: Props) {
    const courses: LmsCourse[] = useMemo(
        () => (apiCourses?.map(mapApiCourse) ?? []),
        [apiCourses],
    );
    const categories = apiCategories ?? [];

    const categoryCards = useMemo(() => {
        if (categories.length > 0) {
            return categories.map((c) => ({
                name: c.name,
                slug: c.slug,
                count: c.courses_count ?? courses.filter((course) => course.category === c.name).length,
                students: courses.filter((course) => course.category === c.name).reduce((s, course) => s + (course.students ?? 0), 0),
            }));
        }
        return [];
    }, [categories, courses]);

    const displayStats = {
        courses: stats?.courses ?? courses.length,
        students: stats?.students ?? 0,
        instructors: stats?.instructors ?? 0,
        rating: stats?.rating ?? 0,
    };

    const [cat, setCat] = useState('All');
    const chipCats = useMemo(() => ['All', ...Array.from(new Set(courses.map((c) => c.category).filter((c): c is string => Boolean(c))))], [courses]);
    const featured = useMemo(
        () =>
            courses
                .filter((c) => cat === 'All' || c.category === cat)
                .slice()
                .sort((a, b) => (b.students ?? 0) - (a.students ?? 0))
                .slice(0, 6),
        [courses, cat],
    );

    const preview = courses.find((c) => c.slug === 'react-complete-course') ?? courses[0];
    const previewMeta = categoryMeta(preview?.category);

    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [tstIdx, setTstIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTstIdx((i) => (i + 1) % testimonials.length), 6500);
        return () => clearInterval(timer);
    }, []);

    const testimonial = testimonials[tstIdx];

    return (
        <PublicLayout>
            <Head title="Codexa MM — မြန်မာလို သင်ယူပြီး Developer ဖြစ်လာပါ" />
            <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
                {/* Promo strip */}
                <div
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3 text-white"
                    style={{ background: 'linear-gradient(120deg,#0b2a4a,#075e52)' }}
                >
                    <span className="flex-none rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950">ပရိုမိုးရှင်း</span>
                    <p className="min-w-[220px] flex-1 text-sm font-semibold">
                        {landing?.promo ?? (
                            <>
                                သင်တန်းအားလုံး 50% အထိ လျှော့ဈေး — Checkout မှာ <b className="font-mono">CODEXA10</b> သုံးရင် အပို 10% ထပ် လျှော့ပေးပါတယ်
                            </>
                        )}
                    </p>
                    <Link href="/courses" className="flex-none rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-teal-900 transition hover:bg-teal-50">
                        သင်တန်းများ ကြည့်ရန်
                    </Link>
                </div>

                {/* Hero */}
                <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-teal-700 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:text-teal-300 dark:ring-[#1e2c52]">
                            <span className="size-2 animate-pulse rounded-full bg-teal-400" />
                            မြန်မာဘာသာဖြင့် Programming သင်ယူရန်
                        </span>
                        <h1 className="mt-4 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl lg:text-[2.85rem] lg:leading-[1.35]">
                            {landing?.heroTitle ?? (
                                <>
                                    မြန်မာလို ရှင်းလင်းစွာ သင်ယူပြီး
                                    <br />
                                    <span className="text-teal-600 dark:text-teal-300">Developer</span> တစ်ဦး ဖြစ်လာပါ
                                </>
                            )}
                        </h1>
                        <p className="mt-4 max-w-[540px] text-base leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                            {landing?.heroIntro ??
                                'Codexa MM မှာ Web, Mobile, Backend နဲ့ Design သင်တန်းတွေကို လက်တွေ့ project တွေနဲ့ အဆင့်ဆင့် သင်ယူနိုင်ပါတယ်။ Live class, assignment အမှတ်ပေးမှုနဲ့ အတည်ပြုနိုင်တဲ့ လက်မှတ်ပါ တစ်နေရာတည်းမှာ ရရှိပါမယ်။'}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                            >
                                သင်တန်းများ ကြည့်ရန် <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0d1730] ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-white dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                            >
                                အခမဲ့ အကောင့် ဖွင့်ရန်
                            </Link>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[
                                    { init: 'MT', bg: '#ec4899' },
                                    { init: 'KH', bg: '#0ea892' },
                                    { init: 'TN', bg: '#6366f1' },
                                    { init: 'ZL', bg: '#f59e0b' },
                                ].map((a) => (
                                    <span
                                        key={a.init}
                                        className="grid size-9 place-items-center rounded-full text-[0.68rem] font-extrabold text-white ring-2 ring-[#edf0f7] dark:ring-[#070d1f]"
                                        style={{ background: a.bg }}
                                    >
                                        {a.init}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                ကျောင်းသား <b className="text-[#0d1730] dark:text-white">{formatCount(displayStats.students)}+</b> ယောက် သင်ယူနေပြီး ပျမ်းမျှ rating{' '}
                                <b className="text-[#0d1730] dark:text-white">{displayStats.rating.toFixed(1)} / 5</b>
                            </p>
                        </div>
                        <div className="mt-7 grid max-w-[480px] grid-cols-2 gap-3">
                            {[
                                { value: `${displayStats.courses}+`, label: 'လက်တွေ့ သင်တန်းများ' },
                                { value: `${formatCount(displayStats.students)}+`, label: 'သင်ယူနေသော ကျောင်းသားများ' },
                                { value: `${displayStats.instructors}`, label: 'အတွေ့အကြုံရှိ ဆရာ/ဆရာမများ' },
                                { value: displayStats.rating.toFixed(1), label: 'ပျမ်းမျှ သင်တန်း rating' },
                            ].map((s) => (
                                <div key={s.label} className="rounded-2xl bg-white p-3.5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <p className="text-xl font-extrabold leading-none">{s.value}</p>
                                    <p className="mt-1.5 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero visual: lesson preview card */}
                    {preview && (
                        <div className="relative min-w-0">
                            <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-5">
                                <div className="flex items-center gap-2 border-b border-[#e7ecf5] pb-3 dark:border-[#18264a]">
                                    <span className="size-2.5 rounded-full bg-red-400" />
                                    <span className="size-2.5 rounded-full bg-amber-400" />
                                    <span className="size-2.5 rounded-full bg-emerald-400" />
                                    <span className="ml-2 truncate font-mono text-xs font-bold text-[#8494b3] dark:text-[#67779c]">codexamm · lesson player</span>
                                </div>
                                <div
                                    className="relative mt-4 grid aspect-video place-items-center overflow-hidden rounded-xl"
                                    style={{ background: previewMeta.grad }}
                                >
                                    <Link
                                        href={`/courses/${preview.slug}`}
                                        aria-label="Play React course preview"
                                        className="grid size-16 place-items-center rounded-full bg-teal-400 text-teal-950 transition hover:scale-105"
                                    >
                                        <Play className="size-6 fill-current" />
                                    </Link>
                                    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[0.65rem] font-bold text-white backdrop-blur">PREVIEW</span>
                                    <span className="absolute bottom-3 right-3 font-mono text-2xl font-bold text-white/90" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                        {previewMeta.glyph}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-lg font-extrabold leading-snug">{preview.title}</h3>
                                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">သင်ခန်းစာ · Hooks in Depth — useEffect အသုံးချနည်း</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7ecf5] dark:bg-[#18264a]">
                                        <div className="h-full w-[62%] rounded-full bg-teal-500" />
                                    </div>
                                    <span className="flex-none text-sm font-extrabold">62%</span>
                                </div>
                                <div className="mt-2 divide-y divide-[#e7ecf5] dark:divide-[#18264a]">
                                    {[
                                        { title: 'Components & JSX — အခြေခံ တည်ဆောက်ပုံ', time: '12:40', done: true },
                                        { title: 'useState ဖြင့် state စီမံခြင်း', time: '15:05', done: true },
                                        { title: 'useEffect နဲ့ data ခေါ်ယူခြင်း', time: 'ကြည့်နေဆဲ', done: false },
                                    ].map((lesson) => (
                                        <div key={lesson.title} className="flex items-center gap-2.5 py-2.5">
                                            <span
                                                className={`grid size-[22px] flex-none place-items-center rounded-full ${
                                                    lesson.done ? 'bg-teal-600 text-white' : 'bg-teal-500/10 text-teal-600 dark:text-teal-300'
                                                }`}
                                            >
                                                {lesson.done ? <Check className="size-3" strokeWidth={3} /> : <Play className="size-2.5 fill-current" />}
                                            </span>
                                            <p className="flex-1 truncate text-sm font-semibold">{lesson.title}</p>
                                            <span className="flex-none rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300">{lesson.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`/courses/${preview.slug}`}
                                    className="mt-2 block rounded-xl bg-teal-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-teal-700"
                                >
                                    ဆက်လက် သင်ယူရန်
                                </Link>
                            </div>
                            <div className="absolute -bottom-4 left-2 z-10 hidden max-w-[300px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:flex">
                                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                                    <Award className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-extrabold leading-snug">လက်မှတ် ရရှိပါပြီ</p>
                                    <p className="truncate text-xs text-[#5a6a8a] dark:text-[#97a6c6]">UI/UX Design with Figma · CXMM-2026-1042</p>
                                </div>
                                <Link href="/student/certificates" className="flex-none rounded-lg bg-[#eef3fb] px-3 py-1.5 text-xs font-bold dark:bg-[#12234a]">
                                    ကြည့်ရန်
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">နယ်ပယ်အလိုက် သင်တန်းများ</h2>
                            <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ကိုယ် စိတ်ဝင်စားတဲ့ လမ်းကြောင်းကို ရွေးပြီး စတင်လိုက်ပါ</p>
                        </div>
                        <Link href="/courses" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                            သင်တန်း အားလုံး ကြည့်ရန်
                        </Link>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryCards.map((c) => {
                            const meta = categoryMeta(c.name);
                            return (
                                <Link
                                    key={c.name}
                                    href={`/courses?category=${c.slug}`}
                                    className="rounded-2xl bg-white p-4 text-left ring-1 ring-[#dce3f0] transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#0d1730] dark:ring-[#1e2c52]"
                                >
                                    <span className="grid size-11 place-items-center rounded-xl font-mono text-xs font-bold text-white" style={{ background: meta.grad }}>
                                        {meta.glyph}
                                    </span>
                                    <p className="mt-3 text-sm font-extrabold leading-snug">{c.name}</p>
                                    <p className="mt-1 text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                        သင်တန်း {c.count} ခု{c.students > 0 ? ` · ကျောင်းသား ${formatCount(c.students)}` : ''}
                                    </p>
                                    <p className="mt-2.5 text-xs font-extrabold text-teal-700 dark:text-teal-300">ကြည့်ရန် →</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Featured courses */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">လူကြိုက်များသော သင်တန်းများ</h2>
                            <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ကျောင်းသားအများဆုံး စာရင်းသွင်းထားတဲ့ သင်တန်းတွေ</p>
                        </div>
                        <Link href="/courses" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                            အားလုံး ကြည့်ရန်
                        </Link>
                    </div>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {chipCats.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`flex-none rounded-full px-4 py-2 text-sm font-bold transition ${
                                    cat === c
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                                }`}
                            >
                                {c === 'All' ? 'အားလုံး' : c}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {featured.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                    {featured.length === 0 && (
                        <p className="mt-4 rounded-2xl bg-white p-8 text-center text-sm text-[#5a6a8a] ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:text-[#97a6c6]">
                            ဒီ အမျိုးအစားမှာ သင်တန်း မရှိသေးပါ
                        </p>
                    )}
                </section>

                {/* Why Codexa MM */}
                <section className="mt-14">
                    <h2 className="text-2xl font-extrabold tracking-tight">ဘာကြောင့် Codexa MM လဲ</h2>
                    <p className="mt-1 max-w-[620px] text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                        ဗီဒီယို ကြည့်ရုံတင် မဟုတ်ဘဲ — လေ့ကျင့်ခန်း၊ အမှတ်ပေးမှု၊ live ဆွေးနွေးမှုနဲ့ လက်မှတ်အထိ သင်ယူမှု ခရီးစဉ် တစ်ခုလုံးကို စီစဉ်ထားပါတယ်
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {features.map((f) => (
                            <div key={f.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                <span className={`grid size-11 flex-none place-items-center rounded-xl ${f.tint}`}>
                                    <f.icon className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-extrabold">{f.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Learning paths */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">အလုပ်အကိုင် လမ်းကြောင်းများ</h2>
                            <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ဘာပြီးရင် ဘာသင်ရမလဲ မစဉ်းစားရအောင် အဆင့်ဆင့် စီထားပေးပါတယ်</p>
                        </div>
                        <Link href="/student/paths" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                            လမ်းကြောင်း အားလုံး
                        </Link>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {(learningPaths ?? []).map((p) => (
                            <div key={p.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                <div className="relative overflow-hidden p-5 text-white" style={{ background: p.grad }}>
                                    <div className="absolute -right-6 -top-8 size-28 rounded-full bg-white/20 blur-xl" />
                                    <span className="relative font-mono text-3xl font-bold" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                        {p.glyph}
                                    </span>
                                    <h3 className="relative mt-2 text-lg font-extrabold leading-snug">{p.title}</h3>
                                    <p className="relative mt-1 text-sm leading-relaxed text-white/85">{p.goal}</p>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                        <span>သင်တန်း {p.steps.length} ခု အဆင့်ဆင့်</span>
                                        <span>ကြာချိန် ခန့်မှန်း {p.months}</span>
                                        <span>{p.level}</span>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {p.outcomes.slice(0, 2).map((o) => (
                                            <p key={o} className="flex gap-2.5 text-sm leading-relaxed">
                                                <Check className="mt-0.5 size-4 flex-none text-teal-600 dark:text-teal-300" strokeWidth={2.5} />
                                                <span>{o}</span>
                                            </p>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-2.5">
                                        <Link href={`/student/paths/${p.id}`} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                                            လမ်းကြောင်း အသေးစိတ်
                                        </Link>
                                        <Link
                                            href="/student/paths"
                                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                        >
                                            လမ်းကြောင်းများ ကြည့်ရန်
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="mt-14">
                    <h2 className="text-2xl font-extrabold tracking-tight">ဘယ်လို စတင်ရမလဲ</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {steps.map((s) => (
                            <div key={s.n} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-6">
                                <span className="grid size-11 place-items-center rounded-full font-extrabold text-white" style={{ background: s.grad }}>
                                    {s.n}
                                </span>
                                <h3 className="mt-4 font-extrabold">{s.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{s.text}</p>
                                <Link
                                    href={s.href}
                                    className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                >
                                    {s.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Instructors */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">သင်ကြားပေးမည့် ဆရာ/ဆရာမများ</h2>
                            <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">လုပ်ငန်းခွင် အတွေ့အကြုံရှိသူတွေထံမှ တိုက်ရိုက် သင်ယူပါ</p>
                        </div>
                        <Link href="/instructors" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                            ဆရာ အားလုံး ကြည့်ရန်
                        </Link>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(apiInstructors ?? []).slice(0, 6).map((ins) => {
                              const info = instructorInfo(ins.name);
                              return (
                                  <div key={ins.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                      <div className="flex items-center gap-4">
                                          <span className="grid size-16 flex-none place-items-center rounded-2xl text-base font-extrabold text-white" style={{ background: info.grad }}>
                                              {initials(ins.name)}
                                          </span>
                                          <div className="min-w-0">
                                              <h3 className="truncate font-extrabold">{ins.name}</h3>
                                              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{info.role}</p>
<p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                                   <Star className="size-3 fill-amber-400 text-amber-400" />
                                                   <b className="text-[#0d1730] dark:text-white">{formatCount(ins.courses_count ?? 0)}</b> · သင်တန်း {ins.courses_count ?? 0} ခု
                                               </p>
                                          </div>
                                      </div>
                                      <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{ins.profile?.bio ?? info.bio}</p>
                                      <div className="mt-4 flex items-center justify-between gap-2.5">
                                          <span className="text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">သင်တန်း {ins.courses_count ?? 0} ခု</span>
                                          <Link
                                              href={`/instructors/${ins.id}`}
                                              className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
                                          >
                                              အသေးစိတ် ကြည့်ရန်
                                          </Link>
                                      </div>
                                  </div>
                              );
                          })}
                    </div>
                </section>

                {/* Pricing */}
                <section className="mt-14">
                    <div className="mx-auto max-w-[640px] text-center">
                        <h2 className="text-2xl font-extrabold tracking-tight">အဖွဲ့ဝင် Plan များ</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                            သင်တန်းတွေကို တစ်ခန်းချင်း ဝယ်ယူနိုင်သလို Pro အဖွဲ့ဝင်အဖြစ်လည်း အကျိုးခံစားခွင့် အပိုတွေ ရယူနိုင်ပါတယ်။ အချိန်မရွေး ရပ်/ပြောင်း လုပ်နိုင်ပါတယ်။
                        </p>
                        <div className="mt-5 inline-flex gap-1.5 rounded-full bg-white p-1.5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <button
                                type="button"
                                onClick={() => setBilling('monthly')}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${billing === 'monthly' ? 'bg-teal-600 text-white' : 'text-[#5a6a8a] dark:text-[#97a6c6]'}`}
                            >
                                လစဉ် ပေးချေမှု
                            </button>
                            <button
                                type="button"
                                onClick={() => setBilling('yearly')}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${billing === 'yearly' ? 'bg-teal-600 text-white' : 'text-[#5a6a8a] dark:text-[#97a6c6]'}`}
                            >
                                နှစ်စဉ် · 20% သက်သာ
                            </button>
                        </div>
                    </div>
                    <div className="mt-7 grid items-start gap-4 md:grid-cols-3">
                        {plans.map((plan) => {
                            const price = billing === 'monthly' ? plan.monthly : plan.yearly;
                            const note = billing === 'monthly' ? plan.noteMonthly : plan.noteYearly;
                            if (plan.featured) {
                                return (
                                    <div
                                        key={plan.name}
                                        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl ring-1 ring-teal-400/30 sm:p-6"
                                        style={{ background: 'linear-gradient(150deg,#0b2a4a,#07332e)' }}
                                    >
                                        <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-amber-950">လူကြိုက်အများဆုံး</span>
                                        <h3 className="font-extrabold">{plan.name}</h3>
                                        <p className="mt-1 text-sm text-teal-100/80">{plan.desc}</p>
                                        <p className="mt-4 flex items-baseline gap-1.5">
                                            <span className="text-3xl font-extrabold leading-none">{formatCount(price)}</span>
                                            <span className="font-bold">ကျပ်</span>
                                            <span className="text-xs font-semibold text-teal-100/75">{plan.period}</span>
                                        </p>
                                        {note && <p className="mt-1.5 text-xs text-teal-100/65">{note}</p>}
                                        <div className="mt-5 space-y-2.5 text-sm">
                                            {plan.features.map((f) => (
                                                <p key={f} className="flex gap-2.5">
                                                    <Check className="mt-0.5 size-4 flex-none text-teal-300" strokeWidth={2.5} />
                                                    {f}
                                                </p>
                                            ))}
                                        </div>
                                        <Link href="/student/membership" className="mt-6 block rounded-xl bg-white py-2.5 text-center text-sm font-bold text-teal-900 transition hover:bg-teal-50">
                                            {plan.cta}
                                        </Link>
                                    </div>
                                );
                            }
                            return (
                                <div key={plan.name} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-6">
                                    <h3 className="font-extrabold">{plan.name}</h3>
                                    <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">{plan.desc}</p>
                                    <p className="mt-4 flex items-baseline gap-1.5">
                                        <span className="text-3xl font-extrabold leading-none">{formatCount(price)}</span>
                                        <span className="font-bold">ကျပ်</span>
                                        <span className="text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">{plan.name === 'Free' ? '/ အမြဲတမ်း အခမဲ့' : plan.period}</span>
                                    </p>
                                    {note && <p className="mt-1.5 text-xs text-[#5a6a8a] dark:text-[#97a6c6]">{note}</p>}
                                    <div className="mt-5 space-y-2.5 text-sm">
                                        {plan.features.map((f) => (
                                            <p key={f} className="flex gap-2.5">
                                                <Check className="mt-0.5 size-4 flex-none text-teal-600 dark:text-teal-300" strokeWidth={2.5} />
                                                {f}
                                            </p>
                                        ))}
                                    </div>
                                    <Link
                                        href={plan.name === 'Free' ? '/register' : '/student/membership'}
                                        className="mt-6 block rounded-xl bg-white py-2.5 text-center text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-5 text-center text-xs text-[#5a6a8a] dark:text-[#97a6c6]">ငွေပေးချေမှုနည်းလမ်းများ — KBZPay · WavePay · CB Pay · Bank Transfer</p>
                </section>

                {/* Testimonials */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight">ကျောင်းသားများ၏ အတွေ့အကြုံ</h2>
                            <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">တကယ် သင်ယူခဲ့သူတွေရဲ့ စကားသံများ</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                aria-label="Previous testimonial"
                                onClick={() => setTstIdx((tstIdx - 1 + testimonials.length) % testimonials.length)}
                                className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next testimonial"
                                onClick={() => setTstIdx((tstIdx + 1) % testimonials.length)}
                                className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-6">
                        <div className="flex items-center gap-1 text-amber-400" aria-label="5 out of 5 stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="size-4 fill-current" />
                            ))}
                        </div>
                        <p className="mt-4 text-base leading-relaxed">“{testimonial.text}”</p>
                        <div className="mt-5 flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: testimonial.color }}>
                                {testimonial.init}
                            </span>
                            <div>
                                <p className="font-extrabold">{testimonial.name}</p>
                                <p className="text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                    {testimonial.city} · {testimonial.course}
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            {testimonials.map((t, i) => (
                                <button
                                    key={t.name}
                                    type="button"
                                    aria-label={`Testimonial ${i + 1}`}
                                    onClick={() => setTstIdx(i)}
                                    className={`h-2 rounded-full transition ${i === tstIdx ? 'w-6 bg-teal-600' : 'w-2 bg-[#dce3f0] dark:bg-[#1e2c52]'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section
                    className="relative mt-14 overflow-hidden rounded-2xl p-6 text-center text-white sm:p-10"
                    style={{ background: 'linear-gradient(150deg,#0b2a4a,#07332e)' }}
                >
                    <div className="absolute -right-8 -top-16 size-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(45,212,191,.4),transparent 70%)' }} />
                    <div className="absolute -bottom-16 -left-10 size-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(37,99,235,.35),transparent 70%)' }} />
                    <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">ဒီနေ့ပဲ စတင် သင်ယူလိုက်ပါ</h2>
                    <p className="relative mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-teal-100/85">
                        အကောင့် ဖွင့်တာ အခမဲ့ပါ။ ပထမ သင်ခန်းစာတွေကို စမ်းကြည့်ပြီး ကိုယ်နဲ့ ကိုက်ညီမှ ဆက်ဝယ်ပါ — 7 ရက်အတွင်း ငွေပြန်အမ်း မူဝါဒလည်း ရှိပါတယ်။
                    </p>
                    <div className="relative mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 transition hover:bg-teal-50">
                            အခမဲ့ အကောင့် ဖွင့်ရန်
                        </Link>
                        <Link
                            href="/courses"
                            className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                        >
                            သင်တန်းများ ကြည့်ရန်
                        </Link>
                    </div>
                    <p className="relative mt-6 flex items-center justify-center gap-2 text-xs text-teal-100/70">
                        <GraduationCap className="size-4" /> <Users className="size-4" /> ကျောင်းသား {formatCount(displayStats.students)}+ ယောက် သင်ယူနေပါပြီ
                    </p>
                </section>
            </div>
        </PublicLayout>
    );
}

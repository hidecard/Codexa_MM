import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Check, Clock3, Play } from 'lucide-react';
import { useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { SAMPLE_COURSES, categoryMeta } from '../sample-data';

type Lesson = { id: number; title: string; duration: number; type: string; is_free: boolean };
type Module = { id: number; title: string; description?: string | null; position: number; lessons?: Lesson[] };
type Course = {
    id?: number;
    title: string;
    slug: string;
    short_description?: string | null;
    level?: string | null;
    category?: { name: string } | null;
    modules?: Module[];
};
type Props = { course?: Course | null };

export default function Curriculum({ course: apiCourse }: Props) {
    const usingSample = !apiCourse;
    const sample = SAMPLE_COURSES[3]; // React.js Complete Course
    const course: Course = apiCourse ?? {
        title: sample.title,
        slug: sample.slug,
        short_description: sample.desc,
        level: sample.level,
        category: { name: sample.category ?? 'Web Development' },
        modules: sample.topics.map((t, i) => ({
            id: i + 1,
            title: t,
            position: i + 1,
            lessons: [
                { id: i * 10 + 1, title: `${t} — မိတ်ဆက်`, duration: 12, type: 'video', is_free: i === 0 },
                { id: i * 10 + 2, title: `${t} — လက်တွေ့ ဥပမာ`, duration: 18, type: 'video', is_free: false },
                { id: i * 10 + 3, title: `${t} — လေ့ကျင့်ခန်း`, duration: 10, type: 'assignment', is_free: false },
            ],
        })),
    };

    const modules = course.modules ?? [];
    const [openId, setOpenId] = useState<number | null>(modules[0]?.id ?? null);
    const totalLessons = modules.reduce((s, m) => s + (m.lessons?.length ?? 0), 0);
    const totalMinutes = modules.reduce((s, m) => s + (m.lessons ?? []).reduce((ls, l) => ls + (l.duration ?? 0), 0), 0);
    const freeLessons = modules.reduce((s, m) => s + (m.lessons ?? []).filter((l) => l.is_free).length, 0);
    const meta = categoryMeta(course.category?.name);

    return (
        <PublicLayout>
            <Head title={`${course.title} — သင်ရိုးညွှန်းတမ်း`} />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a6a8a] hover:text-teal-700 dark:text-[#97a6c6] dark:hover:text-teal-300">
                    <ArrowLeft className="size-4" /> {course.title} သို့ ပြန်သွားရန်
                </Link>

                <header className="mt-6 overflow-hidden rounded-2xl text-white" style={{ background: meta.grad }}>
                    <div className="p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">သင်ရိုးညွှန်းတမ်း</p>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{course.title}</h1>
                        {course.short_description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">{course.short_description}</p>}
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/90">
                            <span className="inline-flex items-center gap-2">
                                <BookOpen className="size-4" /> အခန်း {modules.length} ခု
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Play className="size-4" /> သင်ခန်းစာ {totalLessons} ခု
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Clock3 className="size-4" />
                                {totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)} နာရီ ${totalMinutes % 60} မိနစ်` : '—'}
                            </span>
                            {freeLessons > 0 && (
                                <span className="inline-flex items-center gap-2">
                                    <Check className="size-4" /> အခမဲ့ သင်ခန်းစာ {freeLessons} ခု
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {usingSample && (
                    <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        သင်ရိုးညွှန်းတမ်း နမူနာ ပြသနေပါတယ် — သင်တန်း အချက်အလက် မရရှိသေးပါ။
                    </p>
                )}

                <div className="mt-6 space-y-3">
                    {modules.map((module, mi) => (
                        <div key={module.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <button
                                type="button"
                                onClick={() => setOpenId(openId === module.id ? null : module.id)}
                                className="flex w-full items-center gap-3 px-5 py-4 text-left"
                                aria-expanded={openId === module.id}
                            >
                                <span className="grid size-9 flex-none place-items-center rounded-xl bg-teal-600 text-sm font-extrabold text-white">{mi + 1}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-extrabold">{module.title}</span>
                                    <span className="block text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                        သင်ခန်းစာ {module.lessons?.length ?? 0} ခု
                                        {(module.lessons ?? []).length > 0 &&
                                            ` · ${(module.lessons ?? []).reduce((s, l) => s + (l.duration ?? 0), 0)} မိနစ်`}
                                    </span>
                                </span>
                                <span className="flex-none text-sm font-bold text-teal-700 dark:text-teal-300">{openId === module.id ? '−' : '+'}</span>
                            </button>
                            {openId === module.id && (
                                <div className="border-t border-[#e7ecf5] dark:border-[#18264a]">
                                    {module.description && (
                                        <p className="px-5 pt-4 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{module.description}</p>
                                    )}
                                    <ul className="divide-y divide-[#e7ecf5] dark:divide-[#18264a]">
                                        {(module.lessons ?? []).map((lesson, li) => (
                                            <li key={lesson.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="size-6 flex-none rounded-full bg-[#eef3fb] text-center text-xs font-bold leading-6 text-[#5a6a8a] dark:bg-[#12234a] dark:text-[#97a6c6]">
                                                        {li + 1}
                                                    </span>
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <Play className="size-3.5 flex-none text-teal-600 dark:text-teal-300" />
                                                        <span className="truncate font-semibold">{lesson.title}</span>
                                                    </span>
                                                </span>
                                                <span className="flex flex-none items-center gap-2 text-xs font-semibold text-[#8494b3] dark:text-[#67779c]">
                                                    {lesson.type === 'assignment' && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-600 dark:text-indigo-300">Assignment</span>}
                                                    {lesson.type === 'quiz' && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-300">Quiz</span>}
                                                    {lesson.is_free ? (
                                                        <span className="rounded-full bg-teal-500/10 px-2 py-0.5 font-bold text-teal-700 dark:text-teal-300">အခမဲ့ ကြည့်ရန်</span>
                                                    ) : (
                                                        `${lesson.duration} မိနစ်`
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                        {(module.lessons ?? []).length === 0 && (
                                            <li className="px-5 py-4 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">ဒီ အခန်းမှာ သင်ခန်းစာ မရှိသေးပါ</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                    {modules.length === 0 && (
                        <p className="rounded-2xl bg-white p-10 text-center text-sm text-[#5a6a8a] ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:text-[#97a6c6]">
                            သင်ရိုးညွှန်းတမ်း မကြာမီ ထွက်ရှိပါမယ်။
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={`/courses/${course.slug}`} className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700">
                        သင်တန်း အသေးစိတ် ကြည့်ရန်
                    </Link>
                    <Link
                        href="/courses"
                        className="rounded-xl bg-white px-5 py-3 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                    >
                        သင်တန်း အားလုံး
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}

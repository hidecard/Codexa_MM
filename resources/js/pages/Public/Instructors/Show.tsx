import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Star, Users } from 'lucide-react';
import { PublicLayout } from '@/components/shared/public-layout';
import { CourseCard } from '@/components/lms/course-card';
import { SAMPLE_COURSES, formatCount, initials, instructorInfo, mapApiCourse, type ApiCourse } from '../sample-data';

type Instructor = { id?: number; name: string; profile?: { bio?: string | null } | null };
type Review = { id: number; rating: number; comment?: string | null; student?: { name: string }; course?: { title: string; slug: string } };
type Props = { instructor: Instructor; courses?: ApiCourse[]; reviews?: Review[] };

export default function Show({ instructor, courses = [], reviews = [] }: Props) {
    const info = instructorInfo(instructor.name);
    const sampleCourses = SAMPLE_COURSES.filter((c) => c.instructor === instructor.name);
    const displayCourses = courses.length > 0 ? courses.map(mapApiCourse) : sampleCourses;
    const totalStudents = sampleCourses.reduce((s, c) => s + (c.students ?? 0), 0);
    const avgRating =
        reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : sampleCourses.length > 0 ? sampleCourses.reduce((s, c) => s + (c.rating ?? 0), 0) / sampleCourses.length : null;

    return (
        <PublicLayout>
            <Head title={`${instructor.name} — ဆရာ/ဆရာမ`} />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link href="/instructors" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a6a8a] hover:text-teal-700 dark:text-[#97a6c6] dark:hover:text-teal-300">
                    <ArrowLeft className="size-4" /> ဆရာ/ဆရာမများသို့
                </Link>

                <header className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <span className="grid size-24 flex-none place-items-center rounded-3xl text-2xl font-extrabold text-white" style={{ background: info.grad }}>
                            {initials(instructor.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">{info.role}</p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{instructor.name}</h1>
                            <p className="mt-3 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">{instructor.profile?.bio ?? info.bio}</p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-3.5 py-1.5 text-xs font-bold dark:bg-[#12234a]">
                                    <BookOpen className="size-3.5 text-teal-600 dark:text-teal-300" /> သင်တန်း {displayCourses.length} ခု
                                </span>
                                {totalStudents > 0 && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-3.5 py-1.5 text-xs font-bold dark:bg-[#12234a]">
                                        <Users className="size-3.5 text-teal-600 dark:text-teal-300" /> ကျောင်းသား {formatCount(totalStudents)} ယောက်
                                    </span>
                                )}
                                {avgRating != null && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-3.5 py-1.5 text-xs font-bold dark:bg-[#12234a]">
                                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {avgRating.toFixed(1)} / 5
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="mt-10">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold">
                        <BookOpen className="size-5 text-teal-600 dark:text-teal-300" /> သင်ကြားသော သင်တန်းများ
                    </h2>
                    {displayCourses.length === 0 ? (
                        <p className="mt-4 rounded-2xl bg-white p-8 text-center text-sm text-[#5a6a8a] ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:text-[#97a6c6]">
                            သင်တန်း မရှိသေးပါ
                        </p>
                    ) : (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            {displayCourses.map((c) => (
                                <CourseCard key={c.id} course={c} />
                            ))}
                        </div>
                    )}
                </section>

                {reviews.length > 0 && (
                    <section className="mt-10">
                        <h2 className="flex items-center gap-2 text-xl font-extrabold">
                            <Star className="size-5 text-amber-400" /> ကျောင်းသားများ၏ သုံးသပ်ချက်များ
                        </h2>
                        <div className="mt-5 space-y-4">
                            {reviews.map((review) => (
                                <blockquote key={review.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <p className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`size-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                        ))}
                                    </p>
                                    {review.comment && <p className="mt-2 leading-7 text-[#5a6a8a] dark:text-[#97a6c6]">“{review.comment}”</p>}
                                    <cite className="mt-2 block text-sm font-semibold not-italic text-[#8494b3] dark:text-[#67779c]">
                                        {review.student?.name ?? 'Codexa ကျောင်းသား'}
                                        {review.course ? ` · ${review.course.title}` : ''}
                                    </cite>
                                </blockquote>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PublicLayout>
    );
}

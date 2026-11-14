import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Clock3, GraduationCap } from "lucide-react";

type Course = {
    title: string;
    slug: string;
    description?: string;
    level: string;
    duration: number;
    price: string;
    sale_price?: string;
    outcomes?: string[];
    category?: { name: string };
    instructor?: { name: string };
    modules: {
        id: number;
        title: string;
        description?: string;
        position: number;
        lessons?: { id: number; title: string; duration: number; type: string; is_free: boolean }[];
    }[];
    announcements?: { id: number; title: string; content: string }[];
    reviews?: { id: number; rating: number; comment?: string; student?: { name: string } }[];
};

export default function Show({ course }: { course: Course }) {
    const price = course.sale_price ?? course.price;
    return (
        <>
            <Head title={course.title} />
            <div className="min-h-screen bg-slate-50 text-slate-950">
                <section className="bg-slate-950 text-white">
                    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-white"
                        >
                            <ArrowLeft size={16} /> All courses
                        </Link>
                        <div className="mt-12 max-w-4xl">
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">
                                {course.category?.name}
                            </p>
                            <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
                                {course.title}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                                {course.description}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-slate-300">
                                <span className="inline-flex items-center gap-2">
                                    <GraduationCap
                                        size={18}
                                        className="text-blue-300"
                                    />{" "}
                                    {course.level}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Clock3
                                        size={18}
                                        className="text-blue-300"
                                    />{" "}
                                    {course.duration} hours
                                </span>
                                <span>
                                    Instructor: {course.instructor?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
                <main className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px] lg:px-8">
                    <div>
                        <section className="rounded-3xl border border-slate-200 bg-white p-7">
                            <h2 className="text-2xl font-black">
                                What you’ll learn
                            </h2>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {(course.outcomes ?? []).map((outcome) => (
                                    <div
                                        key={outcome}
                                        className="flex gap-3 text-slate-600"
                                    >
                                        <CheckCircle2
                                            className="mt-0.5 shrink-0 text-blue-600"
                                            size={19}
                                        />
                                        <span>{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7">
                            <h2 className="text-2xl font-black">
                                Course curriculum
                            </h2>
                            <div className="mt-6 divide-y divide-slate-100">
                                {course.modules.map((module) => (
                                    <div
                                        key={module.id}
                                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                                    >
                                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                                            {module.position}
                                        </span>
                                        <div>
                                            <h3 className="font-bold">
                                                {module.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                {module.description}
                                            </p>
                                            {module.lessons && module.lessons.length > 0 && <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">{module.lessons.map((lesson) => <div key={lesson.id} className="flex items-center justify-between gap-4 text-sm text-slate-600"><span>{lesson.title}</span><span className="shrink-0 text-xs font-semibold text-slate-400">{lesson.is_free ? "Free preview" : `${lesson.duration} min`}</span></div>)}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {course.announcements && course.announcements.length > 0 && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">Course updates</h2><div className="mt-5 space-y-4">{course.announcements.map((announcement) => <article key={announcement.id} className="border-l-2 border-blue-500 pl-4"><h3 className="font-bold">{announcement.title}</h3><p className="mt-1 leading-7 text-slate-600">{announcement.content}</p></article>)}</div></section>}
                        {course.reviews && course.reviews.length > 0 && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">Student feedback</h2><div className="mt-5 space-y-4">{course.reviews.map((review) => <blockquote key={review.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-amber-500">{"★".repeat(review.rating)}</p>{review.comment && <p className="mt-2 leading-7 text-slate-600">“{review.comment}”</p>}<cite className="mt-2 block text-sm font-semibold not-italic text-slate-400">{review.student?.name ?? "Codexa student"}</cite></blockquote>)}</div></section>}
                    </div>
                    <aside className="h-fit rounded-3xl bg-white p-7 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 lg:sticky lg:top-6">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            Course investment
                        </p>
                        <p className="mt-2 text-3xl font-black">
                            {new Intl.NumberFormat("en-US").format(
                                Number(price),
                            )}{" "}
                            MMK
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Enrollments open soon. Join the academy to be
                            notified when this course starts.
                        </p>
                        <Link
                            href="/register"
                            className="mt-6 block rounded-xl bg-blue-600 px-5 py-3.5 text-center font-bold text-white transition hover:bg-blue-700"
                        >
                            Create an account
                        </Link>
                    </aside>
                </main>
            </div>
        </>
    );
}

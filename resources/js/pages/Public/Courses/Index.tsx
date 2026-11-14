import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    Clock3,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Category = { id: number; name: string; slug: string };
type Course = {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    level: string;
    duration: number;
    price: string;
    sale_price?: string;
    category?: Category;
    instructor?: { name: string };
    instructors?: { id?: number; name: string }[];
};
type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
type Props = {
    courses: Page<Course>;
    categories: Category[];
    filters: { q?: string; category?: number | null };
};

const money = (value: string) =>
    `${new Intl.NumberFormat("en-US").format(Number(value))} MMK`;

export default function Index({ courses, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? "");
    const [category, setCategory] = useState(
        filters.category?.toString() ?? "",
    );
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            "/courses",
            { q: q || undefined, category: category || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Academy courses" />
            <div className="min-h-screen bg-slate-50 text-slate-950">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
                            Codexa Academy
                        </p>
                        <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
                            Learn skills that ship.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                            Practical courses, guided projects, and a clearer
                            path from your first line of code to real-world
                            confidence.
                        </p>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row"
                    >
                        <label className="relative flex-1">
                            <span className="sr-only">Search courses</span>
                            <Search
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search courses…"
                                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                            <SlidersHorizontal
                                size={17}
                                className="text-slate-400"
                            />
                            <span className="sr-only">Filter by category</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-transparent py-3 pr-8 text-sm font-semibold outline-none"
                            >
                                <option value="">All categories</option>
                                {categories.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-blue-600">
                            Search
                        </button>
                    </form>
                    <div className="mt-10 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            {courses.total} course
                            {courses.total === 1 ? "" : "s"} available
                        </p>
                        <p className="hidden text-sm text-slate-500 sm:block">
                            {courses.from && courses.to
                                ? `Showing ${courses.from}–${courses.to}`
                                : "No results"}
                        </p>
                    </div>
                    {courses.data.length ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {courses.data.map((course) => (
                                <article
                                    key={course.id}
                                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                                >
                                    <div className="flex h-40 items-end bg-gradient-to-br from-blue-600 via-blue-500 to-slate-950 p-5">
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                                            {course.category?.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            <span>{course.level}</span>
                                            <span>·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock3 size={13} />{" "}
                                                {course.duration} hours
                                            </span>
                                        </div>
                                        <h2 className="mt-3 text-2xl font-black leading-tight">
                                            {course.title}
                                        </h2>
                                        <p className="mt-3 flex-1 leading-7 text-slate-600">
                                            {course.short_description}
                                        </p>
                                        {(() => {
                                            const names = Array.from(
                                                new Set(
                                                    [course.instructor?.name, ...(course.instructors ?? []).map((i) => i.name)].filter(
                                                        (n): n is string => Boolean(n),
                                                    ),
                                                ),
                                            );
                                            return names.length ? (
                                                <p className="mt-3 text-sm font-semibold text-slate-500">By {names.join(', ')}</p>
                                            ) : null;
                                        })()}
                                        <div className="mt-6 flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    From
                                                </p>
                                                <p className="mt-1 text-lg font-black text-slate-950">
                                                    {money(
                                                        course.sale_price ??
                                                            course.price,
                                                    )}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="inline-flex items-center gap-2 font-bold text-blue-600 transition group-hover:gap-3"
                                            >
                                                View course{" "}
                                                <ArrowRight size={17} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                            <BookOpen
                                className="mx-auto text-slate-300"
                                size={36}
                            />
                            <h2 className="mt-4 text-xl font-black">
                                No courses found
                            </h2>
                            <p className="mt-2 text-slate-500">
                                Try a different search or category.
                            </p>
                        </div>
                    )}
                    <nav
                        className="mt-10 flex flex-wrap justify-center gap-2"
                        aria-label="Course pagination"
                    >
                        {courses.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    className={`rounded-lg px-3 py-2 text-sm font-bold ${link.active ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50"}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="rounded-lg px-3 py-2 text-sm text-slate-300"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </nav>
                </main>
            </div>
        </>
    );
}

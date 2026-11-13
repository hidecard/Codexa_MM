import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowRight,
    CheckCircle2,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Category = { id: number; name: string; slug: string };
type Service = {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    features?: string[];
    category?: Category;
};
type Page<T> = {
    data: T[];
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};
type Props = {
    services: Page<Service>;
    categories: Category[];
    filters: { q?: string; category?: number | null };
};

export default function Index({ services, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? "");
    const [category, setCategory] = useState(
        filters.category?.toString() ?? "",
    );
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            "/services",
            { q: q || undefined, category: category || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Solutions" />
            <div className="min-h-screen bg-slate-50 text-slate-950">
                <header className="bg-slate-950 text-white">
                    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">
                            Codexa Solutions
                        </p>
                        <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
                            Build with confidence.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                            Technical partnership for web platforms, digital
                            systems, and product experiences that move your
                            business forward.
                        </p>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row"
                    >
                        <label className="relative flex-1">
                            <span className="sr-only">Search services</span>
                            <Search
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search solutions…"
                                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                            <SlidersHorizontal
                                size={17}
                                className="text-slate-400"
                            />
                            <span className="sr-only">
                                Filter by service category
                            </span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-transparent py-3 pr-8 text-sm font-semibold outline-none"
                            >
                                <option value="">All capabilities</option>
                                {categories.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
                            Search
                        </button>
                    </form>
                    <div className="mt-10 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            {services.total} solution
                            {services.total === 1 ? "" : "s"} available
                        </p>
                        <p className="hidden text-sm text-slate-500 sm:block">
                            {services.from && services.to
                                ? `Showing ${services.from}–${services.to}`
                                : "No results"}
                        </p>
                    </div>
                    {services.data.length ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {services.data.map((service) => (
                                <article
                                    key={service.id}
                                    className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                                >
                                    <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
                                        {service.title.slice(0, 1)}
                                    </div>
                                    <p className="mt-8 text-sm font-black uppercase tracking-wider text-slate-400">
                                        {service.category?.name}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black leading-tight">
                                        {service.title}
                                    </h2>
                                    <p className="mt-4 flex-1 leading-7 text-slate-600">
                                        {service.short_description}
                                    </p>
                                    <div className="mt-6 space-y-2">
                                        {(service.features ?? [])
                                            .slice(0, 3)
                                            .map((feature) => (
                                                <p
                                                    key={feature}
                                                    className="flex gap-2 text-sm font-semibold text-slate-600"
                                                >
                                                    <CheckCircle2
                                                        className="mt-0.5 shrink-0 text-blue-600"
                                                        size={16}
                                                    />
                                                    {feature}
                                                </p>
                                            ))}
                                    </div>
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="mt-8 inline-flex items-center gap-2 font-bold text-blue-600 transition group-hover:gap-3"
                                    >
                                        Explore solution{" "}
                                        <ArrowRight size={17} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                            <h2 className="text-xl font-black">
                                No solutions found
                            </h2>
                            <p className="mt-2 text-slate-500">
                                Try a different search or category.
                            </p>
                        </div>
                    )}
                    <nav
                        className="mt-10 flex flex-wrap justify-center gap-2"
                        aria-label="Services pagination"
                    >
                        {services.links.map((link, index) =>
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

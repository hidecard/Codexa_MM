import { Head, Link, router } from '@inertiajs/react';
import { Search, Star } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { SAMPLE_COURSES, SAMPLE_INSTRUCTORS, formatCount, initials, instructorInfo } from '../sample-data';

type Instructor = { id: number; name: string; courses_count: number; profile?: { bio?: string | null } | null };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { instructors?: Page<Instructor>; filters?: { q?: string } };

export default function Index({ instructors, filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const usingSample = !instructors || (instructors.data.length === 0 && !filters.q);
    const sampleFiltered = SAMPLE_INSTRUCTORS.filter((ins) => !q.trim() || ins.name.toLowerCase().includes(q.trim().toLowerCase()));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (usingSample) return;
        router.get('/instructors', { q: q || undefined }, { preserveState: true, replace: true });
    };

    return (
        <PublicLayout>
            <Head title="ဆရာ/ဆရာမများ" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">ဆရာ/ဆရာမများ</h1>
                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">လက်တွေ့ အတွေ့အကြုံရှိတဲ့ instructor တွေဆီကနေ မြန်မာဘာသာဖြင့် သင်ယူလိုက်ပါ</p>

                <form onSubmit={submit} className="mt-6 flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <label className="relative flex-1">
                        <span className="sr-only">ဆရာ ရှာရန်</span>
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8494b3] dark:text-[#67779c]" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ဆရာ အမည် ရှာရန်…"
                            className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm ring-1 ring-[#dce3f0] outline-none placeholder:text-[#8494b3] focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:placeholder:text-[#67779c]"
                        />
                    </label>
                    <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                        ရှာဖွေရန်
                    </button>
                </form>

                {usingSample ? (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sampleFiltered.map((ins) => {
                            const mine = SAMPLE_COURSES.filter((c) => c.instructor === ins.name);
                            return (
                                <article key={ins.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <div className="flex items-center gap-4">
                                        <span className="grid size-16 flex-none place-items-center rounded-2xl text-base font-extrabold text-white" style={{ background: ins.grad }}>
                                            {initials(ins.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-extrabold">{ins.name}</h3>
                                            <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{ins.role}</p>
                                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#5a6a8a] dark:text-[#97a6c6]">
                                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                                <b className="text-[#0d1730] dark:text-white">{ins.rating.toFixed(1)}</b> · ကျောင်းသား {formatCount(ins.students)} ယောက်
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3.5 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{ins.bio}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {mine.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/courses/${c.slug}`}
                                                className="rounded-full bg-[#eef3fb] px-3 py-1.5 text-xs font-bold hover:bg-teal-500/10 dark:bg-[#12234a]"
                                            >
                                                {c.title}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
                                        <span className="text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">သင်တန်း {mine.length} ခု</span>
                                        <Link href={`/courses?q=${encodeURIComponent(ins.name)}`} className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]">
                                            သင်တန်းများ
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : instructors!.data.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                        <p className="text-lg font-extrabold">ရှာဖွေမှုနဲ့ ကိုက်ညီတဲ့ ဆရာ မတွေ့ပါ</p>
                        <p className="mt-1.5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">တခြား အမည် ဖြင့် ပြန်ရှာကြည့်ပါ</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {instructors!.data.map((ins) => {
                                const info = instructorInfo(ins.name);
                                return (
                                    <article key={ins.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                        <div className="flex items-center gap-4">
                                            <span className="grid size-16 flex-none place-items-center rounded-2xl text-base font-extrabold text-white" style={{ background: info.grad }}>
                                                {initials(ins.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="truncate font-extrabold">{ins.name}</h3>
                                                <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{info.role}</p>
                                            </div>
                                        </div>
                                        <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{ins.profile?.bio ?? info.bio}</p>
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
                                            <span className="text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">သင်တန်း {ins.courses_count} ခု</span>
                                            <span className="flex gap-2">
                                                <Link
                                                    href={`/courses?q=${encodeURIComponent(ins.name)}`}
                                                    className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                                >
                                                    သင်တန်းများ
                                                </Link>
                                                <Link href={`/instructors/${ins.id}`} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                                                    အသေးစိတ် ကြည့်ရန်
                                                </Link>
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        {instructors!.links.length > 3 && (
                            <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                                {instructors!.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                                                link.active
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="rounded-lg px-3 py-2 text-sm text-[#8494b3]" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </nav>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}

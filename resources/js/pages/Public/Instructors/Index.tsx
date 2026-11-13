import { Head, Link, router } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Instructor = { id: number; name: string; courses_count: number; profile?: { bio?: string | null } | null };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

export default function Index({ instructors, filters }: { instructors: Page<Instructor>; filters: { q?: string } }) {
    const [q, setQ] = useState(filters.q ?? '');
    const submit = (event: FormEvent) => { event.preventDefault(); router.get('/instructors', { q: q || undefined }, { preserveState: true, replace: true }); };
    return (
        <PublicLayout>
            <Head title="Instructors" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Codexa Academy" title="Instructors" description="Learn from practitioners who build and teach with real-world experience." />
                <form onSubmit={submit} className="mt-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <label className="relative flex-1"><span className="sr-only">Search instructors</span><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search instructors…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                    <button className="rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white hover:bg-blue-600">Search</button>
                </form>
                {instructors.data.length === 0 ? (
                    <div className="mt-10"><EmptyState icon={<Users className="size-10" />} title="Instructor profiles coming soon" description="We are preparing instructor profiles and course lineups." /></div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {instructors.data.map((ins) => (
                                <Link key={ins.id} href={`/instructors/${ins.id}`} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-blue-700">{ins.name.charAt(0)}</div>
                                    <h2 className="mt-4 text-xl font-bold text-slate-950 group-hover:text-blue-700">{ins.name}</h2>
                                    {ins.profile?.bio && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{ins.profile.bio}</p>}
                                    <p className="mt-3 text-sm font-semibold text-slate-500">{ins.courses_count} published course{ins.courses_count === 1 ? '' : 's'}</p>
                                </Link>
                            ))}
                        </div>
                        <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                            {instructors.links.map((link, i) => link.url ? <Link key={i} href={link.url} preserveScroll className={`rounded-lg px-3 py-2 text-sm font-bold ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={i} className="rounded-lg px-3 py-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}
                        </nav>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}

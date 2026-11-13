import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderKanban } from 'lucide-react';

type Project = { id: number; title: string; slug: string; short_description?: string | null; client_name?: string | null; technologies?: string[] | null };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

export default function Index({ projects }: { projects: Page<Project> }) {
    return (
        <PublicLayout>
            <Head title="Portfolio" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Codexa Solutions" title="Portfolio" description="Selected projects and outcomes delivered for partners and clients." />
                {projects.data.length === 0 ? (
                    <div className="mt-10"><EmptyState icon={<FolderKanban className="size-10" />} title="Projects coming soon" description="We are curating case studies and project highlights. Check back shortly." action={<Link href="/contact" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Start a project →</Link>} /></div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((p) => (
                                <Link key={p.id} href={`/portfolio/${p.slug}`} className="group block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Case study</p>
                                    <h2 className="mt-2 text-xl font-bold text-slate-950 group-hover:text-blue-700">{p.title}</h2>
                                    {p.client_name && <p className="mt-1 text-sm text-slate-500">{p.client_name}</p>}
                                    {p.short_description && <p className="mt-3 text-slate-600">{p.short_description}</p>}
                                    {p.technologies && p.technologies.length > 0 && <p className="mt-4 text-xs font-medium text-slate-500">{p.technologies.join(' · ')}</p>}
                                </Link>
                            ))}
                        </div>
                        <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                            {projects.links.map((link, i) => link.url ? <Link key={i} href={link.url} preserveScroll className={`rounded-lg px-3 py-2 text-sm font-bold ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={i} className="rounded-lg px-3 py-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}
                        </nav>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}

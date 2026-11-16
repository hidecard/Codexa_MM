import { Head, Link } from '@inertiajs/react';
import { FolderKanban, Search } from 'lucide-react';
import { ClientEmpty, ClientPage, Meta, PortalCard, StatusBadge } from '@/components/client-portal';
import { CardContent } from '@/components/ui/card';

type Project = {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    start_date?: string | null;
    due_date?: string | null;
    budget?: string | number | null;
    milestones?: { id: number; title: string; status: string }[];
};

type Paginator<T> = { data: T[]; total: number; current_page: number; last_page: number };

type Props = {
    projects?: Paginator<Project> | { data?: Project[] };
    filters?: { search?: string; status?: string };
};

export default function Index({ projects, filters = {} }: Props) {
    const items = projects?.data ?? [];
    const search = filters.search?.trim();
    const total = projects && 'total' in projects ? projects.total : items.length;

    return (
        <ClientPage title="Projects" description="Track delivery progress, milestones, updates, and project records in one place.">
            <Head title="Client Projects" />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Search className="size-4" />
                    {search ? `Showing results for “${search}”` : `${total} projects`}
                </div>
                <Link href="/client/support" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Contact support</Link>
            </div>
            {items.length === 0 ? (
                <div className="mt-8"><ClientEmpty title="No projects yet" description="Your active and completed projects will appear here." /></div>
            ) : (
                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {items.map((project) => (
                        <PortalCard key={project.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FolderKanban className="size-5" /></div>
                                        <div>
                                            <Link href={`/client/projects/${project.id}`} className="text-lg font-black text-slate-950 hover:text-blue-700">{project.title}</Link>
                                            <Meta>{project.description || 'No project description provided.'}</Meta>
                                        </div>
                                    </div>
                                    <StatusBadge value={project.status} />
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-500">Start date</span><strong>{project.start_date || 'Not set'}</strong></div>
                                    <div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-500">Due date</span><strong>{project.due_date || 'Not set'}</strong></div>
                                </div>
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="text-sm text-slate-500">{project.milestones?.length ?? 0} milestones loaded</span>
                                    <Link href={`/client/projects/${project.id}`} className="text-sm font-bold text-blue-700 hover:text-blue-900">View project →</Link>
                                </div>
                            </CardContent>
                        </PortalCard>
                    ))}
                </div>
            )}
        </ClientPage>
    );
}

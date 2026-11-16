import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Flag } from 'lucide-react';
import { ClientEmpty, ClientPage, Meta, PortalCard, StatusBadge } from '@/components/client-portal';
import { CardContent } from '@/components/ui/card';

type Milestone = {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    start_date?: string | null;
    due_date?: string | null;
    completion_percentage: number;
    project?: { id: number; title: string } | null;
    tasks?: { id: number; title: string; status: string }[];
};

type Props = { milestones?: { data?: Milestone[]; total?: number } | Milestone[] };

export default function Index({ milestones = [] }: Props) {
    const items = Array.isArray(milestones) ? milestones : milestones.data ?? [];
    return (
        <ClientPage title="Milestones" description="Follow the delivery checkpoints that move your projects forward.">
            <Head title="Client Milestones" />
            {items.length === 0 ? (
                <div className="mt-8"><ClientEmpty title="No milestones yet" description="Project milestones will appear here once delivery planning begins." /></div>
            ) : (
                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {items.map((milestone) => (
                        <PortalCard key={milestone.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{milestone.project?.title || 'Project'}</p>
                                        <Link href={`/client/milestones/${milestone.id}`} className="mt-1 block text-lg font-black text-slate-950 hover:text-blue-700">{milestone.title}</Link>
                                        <Meta>{milestone.description || 'No milestone description provided.'}</Meta>
                                    </div>
                                    <StatusBadge value={milestone.status} />
                                </div>
                                <div className="mt-5">
                                    <div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700">Progress</span><span className="text-slate-500">{milestone.completion_percentage}%</span></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${milestone.completion_percentage}%` }} /></div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />Due {milestone.due_date || 'Not set'}</span>
                                    <span className="inline-flex items-center gap-1.5"><Flag className="size-4" />{milestone.tasks?.length ?? 0} tasks</span>
                                </div>
                            </CardContent>
                        </PortalCard>
                    ))}
                </div>
            )}
        </ClientPage>
    );
}

import { Head, Link } from '@inertiajs/react';
import { CheckSquare, Clock3 } from 'lucide-react';
import { ClientEmpty, ClientPage, Meta, PortalCard, StatusBadge } from '@/components/client-portal';
import { CardContent } from '@/components/ui/card';

type Task = {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    priority: number;
    due_date?: string | null;
    milestone?: { id: number; title: string; project?: { id: number; title: string } | null } | null;
    assignee?: { name: string } | null;
};

type Props = { tasks?: { data?: Task[]; total?: number } | Task[]; filters?: { search?: string; status?: string; priority?: string | number } };

const priorityLabel: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };

export default function Index({ tasks = [], filters = {} }: Props) {
    const items = Array.isArray(tasks) ? tasks : tasks.data ?? [];
    return (
        <ClientPage title="Tasks" description="See the work items assigned across your active projects.">
            <Head title="Client Tasks" />
            <div className="mt-8 flex flex-wrap gap-2 text-sm text-slate-500">
                {filters.search && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Search: {filters.search}</span>}
                {filters.status && <span className="rounded-full bg-slate-100 px-3 py-1">Status: {filters.status}</span>}
                <span className="rounded-full bg-slate-100 px-3 py-1">{Array.isArray(tasks) ? items.length : tasks.total ?? items.length} tasks</span>
            </div>
            {items.length === 0 ? (
                <div className="mt-8"><ClientEmpty title="No tasks yet" description="Tasks will appear here as milestones are planned." /></div>
            ) : (
                <div className="mt-8 grid gap-3">
                    {items.map((task) => (
                        <PortalCard key={task.id}>
                            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><CheckSquare className="size-5" /></div>
                                    <div className="min-w-0">
                                        <Link href={`/client/tasks/${task.id}`} className="font-black text-slate-950 hover:text-blue-700">{task.title}</Link>
                                        <Meta>{task.milestone?.project?.title || 'Project'} · {task.milestone?.title || 'Milestone'}{task.assignee ? ` · ${task.assignee.name}` : ''}</Meta>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{priorityLabel[task.priority] || 'Priority'}</span>
                                    <StatusBadge value={task.status} />
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 className="size-3.5" />{task.due_date || 'No due date'}</span>
                                </div>
                            </CardContent>
                        </PortalCard>
                    ))}
                </div>
            )}
        </ClientPage>
    );
}

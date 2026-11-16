import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, FileText, MessageSquare, Send } from 'lucide-react';
import { ClientPage, Meta, PortalCard, StatusBadge } from '@/components/client-portal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Project = {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    start_date?: string | null;
    due_date?: string | null;
    milestones?: { id: number; title: string; status: string; completion_percentage: number; tasks?: { id: number; title: string; status: string }[] }[];
    documents?: { id: number; original_name?: string | null; file_type: string }[];
    updates?: { id: number; content: string; created_at: string; user?: { name: string } | null }[];
    quotations?: { id: number; quotation_number: string; status: string; total: string | number }[];
    invoices?: { id: number; invoice_number: string; status: string; total: string | number }[];
};

type Props = { project: Project };

export default function Show({ project }: Props) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({ content: '' });
    const submit = () => form.post(`/client/projects/${project.id}/updates`, { onSuccess: () => { form.reset(); setShowForm(false); } });

    return (
        <ClientPage title={project.title} description={project.description || 'Project delivery overview and shared records.'}>
            <Head title={project.title} />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Link href="/client/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700"><ArrowLeft className="size-4" /> All projects</Link>
                <StatusBadge value={project.status} />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="space-y-6">
                    <PortalCard><CardContent className="p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Milestones</h2><Badge variant="outline">{project.milestones?.length ?? 0}</Badge></div><div className="mt-4 space-y-3">{project.milestones?.length ? project.milestones.map((milestone) => <div key={milestone.id} className="rounded-xl border border-slate-100 p-4"><div className="flex justify-between gap-3"><div><Link href={`/client/milestones/${milestone.id}`} className="font-bold hover:text-blue-700">{milestone.title}</Link><Meta>{milestone.tasks?.length ?? 0} tasks</Meta></div><StatusBadge value={milestone.status} /></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${milestone.completion_percentage}%` }} /></div></div>) : <p className="text-sm text-slate-500">No milestones have been added.</p>}</div></CardContent></PortalCard>
                    <PortalCard><CardContent className="p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Updates</h2><Button type="button" variant="outline" onClick={() => setShowForm((value) => !value)}><MessageSquare className="mr-2 size-4" /> Add update</Button></div>{showForm && <div className="mt-4 rounded-xl bg-slate-50 p-4"><Textarea value={form.data.content} onChange={(event) => form.setData('content', event.target.value)} placeholder="Share a project update..." /><div className="mt-3 flex justify-end"><Button type="button" onClick={submit} disabled={form.processing || !form.data.content.trim()}><Send className="mr-2 size-4" /> Post update</Button></div></div>}<div className="mt-4 space-y-4">{project.updates?.length ? project.updates.map((update) => <div key={update.id} className="border-l-2 border-blue-200 pl-4"><p className="text-sm text-slate-700">{update.content}</p><Meta>{update.user?.name || 'Project team'} · {update.created_at}</Meta></div>) : <p className="text-sm text-slate-500">No updates yet.</p>}</div></CardContent></PortalCard>
                </div>
                <div className="space-y-6">
                    <PortalCard><CardContent className="p-6"><h2 className="text-lg font-black">Project dates</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-500">Start</span><strong>{project.start_date || 'Not set'}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-500">Due</span><strong>{project.due_date || 'Not set'}</strong></div></div></CardContent></PortalCard>
                    <PortalCard><CardContent className="p-6"><h2 className="text-lg font-black">Shared documents</h2><div className="mt-4 space-y-3">{project.documents?.length ? project.documents.map((document) => <Link key={document.id} href={`/client/documents/${document.id}/download`} className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"><FileText className="size-4" />{document.original_name || document.file_type}</Link>) : <p className="text-sm text-slate-500">No documents yet.</p>}</div></CardContent></PortalCard>
                    <PortalCard><CardContent className="p-6"><h2 className="text-lg font-black">Billing</h2><div className="mt-4 space-y-3">{project.quotations?.map((quotation) => <Link key={`q-${quotation.id}`} href={`/client/quotations/${quotation.id}`} className="flex items-center justify-between text-sm"><span>{quotation.quotation_number}</span><StatusBadge value={quotation.status} /></Link>)}{project.invoices?.map((invoice) => <Link key={`i-${invoice.id}`} href={`/client/invoices/${invoice.id}`} className="flex items-center justify-between text-sm"><span>{invoice.invoice_number}</span><StatusBadge value={invoice.status} /></Link>)}{!project.quotations?.length && !project.invoices?.length && <p className="text-sm text-slate-500">No billing records yet.</p>}</div></CardContent></PortalCard>
                </div>
            </div>
        </ClientPage>
    );
}

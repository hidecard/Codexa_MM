import { Head, Link } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { ClientEmpty, ClientPage, Meta, PortalCard } from '@/components/client-portal';
import { CardContent } from '@/components/ui/card';

type Document = {
    id: number;
    original_name?: string | null;
    file_type: string;
    file_size?: number | null;
    created_at?: string;
    project?: { id: number; title: string } | null;
};

type Props = { documents?: { data?: Document[]; total?: number } | Document[] };

function readableSize(bytes?: number | null) {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Index({ documents = [] }: Props) {
    const items = Array.isArray(documents) ? documents : documents.data ?? [];
    return (
        <ClientPage title="Documents" description="Access the files shared with you across your projects.">
            <Head title="Client Documents" />
            {items.length === 0 ? (
                <div className="mt-8"><ClientEmpty title="No documents yet" description="Shared project files will appear here." /></div>
            ) : (
                <div className="mt-8 grid gap-3">
                    {items.map((document) => (
                        <PortalCard key={document.id}>
                            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="size-5" /></div>
                                    <div>
                                        <p className="font-black text-slate-950">{document.original_name || 'Project document'}</p>
                                        <Meta>{document.project?.title || 'Project'} · {document.file_type} · {readableSize(document.file_size)}</Meta>
                                    </div>
                                </div>
                                <Link href={`/client/documents/${document.id}/download`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                                    <Download className="size-4" /> Download
                                </Link>
                            </CardContent>
                        </PortalCard>
                    ))}
                </div>
            )}
        </ClientPage>
    );
}

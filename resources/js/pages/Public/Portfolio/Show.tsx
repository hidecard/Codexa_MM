import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { ArrowLeft, ExternalLink } from 'lucide-react';

type Project = { title: string; description: string; short_description?: string | null; client_name?: string | null; project_url?: string | null; technologies?: string[] | null; images?: { id: number; file_path: string; alt_text?: string | null }[] };

export default function Show({ project }: { project: Project }) {
    return (
        <PublicLayout>
            <Head title={project.title} />
            <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"><ArrowLeft className="size-4" /> Back to portfolio</Link>
                <header className="mt-8">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Portfolio</p>
                    <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{project.title}</h1>
                    {project.client_name && <p className="mt-2 text-slate-600">Client: {project.client_name}</p>}
                </header>
                {project.technologies && project.technologies.length > 0 && <p className="mt-6 text-sm font-medium text-slate-600">Technologies: {project.technologies.join(', ')}</p>}
                <div className="prose prose-slate mt-8 max-w-none"><p className="whitespace-pre-line leading-7 text-slate-700">{project.description}</p></div>
                {project.project_url && <p className="mt-8"><a href={project.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700">Visit project <ExternalLink className="size-4" /></a></p>}
            </article>
        </PublicLayout>
    );
}

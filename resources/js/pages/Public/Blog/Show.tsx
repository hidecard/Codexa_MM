import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { ArrowLeft } from 'lucide-react';

type Post = { title: string; content: string; excerpt?: string | null; published_at?: string | null; category?: { name: string } | null; author?: { name: string } | null };

export default function Show({ post }: { post: Post }) {
    return (
        <PublicLayout>
            <Head title={post.title} />
            <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"><ArrowLeft className="size-4" /> Back to blog</Link>
                <header className="mt-8">
                    {post.category && <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{post.category.name}</p>}
                    <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{post.title}</h1>
                    <p className="mt-3 text-sm text-slate-500">{post.author?.name}{post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ''}</p>
                </header>
                <div className="mt-8 whitespace-pre-line leading-7 text-slate-700">{post.content}</div>
            </article>
        </PublicLayout>
    );
}

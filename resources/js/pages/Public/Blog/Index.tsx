import { Head, Link, router } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Newspaper, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Post = { id: number; title: string; slug: string; excerpt?: string | null; published_at?: string | null; category?: { name: string } | null; author?: { name: string } | null };
type Category = { id: number; name: string; slug: string };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { posts: Page<Post>; categories: Category[]; filters: { q?: string; category?: number | null } };

export default function Index({ posts, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category?.toString() ?? '');
    const submit = (e: FormEvent) => { e.preventDefault(); router.get('/blog', { q: q || undefined, category: category || undefined }, { preserveState: true, replace: true }); };

    return (
        <PublicLayout>
            <Head title="Blog" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Codexa MM" title="Blog" description="Insights on learning, building software, and growing in tech." />
                <form onSubmit={submit} className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                    <label className="relative flex-1"><span className="sr-only">Search posts</span><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                    <label className="sm:w-56"><span className="sr-only">Category</span><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                    <button className="rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white hover:bg-blue-600">Search</button>
                </form>
                {posts.data.length === 0 ? (
                    <div className="mt-10"><EmptyState icon={<Newspaper className="size-10" />} title="No posts yet" description="Articles and updates will appear here soon." /></div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    {post.category && <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{post.category.name}</p>}
                                    <h2 className="mt-2 text-xl font-bold text-slate-950 group-hover:text-blue-700">{post.title}</h2>
                                    {post.excerpt && <p className="mt-3 text-slate-600">{post.excerpt}</p>}
                                    <p className="mt-4 text-sm text-slate-500">{post.author?.name}{post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ''}</p>
                                </Link>
                            ))}
                        </div>
                        <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                            {posts.links.map((link, i) => link.url ? <Link key={i} href={link.url} preserveScroll className={`rounded-lg px-3 py-2 text-sm font-bold ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={i} className="rounded-lg px-3 py-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}
                        </nav>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}



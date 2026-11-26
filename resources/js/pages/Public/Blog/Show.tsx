import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PublicLayout } from '@/components/shared/public-layout';
import { categoryMeta, initials, instructorInfo } from '@/lib/ui-utils';

type Post = {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string | null;
    published_at?: string | null;
    featured_image?: string | null;
    category?: { name: string } | null;
    author?: { name: string } | null;
};
type Related = { id: number; title: string; slug: string; excerpt?: string | null; published_at?: string | null; category?: { name: string } | null; author?: { name: string } | null };
type Props = { post?: Post | null; related?: Related[] };

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Show({ post: apiPost, related = [] }: Props) {
    const post = apiPost!;
    const paragraphs = post.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const meta = categoryMeta(post.category?.name);
    const authorName = post.author?.name ?? 'Codexa MM အဖွဲ့';
    const info = instructorInfo(authorName);
    const dateLabel = formatDate(post.published_at);

    const relatedPosts = related.length > 0
        ? related.map((r) => {
              const m = categoryMeta(r.category?.name);
              return {
                  key: String(r.id),
                  title: r.title,
                  slug: r.slug,
                  meta: `${r.author?.name ?? ''}${formatDate(r.published_at) ? ` · ${formatDate(r.published_at)}` : ''}`,
                  grad: m.grad,
                  glyph: m.glyph,
              };
          })
        : [];

    return (
        <PublicLayout>
            <Head title={post.title} />
            <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]">
                    <ArrowLeft className="size-4" /> နောက်သို့
                </Link>

                {post.featured_image ? (
                    <img src={post.featured_image} alt="" className="mt-5 aspect-[21/9] w-full rounded-2xl object-cover" />
                ) : (
                    <div className="relative mt-5 grid aspect-[21/9] place-items-center overflow-hidden rounded-2xl" style={{ background: meta.grad }}>
                        <span className="font-mono text-5xl font-bold text-white/95" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                            {meta.glyph}
                        </span>
                        {post.category && (
                            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">{post.category.name}</span>
                        )}
                    </div>
                )}

                <div className="mt-5 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:p-8">
                    <h1 className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">{post.title}</h1>
                    <div className="mt-4 flex items-center gap-2.5">
                        <span className="grid size-10 flex-none place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: info.grad }}>
                            {initials(authorName)}
                        </span>
                        <div>
                            <p className="text-sm font-bold">{authorName}</p>
                            <p className="text-xs text-[#5a6a8a] dark:text-[#97a6c6]">{dateLabel}</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-5">
                        {paragraphs.map((p, i) => (
                            <p key={i} className="text-[0.95rem] leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                                {p}
                            </p>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2.5 border-t border-[#e7ecf5] pt-5 dark:border-[#18264a]">
                        <Link href="/courses" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                            သင်တန်းများ ကြည့်ရန်
                        </Link>
                        <Link
                            href="/blog"
                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                        >
                            ဆောင်းပါး အားလုံး
                        </Link>
                    </div>
                </div>

                {relatedPosts.length > 0 && (
                    <>
                        <h2 className="mb-3.5 mt-8 text-lg font-extrabold tracking-tight">ဆက်စပ် ဆောင်းပါးများ</h2>
                        <div className="space-y-3">
                            {relatedPosts.map((r) => (
                                <div key={r.key} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <div className="grid w-[92px] flex-none place-items-center rounded-xl py-4" style={{ background: r.grad }}>
                                        <span className="font-mono text-base font-bold text-white">{r.glyph}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/blog/${r.slug}`} className="block truncate text-sm font-extrabold leading-snug hover:text-teal-700 dark:hover:text-teal-300">
                                            {r.title}
                                        </Link>
                                        <p className="mt-1 text-xs text-[#5a6a8a] dark:text-[#97a6c6]">{r.meta}</p>
                                    </div>
                                    <Link
                                        href={`/blog/${r.slug}`}
                                        className="flex-none rounded-xl bg-white px-3.5 py-2 text-xs font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                    >
                                        ဖတ်ရန်
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </article>
        </PublicLayout>
    );
}
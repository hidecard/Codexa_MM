import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';
import { BLOG_CATS, SAMPLE_POSTS, categoryMeta, formatCount } from '../sample-data';

type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    published_at?: string | null;
    featured_image?: string | null;
    category?: { id?: number; name: string } | null;
    author?: { name: string } | null;
};
type Category = { id: number; name: string; slug: string };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { posts?: Page<Post>; categories?: Category[]; filters?: { q?: string; category?: number | null } };

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Index({ posts, categories = [], filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [sampleCat, setSampleCat] = useState('All');
    const usingSample = !posts || (posts.data.length === 0 && !filters.q && !filters.category);

    const sampleFiltered = SAMPLE_POSTS.filter((p) => {
        if (sampleCat !== 'All' && p.cat !== sampleCat) return false;
        if (q.trim()) {
            const needle = q.trim().toLowerCase();
            if (!`${p.title} ${p.excerpt}`.toLowerCase().includes(needle)) return false;
        }
        return true;
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (usingSample) return;
        router.get('/blog', { q: q || undefined, category: filters.category || undefined }, { preserveState: true, replace: true });
    };

    const pickCategory = (id: number | null) => {
        router.get('/blog', { q: q || undefined, category: id || undefined }, { preserveState: true, replace: true });
    };

    const count = usingSample ? sampleFiltered.length : (posts?.data.length ?? 0);

    return (
        <PublicLayout>
            <Head title="ဆောင်းပါးများ" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">ဆောင်းပါးများ</h1>
                        <p className="mt-1 max-w-2xl text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                            Programming သင်ယူနည်း၊ အလုပ်အကိုင် အကြံပြုချက်နဲ့ နည်းပညာ ဆောင်းပါးများ — Codexa MM အဖွဲ့နဲ့ ဆရာများက ရေးသားပါတယ်
                        </p>
                    </div>
                    <span className="rounded-full bg-teal-500/10 px-3.5 py-1.5 text-xs font-extrabold text-teal-700 dark:text-teal-300">ဆောင်းပါး {formatCount(count)} ပုဒ်</span>
                </div>

                <form onSubmit={submit} className="mt-6 flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <label className="relative flex-1">
                        <span className="sr-only">ဆောင်းပါး ရှာရန်</span>
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8494b3] dark:text-[#67779c]" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ဆောင်းပါး ရှာရန်…"
                            className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm ring-1 ring-[#dce3f0] outline-none placeholder:text-[#8494b3] focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:placeholder:text-[#67779c]"
                        />
                    </label>
                    <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                        ရှာဖွေရန်
                    </button>
                </form>

                <div className="mt-5 flex flex-wrap gap-2">
                    {usingSample
                        ? BLOG_CATS.map((cat) => (
                              <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setSampleCat(cat)}
                                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                      sampleCat === cat
                                          ? 'bg-teal-600 text-white'
                                          : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                                  }`}
                              >
                                  {cat === 'All' ? 'အားလုံး' : cat}
                              </button>
                          ))
                        : [
                              <button
                                  key="all"
                                  type="button"
                                  onClick={() => pickCategory(null)}
                                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                      !filters.category
                                          ? 'bg-teal-600 text-white'
                                          : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                                  }`}
                              >
                                  အားလုံး
                              </button>,
                              ...categories.map((c) => (
                                  <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => pickCategory(c.id)}
                                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                          filters.category === c.id
                                              ? 'bg-teal-600 text-white'
                                              : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]'
                                      }`}
                                  >
                                      {c.name}
                                  </button>
                              )),
                          ]}
                </div>

                {usingSample ? (
                    sampleFiltered.length > 0 ? (
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {sampleFiltered.map((post) => (
                                <article key={post.id} className="overflow-hidden rounded-2xl bg-white p-3.5 ring-1 ring-[#dce3f0] transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                    <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl" style={{ background: post.grad }}>
                                        <span className="font-mono text-3xl font-bold text-white/95" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                            {post.glyph}
                                        </span>
                                        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[0.65rem] font-bold text-white backdrop-blur">{post.cat}</span>
                                    </div>
                                    <div className="px-1.5 pb-1.5 pt-3.5">
                                        <h3 className="text-base font-extrabold leading-snug">
                                            <Link href={`/blog/${post.slug}`} className="hover:text-teal-700 dark:hover:text-teal-300">
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{post.excerpt}</p>
                                        <p className="mt-3.5 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                            <span className="text-[#0d1730] dark:text-white">{post.author}</span> · {post.date} · ဖတ်ချိန် {post.read}
                                        </p>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="mt-4 block rounded-xl bg-white py-2.5 text-center text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                        >
                                            ဆက်ဖတ်ရန်
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <p className="text-lg font-extrabold">ဒီ အမျိုးအစားမှာ ဆောင်းပါး မရှိသေးပါ</p>
                            <button type="button" onClick={() => { setSampleCat('All'); setQ(''); }} className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                                ဆောင်းပါး အားလုံး ကြည့်ရန်
                            </button>
                        </div>
                    )
                ) : posts!.data.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                        <p className="text-lg font-extrabold">ဆောင်းပါး မတွေ့ပါ</p>
                        <p className="mt-1.5 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">တခြား keyword သို့မဟုတ် အမျိုးအစား ဖြင့် ပြန်ရှာကြည့်ပါ</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {posts!.data.map((post) => {
                                const meta = categoryMeta(post.category?.name);
                                return (
                                    <article key={post.id} className="overflow-hidden rounded-2xl bg-white p-3.5 ring-1 ring-[#dce3f0] transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                                        {post.featured_image ? (
                                            <img src={post.featured_image} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
                                        ) : (
                                            <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl" style={{ background: meta.grad }}>
                                                <span className="font-mono text-3xl font-bold text-white/95" style={{ textShadow: '0 4px 18px rgba(0,0,0,.35)' }}>
                                                    {meta.glyph}
                                                </span>
                                            </div>
                                        )}
                                        <div className="px-1.5 pb-1.5 pt-3.5">
                                            {post.category && <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">{post.category.name}</p>}
                                            <h3 className="mt-1.5 text-base font-extrabold leading-snug">
                                                <Link href={`/blog/${post.slug}`} className="hover:text-teal-700 dark:hover:text-teal-300">
                                                    {post.title}
                                                </Link>
                                            </h3>
                                            {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{post.excerpt}</p>}
                                            <p className="mt-3.5 text-xs font-semibold text-[#5a6a8a] dark:text-[#97a6c6]">
                                                {post.author?.name}
                                                {formatDate(post.published_at) ? ` · ${formatDate(post.published_at)}` : ''}
                                            </p>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="mt-4 block rounded-xl bg-white py-2.5 text-center text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                                            >
                                                ဆက်ဖတ်ရန်
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        {posts!.links.length > 3 && (
                            <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
                                {posts!.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                                                link.active
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-white text-[#5a6a8a] ring-1 ring-[#dce3f0] hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:ring-[#1e2c52]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="rounded-lg px-3 py-2 text-sm text-[#8494b3]" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </nav>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}

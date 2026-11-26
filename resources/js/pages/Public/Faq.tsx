import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, Mail, MessageSquare, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { PublicLayout } from '@/components/shared/public-layout';

type FaqItem = { id: number; question: string; answer: string; category?: string | null };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { faqs?: Page<FaqItem>; categories?: string[]; filters?: { q?: string; category?: string } };

export default function Faq({ faqs, categories = [], filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [openId, setOpenId] = useState<number | null>(null);
    const items = faqs?.data?.length ? faqs.data : faqs ? [] : [];

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!faqs) return;
        router.get('/faq', { q: q || undefined, category: category || undefined }, { preserveState: true, replace: true });
    };

    const visible = faqs
        ? items
        : items.filter((item) => {
              if (q.trim()) {
                  const needle = q.trim().toLowerCase();
                  if (!`${item.question} ${item.answer}`.toLowerCase().includes(needle)) return false;
              }
              return true;
          });

    return (
        <PublicLayout>
            <Head title="အကူအညီ & FAQ" />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">အကူအညီ & FAQ</h1>
                <p className="mt-1 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">မကြာခဏ မေးလေ့ရှိတဲ့ မေးခွန်းတွေရဲ့ အဖြေများနဲ့ support ထံ ဆက်သွယ်ရန် နည်းလမ်းများ</p>

                <form onSubmit={submit} className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] sm:flex-row">
                    <label className="relative flex-1">
                        <span className="sr-only">မေးခွန်း ရှာရန်</span>
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8494b3] dark:text-[#67779c]" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="မေးခွန်း ရှာရန်…"
                            className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm ring-1 ring-[#dce3f0] outline-none placeholder:text-[#8494b3] focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:placeholder:text-[#67779c]"
                        />
                    </label>
                    {categories.length > 0 && (
                        <label className="sm:w-44">
                            <span className="sr-only">အမျိုးအစား</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-[#dce3f0] outline-none focus:ring-2 focus:ring-teal-500 dark:bg-[#0d1730] dark:ring-[#1e2c52]"
                            >
                                <option value="">အမျိုးအစား အားလုံး</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                        ရှာဖွေရန်
                    </button>
                </form>

                <h2 className="mt-10 text-xl font-extrabold">အမေးများသော မေးခွန်းများ</h2>
                <div className="mt-4 space-y-3.5">
                    {visible.map((item) => (
                        <div key={item.id ?? item.question} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                            <button type="button" onClick={() => setOpenId(openId === item.id ? null : item.id)} className="flex w-full items-center gap-3 p-5 text-left">
                                <span className="min-w-0 flex-1 font-extrabold leading-snug">{item.question}</span>
                                <ChevronDown className={`size-4 flex-none text-[#8494b3] transition-transform dark:text-[#67779c] ${openId === item.id ? 'rotate-180' : ''}`} />
                            </button>
                            {openId === item.id && (
                                <div className="px-5 pb-5">
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {visible.length === 0 && (
                        <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#5a6a8a] ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:text-[#97a6c6]">
                            ရှာဖွေမှုနဲ့ ကိုက်ညီတဲ့ မေးခွန်း မတွေ့ပါ
                        </p>
                    )}
                </div>

                {faqs && faqs.links.length > 3 && (
                    <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="FAQ pagination">
                        {faqs.links.map((link, i) =>
                            link.url ? (
                                <a
                                    key={i}
                                    href={link.url}
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

                <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-[#dce3f0] dark:bg-[#0d1730] dark:ring-[#1e2c52]">
                    <h2 className="text-lg font-extrabold">Support Ticket တင်ရန်</h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                        အဖြေ မတွေ့ရင် ပြဿနာကို အသေးစိတ် ရေးပြီး တင်ပေးပါ — ပုံမှန်အားဖြင့် 1 ရက်အတွင်း ပြန်ဖြေပေးပါတယ်
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">
                            <Mail className="size-4" /> ဆက်သွယ်ရန်
                        </Link>
                        <Link
                            href="/student/messages"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                        >
                            <MessageSquare className="size-4" /> Messages မှ စာပို့ရန်
                        </Link>
                        <Link
                            href="/student/community"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold ring-1 ring-[#dce3f0] transition hover:bg-[#eef3fb] dark:bg-[#0d1730] dark:ring-[#1e2c52] dark:hover:bg-[#12234a]"
                        >
                            Community မှာ မေးရန်
                        </Link>
                    </div>
                    <p className="mt-4 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                        Email: <a href="mailto:support@codexamm.com" className="font-semibold text-teal-700 dark:text-teal-300">support@codexamm.com</a>
                    </p>
                </section>
            </div>
        </PublicLayout>
    );
}

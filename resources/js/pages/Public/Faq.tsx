import { Head, router } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type FaqItem = { id: number; question: string; answer: string; category?: string | null };
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { faqs?: Page<FaqItem>; categories?: string[]; filters?: { q?: string; category?: string } };

const fallback: FaqItem[] = [
    { id: 1, question: 'What is Codexa MM?', answer: 'Codexa MM is a platform combining Codexa Academy (programming education) and Codexa Solutions (software development services).' },
    { id: 2, question: 'Who can enroll in courses?', answer: 'Anyone can register as a student to browse and enroll in available courses.' },
    { id: 3, question: 'Do you build custom software?', answer: 'Yes. Codexa Solutions provides web, mobile, and software development services. Contact us to discuss your project.' },
    { id: 4, question: 'How do I get started?', answer: 'Create an account to access the student portal, or reach out through the contact page for services and partnerships.' },
];

export default function Faq({ faqs, categories = [], filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const items = faqs?.data?.length ? faqs.data : (faqs ? [] : fallback);
    const submit = (event: FormEvent) => { event.preventDefault(); router.get('/faq', { q: q || undefined, category: category || undefined }, { preserveState: true, replace: true }); };

    return (
        <PublicLayout>
            <Head title="FAQ" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Support" title="Frequently Asked Questions" description="Quick answers about Codexa MM, our academy, and our services." />
                <form onSubmit={submit} className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                    <label className="relative flex-1"><span className="sr-only">Search FAQs</span><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                    <label className="sm:w-44"><span className="sr-only">Filter by category</span><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                    <button className="rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white hover:bg-blue-600">Search</button>
                </form>
                <div className="mt-10 space-y-4">
                    {items.map((item) => (
                        <details key={item.id ?? item.question} className="group rounded-2xl border border-slate-200 bg-white p-5">
                            <summary className="cursor-pointer list-none rounded-lg font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{item.question}</summary>
                            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{item.answer}</p>
                        </details>
                    ))}
                </div>
                {faqs && <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="FAQ pagination">{faqs.links.map((link, i) => link.url ? <a key={i} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-bold ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={i} className="rounded-lg px-3 py-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
            </div>
        </PublicLayout>
    );
}

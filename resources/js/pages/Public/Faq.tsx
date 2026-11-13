import { Head } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';

type FaqItem = { id: number; question: string; answer: string; category?: string | null };
const fallback: FaqItem[] = [
    { id: 1, question: 'What is Codexa MM?', answer: 'Codexa MM is a platform combining Codexa Academy (programming education) and Codexa Solutions (software development services).' },
    { id: 2, question: 'Who can enroll in courses?', answer: 'Anyone can register as a student to browse and enroll in available courses.' },
    { id: 3, question: 'Do you build custom software?', answer: 'Yes. Codexa Solutions provides web, mobile, and software development services. Contact us to discuss your project.' },
    { id: 4, question: 'How do I get started?', answer: 'Create an account to access the student portal, or reach out through the contact page for services and partnerships.' },
];

export default function Faq({ faqs = [] }: { faqs?: FaqItem[] }) {
    const items = faqs.length ? faqs : fallback;
    return (
        <PublicLayout>
            <Head title="FAQ" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Support" title="Frequently Asked Questions" description="Quick answers about Codexa MM, our academy, and our services." />
                <div className="mt-10 space-y-4">
                    {items.map((item) => (
                        <details key={item.id ?? item.question} className="group rounded-2xl border border-slate-200 bg-white p-5">
                            <summary className="cursor-pointer list-none font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">{item.question}</summary>
                            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}

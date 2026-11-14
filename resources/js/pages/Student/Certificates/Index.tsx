import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { Award, ExternalLink, FileBadge } from 'lucide-react';

type Certificate = {
    id: number;
    certificate_number: string;
    issued_at?: string | null;
    course?: { title: string; slug: string } | null;
    verification_code?: string | null;
};

const nav = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'My courses', href: '/student/my-courses' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'Certificates', href: '/student/certificates' },
];

export default function Index({ certificates = [] }: { certificates: Certificate[] }) {
    return (
        <AppShell navItems={nav}>
            <Head title="Certificates" />
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Student</p>
                <h1 className="mt-1 text-3xl font-black text-slate-950">Certificates</h1>
                <p className="mt-1 text-slate-600">Certificates earned from completed courses.</p>
            </div>

            {certificates.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <FileBadge className="mx-auto size-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No certificates yet.</p>
                    <p className="mt-1 text-sm text-slate-500">Complete a course to earn a certificate.</p>
                    <Link href="/student/my-courses" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-blue-600">View my courses</Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {certificates.map((c) => (
                        <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Award className="size-5" /></div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-950">{c.course?.title ?? 'Certificate'}</h2>
                                        <p className="mt-1 text-sm font-mono text-slate-600">{c.certificate_number}</p>
                                        {c.issued_at && <p className="mt-1 text-sm text-slate-500">Issued {c.issued_at}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {c.course?.slug && <Link href={`/courses/${c.course.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View course</Link>}
                                {c.verification_code && <Link href={`/verify/${c.verification_code}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"><ExternalLink className="size-4" /> Verify</Link>}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

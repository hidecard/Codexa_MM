import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { BadgeCheck, XCircle } from 'lucide-react';

type Props = {
    valid: boolean;
    code: string;
    certificate?: { certificate_number: string; issued_at?: string | null; course?: string | null; student?: string | null } | null;
};

export default function VerifyCertificate({ valid, code, certificate }: Props) {
    return (
        <PublicLayout>
            <Head title="Verify Certificate" />
            <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    {valid && certificate ? (
                        <>
                            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><BadgeCheck className="size-8" /></div>
                            <h1 className="mt-5 text-3xl font-black text-slate-950">Certificate verified</h1>
                            <p className="mt-2 text-slate-600">This certificate is valid and issued by Codexa MM.</p>
                            <dl className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-6 text-left text-sm sm:grid-cols-2">
                                <div><dt className="font-semibold text-slate-500">Student</dt><dd className="mt-1 font-bold text-slate-900">{certificate.student ?? '—'}</dd></div>
                                <div><dt className="font-semibold text-slate-500">Course</dt><dd className="mt-1 font-bold text-slate-900">{certificate.course ?? '—'}</dd></div>
                                <div><dt className="font-semibold text-slate-500">Certificate number</dt><dd className="mt-1 font-mono font-bold text-slate-900">{certificate.certificate_number}</dd></div>
                                <div><dt className="font-semibold text-slate-500">Issued</dt><dd className="mt-1 font-bold text-slate-900">{certificate.issued_at ?? '—'}</dd></div>
                            </dl>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600"><XCircle className="size-8" /></div>
                            <h1 className="mt-5 text-3xl font-black text-slate-950">Certificate not found</h1>
                            <p className="mt-2 text-slate-600">We could not verify a certificate for this code.</p>
                            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 break-all">{code}</p>
                        </>
                    )}
                    <div className="mt-8"><Link href="/" className="inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-blue-600">Back to home</Link></div>
                </div>
            </section>
        </PublicLayout>
    );
}
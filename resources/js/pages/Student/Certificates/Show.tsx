import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { formatDate } from '@/lib/format';
import { Award, ChevronLeft, Download, ExternalLink, ShieldCheck } from 'lucide-react';

type Certificate = {
    id: number;
    certificate_number: string;
    issued_at?: string | null;
    course?: { title: string; slug: string } | null;
    verification_code?: string | null;
    student_name?: string | null;
};

type Props = { certificate?: Certificate | null };

export default function Show({ certificate = null }: Props) {
    const { auth } = usePage<{ auth?: { user?: { name?: string | null } } }>().props;
    const studentName = certificate?.student_name ?? auth?.user?.name ?? 'ကျောင်းသား';

    if (!certificate) {
        return (
            <LmsShell title="လက်မှတ်" nav="student">
                <Head title="Certificate" />
                <p className="text-slate-500 dark:text-slate-400">လက်မှတ် မတွေ့ပါ။</p>
                <Link href="/student/certificates" className="mt-4 inline-block text-sm font-bold text-teal-600">လက်မှတ်များ သို့ ပြန်သွားရန်</Link>
            </LmsShell>
        );
    }

    return (
        <LmsShell title="လက်မှတ်" nav="student">
            <Head title={`လက်မှတ် · ${certificate.course?.title ?? certificate.certificate_number}`} />
            <Link href="/student/certificates" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> လက်မှတ်များ အားလုံး</Link>

            <div className="mt-6 overflow-hidden rounded-3xl border-4 border-double border-amber-300 bg-white p-8 text-center shadow-sm dark:border-amber-700 dark:bg-slate-900 sm:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-600">Codexa MM</p>
                <Award className="mx-auto mt-4 size-14 text-amber-500" />
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">သင်တန်း ပြီးစီးကြောင်း လက်မှတ်</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Certificate of Completion</p>
                <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">ဤလက်မှတ်ကို အောက်ပါ ကျောင်းသားအား ချီးမြှင့်ပါသည်</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{studentName}</p>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">အောက်ပါ သင်တန်းကို အောင်မြင်စွာ ပြီးစီးခဲ့ပါသည်</p>
                <p className="mt-2 text-xl font-extrabold text-teal-700 dark:text-teal-400">{certificate.course?.title ?? '—'}</p>
                <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-slate-200 pt-6 text-sm dark:border-slate-700">
                    <div><p className="text-xs text-slate-400">လက်မှတ် နံပါတ်</p><p className="font-mono font-bold text-slate-900 dark:text-white">{certificate.certificate_number}</p></div>
                    {certificate.issued_at && <div><p className="text-xs text-slate-400">ထုတ်ပေးသည့် ရက်စွဲ</p><p className="font-bold text-slate-900 dark:text-white">{formatDate(certificate.issued_at)}</p></div>}
                    {certificate.verification_code && <div><p className="text-xs text-slate-400">အတည်ပြု ကုဒ်</p><p className="font-mono font-bold text-slate-900 dark:text-white">{certificate.verification_code}</p></div>}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                {certificate.verification_code && (
                    <Link href={`/verify/${certificate.verification_code}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">
                        <ShieldCheck className="size-4" /> အများပြည်သူ အတည်ပြုစာမျက်နှာ
                    </Link>
                )}
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <Download className="size-4" /> လက်မှတ် ပုံနှိပ်ရန် / သိမ်းရန်
                </button>
                {certificate.course?.slug && (
                    <Link href={`/courses/${certificate.course.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        <ExternalLink className="size-4" /> သင်တန်း ကြည့်ရန်
                    </Link>
                )}
            </div>
        </LmsShell>
    );
}

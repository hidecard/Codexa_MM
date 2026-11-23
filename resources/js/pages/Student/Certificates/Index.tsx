import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import { Award, ExternalLink, FileBadge } from 'lucide-react';

type Certificate = {
    id: number;
    certificate_number: string;
    issued_at?: string | null;
    course?: { title: string; slug: string } | null;
    verification_code?: string | null;
};

export default function Index({ certificates = [] }: { certificates?: Certificate[] }) {
    return (
        <LmsShell title="လက်မှတ်များ" nav="student">
            <Head title="Certificates" />
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">လက်မှတ်များ</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ပြီးစီးသော သင်တန်းများမှ ရရှိထားသော လက်မှတ်များ · {certificates.length} ခု</p>
            </div>

            {certificates.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<FileBadge className="size-10" />}
                    title="လက်မှတ် မရှိသေးပါ"
                    description="သင်တန်း တစ်ခု ပြီးစီးပါက လက်မှတ် ရရှိပါမည်။"
                    action={<Link href="/student/my-courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ကြည့်ရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {certificates.map((c) => (
                        <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"><Award className="size-6" /></div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-extrabold leading-snug text-slate-900 dark:text-white">{c.course?.title ?? 'လက်မှတ်'}</h2>
                                    <p className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-300">{c.certificate_number}</p>
                                    {c.issued_at && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ထုတ်ပေးခဲ့သည်: {formatDate(c.issued_at)}</p>}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link href={`/student/certificates/${c.id}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">လက်မှတ် ကြည့်ရန်</Link>
                                {c.course?.slug && <Link href={`/courses/${c.course.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">သင်တန်း</Link>}
                                {c.verification_code && <Link href={`/verify/${c.verification_code}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ExternalLink className="size-4" /> အတည်ပြုရန်</Link>}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

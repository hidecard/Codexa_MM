import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { ArrowLeft, BookOpen } from 'lucide-react';

type Course = { id: number; title: string; slug: string; short_description?: string | null; category?: { name: string } | null };
type Instructor = { name: string; profile?: { bio?: string | null } | null };

export default function Show({ instructor, courses }: { instructor: Instructor; courses: Course[] }) {
    return (
        <PublicLayout>
            <Head title={instructor.name} />
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <Link href="/instructors" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"><ArrowLeft className="size-4" /> Back to instructors</Link>
                <header className="mt-8 flex items-start gap-4">
                    <div className="flex size-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">{instructor.name.charAt(0)}</div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Instructor</p>
                        <h1 className="mt-1 text-3xl font-black text-slate-950">{instructor.name}</h1>
                        {instructor.profile?.bio && <p className="mt-3 max-w-2xl leading-7 text-slate-600">{instructor.profile.bio}</p>}
                    </div>
                </header>
                <section className="mt-12">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950"><BookOpen className="size-5 text-blue-600" /> Published courses</h2>
                    {courses.length === 0 ? <p className="mt-4 text-slate-600">No published courses yet.</p> : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {courses.map((c) => (
                                <Link key={c.id} href={`/courses/${c.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    {c.category && <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{c.category.name}</p>}
                                    <h3 className="mt-1 font-bold text-slate-950">{c.title}</h3>
                                    {c.short_description && <p className="mt-2 text-sm text-slate-600">{c.short_description}</p>}
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}

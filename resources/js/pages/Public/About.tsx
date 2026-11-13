import { Head } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Code2, Layers3 } from 'lucide-react';

export default function About() {
    const pillars = [
        { icon: GraduationCap, title: 'Codexa Academy', text: 'Practical programming education and guided projects that build real confidence.' },
        { icon: Code2, title: 'Codexa Solutions', text: 'Web, mobile, and software services that help organizations build with clarity.' },
        { icon: Layers3, title: 'Codexa Labs', text: 'Research and digital products that explore what comes next for Myanmar and beyond.' },
    ];
    return (
        <PublicLayout>
            <Head title="About" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="About Codexa MM" title="Learn. Build. Innovate." description="Codexa MM empowers Myanmar’s developers and businesses with world-class skills, practical education, and reliable software solutions." />
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {pillars.map((p) => (
                        <Card key={p.title}>
                            <CardContent className="p-6">
                                <p.icon className="size-8 text-blue-600" aria-hidden="true" />
                                <h2 className="mt-4 text-xl font-bold">{p.title}</h2>
                                <p className="mt-2 text-slate-600">{p.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <section className="mt-12 max-w-3xl">
                    <h2 className="text-2xl font-black">Our mission</h2>
                    <p className="mt-4 leading-7 text-slate-600">We bridge learning and real-world delivery: students gain skills that ship, and clients gain a technical partner focused on outcomes. Technology · Education · Innovation guide everything we build.</p>
                </section>
            </div>
        </PublicLayout>
    );
}

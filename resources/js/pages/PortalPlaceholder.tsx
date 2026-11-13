import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/shared/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';

type PortalProps = {
    title: string;
    subtitle: string;
    links?: { label: string; href: string }[];
};

export default function PortalPlaceholder({ title, subtitle, links = [] }: PortalProps) {
    return (
        <AppShell>
            <Head title={title} />
            <PageHeader eyebrow="Codexa MM" title={title} description={subtitle} />
            {links.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl">
                            <Card className="h-full transition hover:border-blue-300 hover:shadow-md">
                                <CardContent className="p-5 font-semibold text-slate-800">{link.label}</CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </AppShell>
    );
}


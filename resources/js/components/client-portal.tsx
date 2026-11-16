import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/shared/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export const clientNav = [
    { label: 'Dashboard', href: '/client/dashboard' },
    { label: 'Projects', href: '/client/projects' },
    { label: 'Milestones', href: '/client/milestones' },
    { label: 'Tasks', href: '/client/tasks' },
    { label: 'Documents', href: '/client/documents' },
    { label: 'Support', href: '/client/support' },
];

export function ClientPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <AppShell navItems={clientNav}>
            <PageHeader eyebrow="Codexa Solutions" title={title} description={description} />
            {children}
        </AppShell>
    );
}

export function ClientEmpty({ title, description }: { title: string; description: string }) {
    return <EmptyState title={title} description={description} />;
}

export function StatusBadge({ value }: { value: string }) {
    const variant = ['completed', 'approved', 'paid', 'resolved'].includes(value)
        ? 'success'
        : ['cancelled', 'overdue', 'closed'].includes(value)
          ? 'danger'
          : ['in_progress', 'review', 'testing', 'client_review'].includes(value)
            ? 'warning'
            : 'secondary';

    return <Badge variant={variant}>{value.split('_').join(' ')}</Badge>;
}

export function PortalCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <Card className={`transition hover:border-blue-200 hover:shadow-sm ${className}`}>{children}</Card>;
}

export function Meta({ children }: { children: ReactNode }) {
    return <p className="mt-1 text-sm text-slate-500">{children}</p>;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
    return <Link href={href} className="text-sm font-bold text-blue-700 hover:text-blue-900">{children}</Link>;
}

export { CardContent };

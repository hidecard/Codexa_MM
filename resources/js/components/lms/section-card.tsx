import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionCardProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function SectionCard({ title, action, children, className }: SectionCardProps) {
    return (
        <section className={cn('rounded-2xl border border-lms-line bg-lms-surface p-5 sm:p-6', className)}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-extrabold tracking-tight text-lms-ink sm:text-lg">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

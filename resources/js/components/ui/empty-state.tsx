import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center', className)}>
            {icon && <div className="mb-4 text-slate-400">{icon}</div>}
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    eyebrow?: string;
    className?: string;
};

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div>
                {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>}
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
    );
}

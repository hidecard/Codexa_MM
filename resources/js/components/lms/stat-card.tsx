import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatCardTone = 'teal' | 'blue' | 'purple' | 'amber' | 'rose' | 'green';

const tones: Record<StatCardTone, string> = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

type StatCardProps = {
    label: string;
    value: string | number;
    sub?: string;
    icon?: LucideIcon;
    tone?: StatCardTone;
};

export function StatCard({ label, value, sub, icon: Icon, tone = 'teal' }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-lms-line bg-lms-surface p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-lms-muted">{label}</p>
                    <p className="mt-1 truncate text-2xl font-extrabold tracking-tight text-lms-ink">{value}</p>
                    {sub ? <p className="mt-1 text-xs font-medium text-lms-faint">{sub}</p> : null}
                </div>
                {Icon ? (
                    <span className={cn('grid size-11 flex-none place-items-center rounded-xl', tones[tone])}>
                        <Icon className="size-5" />
                    </span>
                ) : null}
            </div>
        </div>
    );
}

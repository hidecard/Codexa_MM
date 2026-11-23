import { cn } from '@/lib/utils';

type ProgressBarTone = 'teal' | 'blue' | 'purple' | 'amber' | 'rose' | 'green';

const tones: Record<ProgressBarTone, string> = {
    teal: 'from-lms-teal-bright to-lms-teal',
    blue: 'from-sky-400 to-blue-600',
    purple: 'from-violet-400 to-purple-600',
    amber: 'from-amber-300 to-amber-500',
    rose: 'from-rose-400 to-rose-600',
    green: 'from-green-400 to-green-600',
};

type ProgressBarProps = {
    value: number;
    tone?: ProgressBarTone;
};

export function ProgressBar({ value, tone = 'teal' }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    return (
        <div className="h-2 overflow-hidden rounded-full bg-lms-surface-3" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-500', tones[tone])} style={{ width: `${clamped}%` }} />
        </div>
    );
}

import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared UI helpers for the LMS admin + instructor pages (worker C area).
 * These are small presentational helpers only — the contract's shared
 * components (LmsShell, StatCard, SectionCard, ProgressBar, format.ts)
 * live under @/components/lms and @/lib and are imported directly.
 */

export const cardCls =
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#1e2c52] dark:bg-[#0d1730]';
export const inkCls = 'text-slate-900 dark:text-[#e9eefb]';
export const mutedCls = 'text-slate-500 dark:text-[#97a6c6]';
export const faintCls = 'text-slate-400 dark:text-[#67779c]';
export const lineCls = 'border-slate-200 dark:border-[#1e2c52]';
export const btnAccentCls =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300';
export const btnGhostCls =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#1e2c52] dark:bg-[#0d1730] dark:text-[#e9eefb] dark:hover:bg-[#12234a]';
export const btnDangerCls =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-[#0d1730] dark:hover:bg-rose-950/40';
export const inputCls =
    'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]';
export const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#97a6c6]';
export const selectCls = inputCls;

export function LmsCard({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn(cardCls, className)}>{children}</div>;
}

export function PageIntro({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className={cn('text-[1.65rem] font-extrabold leading-tight tracking-tight sm:text-[2rem]', inkCls)}>
                        {title}
                    </h1>
                    {eyebrow && (
                        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[.7rem] font-extrabold tracking-wide text-violet-700 dark:text-violet-300">
                            {eyebrow}
                        </span>
                    )}
                </div>
                {description && <p className={cn('mt-1 text-[.95rem]', mutedCls)}>{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
        </div>
    );
}

export function Avatar({ init, color, size = 'md' }: { init: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
    const sz = size === 'sm' ? 'size-8 text-[.68rem]' : size === 'lg' ? 'size-12 text-[.85rem]' : 'size-10 text-[.72rem]';
    return (
        <span
            className={cn('grid flex-none place-items-center rounded-full font-extrabold text-white', sz)}
            style={{ background: color }}
        >
            {init}
        </span>
    );
}

export function Stars({ value, className }: { value: number; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-0.5', className)}>
            {[0, 1, 2, 3, 4].map((i) => (
                <Star
                    key={i}
                    className={cn('size-3.5', i < value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700')}
                />
            ))}
        </span>
    );
}

export function Chip({
    active,
    onClick,
    children,
}: {
    active?: boolean;
    onClick?: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-full border px-3.5 py-1.5 text-[.82rem] font-bold transition',
                active
                    ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#1e2c52] dark:bg-[#0d1730] dark:text-[#97a6c6] dark:hover:bg-[#12234a]',
            )}
        >
            {children}
        </button>
    );
}

export function EmptyBox({ title, description }: { title: string; description?: string }) {
    return (
        <div className={cn(cardCls, 'p-10 text-center')}>
            <p className={cn('text-[1.05rem] font-extrabold', inkCls)}>{title}</p>
            {description && <p className={cn('mt-1 text-sm', mutedCls)}>{description}</p>}
        </div>
    );
}

/** Simple vertical bar chart (prototype style). values in "သိန်း" (lakh) or any unit. */
export function BarChart({
    data,
    max,
    unit = 'သိန်း',
}: {
    data: { label: string; value: number }[];
    max: number;
    unit?: string;
}) {
    return (
        <div>
            <div className="mt-6 flex h-[170px] items-end gap-2 sm:gap-3">
                {data.map((d, i) => (
                    <div key={d.label} className="flex h-full flex-1 flex-col justify-end" title={`${d.value} ${unit}`}>
                        <div
                            className={cn(
                                'w-full rounded-t-lg',
                                i < data.length - 1 ? 'bg-teal-600/35 dark:bg-teal-400/30' : 'bg-teal-600 dark:bg-teal-400',
                            )}
                            style={{ height: `${Math.max(4, Math.round((d.value / max) * 100))}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-2.5 flex gap-2 sm:gap-3">
                {data.map((d) => (
                    <p key={d.label} className={cn('flex-1 text-center text-[.72rem] font-bold', mutedCls)}>
                        {d.label}
                        <br />
                        <span className={inkCls}>
                            {d.value} {unit}
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );
}

export function Pill({
    tone,
    children,
}: {
    tone: 'teal' | 'amber' | 'rose' | 'violet' | 'blue' | 'slate' | 'green';
    children: ReactNode;
}) {
    const tones: Record<string, string> = {
        teal: 'bg-teal-600/10 text-teal-700 dark:text-teal-300',
        amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
        blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };
    return (
        <span className={cn('inline-flex flex-none items-center rounded-full px-2.5 py-1 text-[.7rem] font-extrabold', tones[tone])}>
            {children}
        </span>
    );
}

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    return (
        <div className="w-full">
            {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
            <input
                id={inputId}
                type={type}
                ref={ref}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                className={cn(
                    'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-rose-500 focus-visible:ring-rose-500',
                    className,
                )}
                {...props}
            />
            {error && <p id={`${inputId}-error`} className="mt-1.5 text-sm text-rose-600">{error}</p>}
            {!error && hint && <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-slate-500">{hint}</p>}
        </div>
    );
});
Input.displayName = 'Input';

export { Input };

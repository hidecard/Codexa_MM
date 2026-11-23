import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<Theme>(currentTheme);

    useEffect(() => {
        setTheme(currentTheme());
    }, []);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            try {
                localStorage.setItem('codexa-theme', next);
            } catch {
                /* storage unavailable — theme still applies for this session */
            }
            return next;
        });
    }, []);

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'အလင်းပုံစံသို့ ပြောင်းရန်' : 'အမှောင်ပုံစံသို့ ပြောင်းရန်'}
            title={theme === 'dark' ? 'အလင်းပုံစံ' : 'အမှောင်ပုံစံ'}
            className={cn(
                'grid size-10 place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:border-lms-accent hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                className,
            )}
        >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
    );
}

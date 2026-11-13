import { Link, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string };

type AppShellProps = {
    title?: string;
    navItems?: NavItem[];
    children: ReactNode;
};

type SharedProps = { auth?: { user?: { name: string; roles?: string[] } | null } };

export function AppShell({ navItems = [], children }: AppShellProps) {
    const { props, url } = usePage<SharedProps>();
    const user = props.auth?.user;
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:ring-2 focus:ring-blue-500">Skip to content</a>
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <BrandLogo />
                        {navItems.length > 0 && (
                            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                                {navItems.map((item) => {
                                    const active = url === item.href || url.startsWith(`${item.href}/`);
                                    return (
                                        <Link key={item.href} href={item.href} className={cn('rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {user && <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.name}</span>}
                        {navItems.length > 0 && (
                            <button type="button" className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle navigation" onClick={() => setOpen((v) => !v)}>
                                {open ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                        )}
                    </div>
                </div>
                {open && navItems.length > 0 && (
                    <nav id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const active = url === item.href || url.startsWith(`${item.href}/`);
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn('rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100')}>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </header>
            <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}

import { Link, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Academy', href: '/courses' },
    { label: 'Solutions', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm font-semibold focus:text-blue-700 focus:ring-2 focus:ring-blue-500">Skip to content</a>
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <BrandLogo />
                    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                        {navItems.map((item) => {
                            const active = url === item.href || url.startsWith(`${item.href}/`);
                            return <Link key={item.href} href={item.href} className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>{item.label}</Link>;
                        })}
                    </nav>
                    <div className="hidden items-center gap-3 md:flex">
                        <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Sign in</Link>
                        <Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Get started</Link>
                    </div>
                    <button type="button" className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden" aria-expanded={open} aria-controls="public-mobile-nav" aria-label="Toggle navigation" onClick={() => setOpen((v) => !v)}>
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
                {open && (
                    <nav id="public-mobile-nav" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{item.label}</Link>)}
                            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                                <Link href="/login" className="flex-1 rounded-xl px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-100">Sign in</Link>
                                <Link href="/register" className="flex-1 rounded-xl bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white">Get started</Link>
                            </div>
                        </div>
                    </nav>
                )}
            </header>
            <main id="main-content">{children}</main>
            <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="font-black text-white">CODEXA<span className="text-blue-400"> MM</span></p>
                        <p className="mt-1 text-sm text-slate-400">Learn. Build. Innovate.</p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <Link href="/about" className="hover:text-white">About</Link>
                        <Link href="/courses" className="hover:text-white">Academy</Link>
                        <Link href="/services" className="hover:text-white">Solutions</Link>
                        <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
                        <Link href="/terms" className="hover:text-white">Terms</Link>
                    </div>
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} Codexa MM.</p>
                </div>
            </footer>
        </div>
    );
}

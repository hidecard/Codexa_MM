import { Link, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Facebook, Linkedin, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SeoHead } from '@/components/shared/seo-head';
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
        <>
            <SeoHead />
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
            <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                        <div className="sm:col-span-2 lg:col-span-4">
                            <BrandLogo href="/" variant="dark" className="w-44" />
                            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                                Codexa MM delivers practical technology education and software solutions to help learners and businesses grow with confidence.
                            </p>
                            <ul className="mt-6 space-y-3 text-sm text-slate-400">
                                <li className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-blue-400" aria-hidden="true" />
                                    <span>Yangon, Myanmar</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="size-4 shrink-0 text-blue-400" aria-hidden="true" />
                                    <a href="mailto:hello@codexa.mm" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">hello@codexa.mm</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="size-4 shrink-0 text-blue-400" aria-hidden="true" />
                                    <a href="tel:+959000000000" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">+95 9 000 000 000</a>
                                </li>
                            </ul>
                            <div className="mt-6 flex items-center gap-3">
                                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <Facebook className="size-4" />
                                </a>
                                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <Linkedin className="size-4" />
                                </a>
                                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <Youtube className="size-4" />
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Academy</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><Link href="/courses" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">All Courses</Link></li>
                                <li><Link href="/courses/categories" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Categories</Link></li>
                                <li><Link href="/instructors" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Instructors</Link></li>
                                <li><Link href="/blog" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Blog</Link></li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Solutions</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><Link href="/services" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Our Services</Link></li>
                                <li><Link href="/portfolio" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Portfolio</Link></li>
                                <li><Link href="/contact" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Start a Project</Link></li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><Link href="/about" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">About Us</Link></li>
                                <li><Link href="/contact" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Contact</Link></li>
                                <li><Link href="/faq" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">FAQ</Link></li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><Link href="/privacy-policy" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Terms &amp; Conditions</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Codexa MM. All rights reserved.</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <Link href="/privacy-policy" className="text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Privacy</Link>
                            <Link href="/terms" className="text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Terms</Link>
                            <Link href="/faq" className="text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">FAQ</Link>
                            <Link href="/contact" className="text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </>
    );
}

import { Link, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Facebook, Linkedin, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SeoHead } from '@/components/shared/seo-head';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';

type SharedProps = {
    url?: string;
    auth?: { user?: { id: number; name: string } | null };
};

const navItems = [
    { label: 'သင်တန်းများ', href: '/courses' },
    { label: 'ဆရာများ', href: '/instructors' },
    { label: 'ဆောင်းပါးများ', href: '/blog' },
    { label: 'ကျွန်ုပ်တို့ အကြောင်း', href: '/about' },
    { label: 'ဆက်သွယ်ရန်', href: '/contact' },
];

const footerColumns = [
    {
        heading: 'သင်တန်း နယ်ပယ်များ',
        links: [
            { label: 'Web Development', href: '/courses?category=web-development' },
            { label: 'Programming', href: '/courses?category=programming' },
            { label: 'Backend', href: '/courses?category=backend' },
            { label: 'Mobile', href: '/courses?category=mobile' },
            { label: 'Design', href: '/courses?category=design' },
        ],
    },
    {
        heading: 'Platform',
        links: [
            { label: 'သင်ယူမှု လမ်းကြောင်းများ', href: '/student/paths' },
            { label: 'Live Classes', href: '/student/live-classes' },
            { label: 'ဆရာ/ဆရာမများ', href: '/instructors' },
            { label: 'Community', href: '/student/community' },
            { label: 'ဆောင်းပါးများ', href: '/blog' },
            { label: 'အလုပ်အခွင့်အလမ်းများ', href: '/jobs' },
        ],
    },
    {
        heading: 'အကူအညီ',
        links: [
            { label: 'အကူအညီ & FAQ', href: '/faq' },
            { label: 'လက်မှတ် အတည်ပြုရန်', href: '/student/certificates' },
            { label: 'ကျွန်ုပ်တို့ အကြောင်း', href: '/about' },
            { label: 'ဆက်သွယ်ရန်', href: '/contact' },
            { label: 'စည်းမျဉ်း & လုံခြုံမှု', href: '/terms' },
        ],
    },
    {
        heading: 'ဝန်ဆောင်မှုများ',
        links: [
            { label: 'Our Services', href: '/services' },
            { label: 'Portfolio', href: '/portfolio' },
            { label: 'Start a Project', href: '/contact' },
        ],
    },
];

export function PublicLayout({ children }: { children: ReactNode }) {
    const { url = '', auth } = usePage<SharedProps>().props;
    const [open, setOpen] = useState(false);
    const user = auth?.user ?? null;

    return (
        <>
            <SeoHead />
            <div className="min-h-screen bg-[#edf0f7] text-[#0d1730] dark:bg-[#070d1f] dark:text-[#e9eefb]">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-teal-700 focus:ring-2 focus:ring-teal-500"
                >
                    Skip to content
                </a>
                <header className="sticky top-0 z-40 border-b border-[#dce3f0] bg-white/90 backdrop-blur dark:border-[#1e2c52] dark:bg-[#0d1730]/90">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                        <BrandLogo />
                        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
                            {navItems.map((item) => {
                                const active = url === item.href || url.startsWith(`${item.href}/`) || url.startsWith(`${item.href}?`);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                            active
                                                ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                                                : 'text-[#5a6a8a] hover:bg-[#eef3fb] hover:text-[#0d1730] dark:text-[#97a6c6] dark:hover:bg-[#12234a] dark:hover:text-white',
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <ThemeToggle />
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="hidden rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:inline-flex"
                                >
                                    Dashboard သို့
                                </Link>
                            ) : (
                                <div className="hidden items-center gap-2 sm:flex">
                                    <Link
                                        href="/login"
                                        className="rounded-xl px-4 py-2 text-sm font-bold text-[#5a6a8a] hover:bg-[#eef3fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-[#97a6c6] dark:hover:bg-[#12234a]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                    >
                                        Signup
                                    </Link>
                                </div>
                            )}
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg p-2 text-[#5a6a8a] hover:bg-[#eef3fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-[#97a6c6] dark:hover:bg-[#12234a] lg:hidden"
                                aria-expanded={open}
                                aria-controls="public-mobile-nav"
                                aria-label="Toggle navigation"
                                onClick={() => setOpen((v) => !v)}
                            >
                                {open ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                        </div>
                    </div>
                    {open && (
                        <nav id="public-mobile-nav" className="border-t border-[#dce3f0] bg-white px-4 py-3 dark:border-[#1e2c52] dark:bg-[#0d1730] lg:hidden" aria-label="Mobile">
                            <div className="flex flex-col gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="rounded-lg px-3 py-2 text-sm font-semibold text-[#0d1730] hover:bg-[#eef3fb] dark:text-[#e9eefb] dark:hover:bg-[#12234a]"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/jobs"
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[#0d1730] hover:bg-[#eef3fb] dark:text-[#e9eefb] dark:hover:bg-[#12234a]"
                                >
                                    အလုပ်အခွင့်အလမ်းများ
                                </Link>
                                <div className="mt-2 flex gap-2 border-t border-[#e7ecf5] pt-3 dark:border-[#18264a]">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-center text-sm font-bold text-white"
                                        >
                                            Dashboard သို့
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="flex-1 rounded-xl px-4 py-2 text-center text-sm font-bold text-[#0d1730] hover:bg-[#eef3fb] dark:text-white dark:hover:bg-[#12234a]"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-center text-sm font-bold text-white"
                                            >
                                                Signup
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </nav>
                    )}
                </header>
                <main id="main-content">{children}</main>
                <footer className="mt-16 bg-[#0a1128] text-slate-300">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                            <div className="sm:col-span-2 lg:col-span-4">
                                <BrandLogo href="/" variant="dark" className="w-44" />
                                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                                    မြန်မာ ကျောင်းသားများအတွက် မြန်မာဘာသာဖြင့် Programming နဲ့ Design ကို လက်တွေ့ကျကျ သင်ကြားပေးသော online သင်တန်း platform ဖြစ်ပါတယ်။
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-slate-400">
                                    <li className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-teal-400" aria-hidden="true" />
                                        <span>အမှတ် ၁၂၃၊ ပြည်လမ်း၊ ကမာရွတ် မြို့နယ်၊ ရန်ကုန်</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Mail className="size-4 shrink-0 text-teal-400" aria-hidden="true" />
                                        <a
                                            href="mailto:support@codexamm.com"
                                            className="rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                        >
                                            support@codexamm.com
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone className="size-4 shrink-0 text-teal-400" aria-hidden="true" />
                                        <a
                                            href="tel:+959771234567"
                                            className="rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                        >
                                            09 771 234 567
                                        </a>
                                    </li>
                                </ul>
                                <div className="mt-6 flex items-center gap-3">
                                    <a
                                        href="https://www.facebook.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="Facebook"
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                    >
                                        <Facebook className="size-4" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="LinkedIn"
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                    >
                                        <Linkedin className="size-4" />
                                    </a>
                                    <a
                                        href="https://www.youtube.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="YouTube"
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                    >
                                        <Youtube className="size-4" />
                                    </a>
                                </div>
                            </div>

                            {footerColumns.map((col) => (
                                <div key={col.heading} className="lg:col-span-2">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white">{col.heading}</h2>
                                    <ul className="mt-4 space-y-3 text-sm">
                                        {col.links.map((link) => (
                                            <li key={link.href + link.label}>
                                                <Link
                                                    href={link.href}
                                                    className="rounded text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Codexa MM · Learn · Code · Grow</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                <Link href="/privacy-policy" className="rounded text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                    Privacy
                                </Link>
                                <Link href="/terms" className="rounded text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                    Terms
                                </Link>
                                <Link href="/faq" className="rounded text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                    FAQ
                                </Link>
                                <Link href="/contact" className="rounded text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

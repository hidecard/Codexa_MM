import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Bell, ChevronDown, Ellipsis, LogOut, Menu, Search, Settings, User, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
    adminBottomNav,
    adminNav,
    instructorBottomNav,
    instructorNav,
    studentBottomNav,
    studentNav,
    type LmsNavItem,
    type LmsNavSection,
} from '@/lib/lms-nav';
import { cn } from '@/lib/utils';

export type LmsRole = 'student' | 'instructor' | 'admin';

type LmsShellProps = {
    title?: string;
    nav: LmsRole;
    actions?: ReactNode;
    hideBottomNav?: boolean;
    children: ReactNode;
};

type SharedProps = { auth?: { user?: { name: string; roles?: string[] } | null } };

type RoleConfig = {
    sections: LmsNavSection[];
    bottomNav: LmsNavItem[];
    notificationsHref: string;
    profileHref: string;
    settingsHref: string;
    searchHref: string;
    homeHref: string;
    roleLabel: string;
};

const roleConfig: Record<LmsRole, RoleConfig> = {
    student: {
        sections: studentNav,
        bottomNav: studentBottomNav,
        notificationsHref: '/student/notifications',
        profileHref: '/student/profile',
        settingsHref: '/student/profile',
        searchHref: '/student/search',
        homeHref: '/student/dashboard',
        roleLabel: 'Student',
    },
    instructor: {
        sections: instructorNav,
        bottomNav: instructorBottomNav,
        notificationsHref: '/instructor/announcements',
        profileHref: '/instructor/profile',
        settingsHref: '/instructor/profile',
        searchHref: '/instructor/courses',
        homeHref: '/instructor/dashboard',
        roleLabel: 'Instructor',
    },
    admin: {
        sections: adminNav,
        bottomNav: adminBottomNav,
        notificationsHref: '/admin/academy/announcements',
        profileHref: '/admin/settings',
        settingsHref: '/admin/settings',
        searchHref: '/admin/academy/courses',
        homeHref: '/admin/dashboard',
        roleLabel: 'Admin',
    },
};

function isActive(url: string, href: string): boolean {
    const path = url.split('?')[0];
    if (href === '/') return path === '/';
    return path === href || path.startsWith(`${href}/`);
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function NavSections({ sections, currentUrl, onNavigate }: { sections: LmsNavSection[]; currentUrl: string; onNavigate?: () => void }) {
    return (
        <div className="space-y-5">
            {sections.map((section) => (
                <div key={section.label}>
                    <p className="px-3 pb-1.5 pt-2 text-[0.68rem] font-extrabold tracking-[0.14em] text-lms-faint">{section.label}</p>
                    <div className="space-y-1">
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(currentUrl, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[0.925rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                        active
                                            ? 'border-teal-500/25 bg-lms-glow text-lms-accent'
                                            : 'border-transparent text-lms-muted hover:bg-lms-surface-2 hover:text-lms-ink',
                                    )}
                                >
                                    <Icon className="size-5 flex-none" />
                                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                    {item.badge ? (
                                        <span className="ml-auto flex-none rounded-full bg-lms-chip px-2 py-0.5 text-[0.68rem] font-extrabold tracking-wide text-lms-accent">{item.badge}</span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function BrandMark({ homeHref }: { homeHref: string }) {
    return (
        <Link href={homeHref} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500" aria-label="Codexa MM home">
            <span className="grid size-11 flex-none place-items-center rounded-2xl bg-white p-1.5 shadow-[0_8px_20px_rgba(14,168,146,0.3)]">
                <BrandLogo variant="mark" href="" className="w-8" />
            </span>
            <span className="min-w-0">
                <span className="block text-[1.05rem] font-extrabold leading-tight tracking-tight text-lms-ink">
                    Codexa <span className="text-teal-500">MM</span>
                </span>
                <span className="block text-[0.72rem] font-semibold tracking-wide text-lms-faint">LEARN · CODE · GROW</span>
            </span>
        </Link>
    );
}

export function LmsShell({ title, nav, actions, hideBottomNav = false, children }: LmsShellProps) {
    const { props, url } = usePage<SharedProps>();
    const user = props.auth?.user ?? null;
    const config = roleConfig[nav];

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);

    useEffect(() => {
        if (!notifOpen && !avatarOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setNotifOpen(false);
                setAvatarOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [notifOpen, avatarOpen]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen || moreOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen, moreOpen]);

    const logOut = () => router.post('/logout');
    const allNavItems = config.sections.flatMap((section) => section.items);

    return (
        <div className="min-h-screen bg-lms-bg font-sans text-lms-ink">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-lms-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-teal-700 focus:ring-2 focus:ring-teal-500"
            >
                Skip to content
            </a>

            {/* ===== Desktop sidebar ===== */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-lms-line bg-lms-surface lg:flex">
                <div className="px-5 pb-5 pt-6">
                    <BrandMark homeHref={config.homeHref} />
                </div>
                <nav className="lms-scrollbar flex-1 overflow-y-auto px-3 pb-4" aria-label="Primary">
                    <NavSections sections={config.sections} currentUrl={url} />
                </nav>
                {user ? (
                    <div className="border-t border-lms-line-soft p-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href={config.profileHref}
                                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <span className="grid size-10 flex-none place-items-center rounded-full bg-gradient-to-br from-lms-teal to-lms-blue text-sm font-extrabold text-white">
                                    {initials(user.name)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[0.9rem] font-bold text-lms-ink">{user.name}</span>
                                    <span className="block truncate text-xs text-lms-faint">{config.roleLabel}</span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={logOut}
                                aria-label="Log out"
                                className="grid size-9 flex-none place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:border-lms-accent hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <LogOut className="size-4" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </aside>

            <div className="lg:pl-[268px]">
                {/* ===== Topbar ===== */}
                <header className="sticky top-0 z-30 border-b border-lms-line bg-lms-bg/85 backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open navigation"
                            className="grid size-10 flex-none place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
                        >
                            <Menu className="size-5" />
                        </button>
                        <span className="grid size-10 flex-none place-items-center rounded-xl bg-white p-1 shadow-sm lg:hidden">
                            <BrandLogo variant="mark" href="" className="w-7" />
                        </span>
                        {title ? <h1 className="min-w-0 flex-1 truncate text-base font-extrabold tracking-tight text-lms-ink sm:text-lg">{title}</h1> : <span className="flex-1" />}
                        {actions ? <div className="hidden shrink-0 items-center gap-2 sm:flex">{actions}</div> : null}
                        <Link
                            href={config.searchHref}
                            aria-label="ရှာဖွေရန်"
                            className="grid size-10 flex-none place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:border-lms-accent hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                        >
                            <Search className="size-5" />
                        </Link>
                        <ThemeToggle className="flex-none" />

                        {/* Notifications dropdown */}
                        <div className="relative flex-none">
                            <button
                                type="button"
                                onClick={() => {
                                    setNotifOpen((v) => !v);
                                    setAvatarOpen(false);
                                }}
                                aria-label="အသိပေးချက်များ"
                                aria-expanded={notifOpen}
                                className="grid size-10 place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:border-lms-accent hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <Bell className="size-5" />
                            </button>
                            {notifOpen ? (
                                <>
                                    <button type="button" aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setNotifOpen(false)} />
                                    <div className="lms-animate-fade-in absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-lms-line bg-lms-surface p-2 shadow-xl">
                                        <p className="px-3 pb-2 pt-2 text-sm font-extrabold text-lms-ink">အသိပေးချက်များ</p>
                                        <p className="rounded-xl bg-lms-surface-2 px-3 py-4 text-center text-sm font-medium text-lms-muted">အသိပေးချက် အသစ် မရှိပါ</p>
                                        <Link
                                            href={config.notificationsHref}
                                            onClick={() => setNotifOpen(false)}
                                            className="mt-2 block rounded-xl px-3 py-2.5 text-center text-sm font-bold text-lms-accent transition hover:bg-lms-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                        >
                                            အားလုံးကြည့်ရန်
                                        </Link>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Avatar dropdown */}
                        {user ? (
                            <div className="relative flex-none">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvatarOpen((v) => !v);
                                        setNotifOpen(false);
                                    }}
                                    aria-label="Account menu"
                                    aria-expanded={avatarOpen}
                                    className="flex items-center gap-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                >
                                    <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-lms-teal to-lms-blue text-sm font-extrabold text-white">
                                        {initials(user.name)}
                                    </span>
                                    <ChevronDown className={cn('hidden size-4 text-lms-muted transition-transform sm:block', avatarOpen && 'rotate-180')} />
                                </button>
                                {avatarOpen ? (
                                    <>
                                        <button type="button" aria-label="Close account menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setAvatarOpen(false)} />
                                        <div className="lms-animate-fade-in absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-lms-line bg-lms-surface p-2 shadow-xl">
                                            <div className="border-b border-lms-line-soft px-3 pb-3 pt-2">
                                                <p className="truncate text-sm font-extrabold text-lms-ink">{user.name}</p>
                                                <p className="truncate text-xs text-lms-faint">{config.roleLabel}</p>
                                            </div>
                                            <Link
                                                href={config.profileHref}
                                                onClick={() => setAvatarOpen(false)}
                                                className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-lms-ink transition hover:bg-lms-surface-2 hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                            >
                                                <User className="size-4" />
                                                Profile
                                            </Link>
                                            <Link
                                                href={config.settingsHref}
                                                onClick={() => setAvatarOpen(false)}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-lms-ink transition hover:bg-lms-surface-2 hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                            >
                                                <Settings className="size-4" />
                                                Settings
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={logOut}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-red-500/10"
                                            >
                                                <LogOut className="size-4" />
                                                Log out
                                            </button>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    {actions ? <div className="flex items-center gap-2 px-4 pb-3 sm:hidden">{actions}</div> : null}
                </header>

                {/* ===== Main content ===== */}
                <main id="main-content" className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', hideBottomNav ? 'pb-10' : 'pb-28 lg:pb-10')}>
                    {children}
                </main>
            </div>

            {/* ===== Mobile drawer ===== */}
            {drawerOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
                    <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/45" onClick={() => setDrawerOpen(false)} />
                    <div className="lms-animate-slide-in-left absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-lms-line bg-lms-surface">
                        <div className="flex items-center justify-between gap-2 px-5 pb-5 pt-6">
                            <BrandMark homeHref={config.homeHref} />
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                aria-label="Close navigation"
                                className="grid size-9 flex-none place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <nav className="lms-scrollbar flex-1 overflow-y-auto px-3 pb-4" aria-label="Mobile">
                            <NavSections sections={config.sections} currentUrl={url} onNavigate={() => setDrawerOpen(false)} />
                        </nav>
                        {user ? (
                            <div className="border-t border-lms-line-soft p-4">
                                <button
                                    type="button"
                                    onClick={logOut}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-red-500/10"
                                >
                                    <LogOut className="size-4" />
                                    Log out
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {/* ===== Mobile bottom nav ===== */}
            {!hideBottomNav ? (
                <nav
                    className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-lms-line bg-lms-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
                    aria-label="Bottom"
                >
                    {config.bottomNav.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(url, item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[0.66rem] font-bold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
                                    active ? 'text-lms-accent' : 'text-lms-muted hover:text-lms-ink',
                                )}
                            >
                                <Icon className="size-[21px]" />
                                <span className="w-full truncate text-center">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        aria-label="More pages"
                        className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[0.66rem] font-bold leading-tight text-lms-muted transition hover:text-lms-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
                    >
                        <Ellipsis className="size-[21px]" />
                        <span className="w-full truncate text-center">နောက်ထပ်</span>
                    </button>
                </nav>
            ) : null}

            {/* ===== More sheet (all pages) ===== */}
            {moreOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="All pages">
                    <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/45" onClick={() => setMoreOpen(false)} />
                    <div className="lms-animate-slide-up absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-[22px] border-t border-lms-line bg-lms-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-12px_34px_rgba(5,12,30,0.25)]">
                        <div className="mb-3.5 flex items-center justify-between gap-3 px-1">
                            <p className="text-base font-extrabold text-lms-ink">စာမျက်နှာ အားလုံး</p>
                            <button
                                type="button"
                                onClick={() => setMoreOpen(false)}
                                aria-label="Close menu"
                                className="grid size-9 place-items-center rounded-xl border border-lms-line bg-lms-surface text-lms-muted transition hover:text-lms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {allNavItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(url, item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMoreOpen(false)}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-lms-line-soft bg-lms-surface-2 px-2 py-3.5 text-center text-xs font-bold leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                            active ? 'border-lms-accent text-lms-accent' : 'text-lms-ink hover:border-lms-accent hover:text-lms-accent',
                                        )}
                                    >
                                        <Icon className="size-5" />
                                        <span className="w-full break-words">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

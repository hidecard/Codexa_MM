import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Code2, GraduationCap, Layers3, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { label: 'Academy', href: '/courses' },
    { label: 'Solutions', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'About', href: '/about' },
];

const pillars = [
    {
        icon: GraduationCap,
        eyebrow: 'Codexa Academy',
        title: 'Learn skills that ship.',
        copy: 'Practical programming courses, guided projects, and a clear path from first line of code to production-ready work.',
        href: '/courses',
    },
    {
        icon: Code2,
        eyebrow: 'Codexa Solutions',
        title: 'Build with confidence.',
        copy: 'A technical partner for web platforms, mobile products, and digital systems that move your business forward.',
        href: '/services',
    },
    {
        icon: Layers3,
        eyebrow: 'Codexa Labs',
        title: 'Grow what comes next.',
        copy: 'We turn research, ideas, and community energy into useful digital products for Myanmar and beyond.',
        href: '/portfolio',
    },
];

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <Head title="Learn. Build. Innovate." />
            <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
                <header className="relative z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href="/" className="flex items-center gap-3" aria-label="Codexa MM home">
                            <span className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <Code2 size={21} strokeWidth={2.5} />
                            </span>
                            <span className="text-lg font-black tracking-tight">CODEXA<span className="text-blue-600"> MM</span></span>
                        </Link>
                        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
                            {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">{item.label}</Link>)}
                        </nav>
                        <div className="hidden items-center gap-3 md:flex">
                            <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Sign in</Link>
                            <Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600">Get started</Link>
                        </div>
                        <button className="rounded-xl p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
                            {menuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                    {menuOpen && <nav className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block py-3 font-semibold text-slate-700">{item.label}</Link>)}</nav>}
                </header>

                <main>
                    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
                        <div className="absolute -right-40 -top-40 -z-0 size-[32rem] rounded-full bg-blue-200/40 blur-3xl" />
                        <div className="relative z-10 max-w-4xl">
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles size={16} /> Myanmar's platform for technology</div>
                            <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-8xl">Learn programming.<br /><span className="text-blue-600">Build real solutions.</span></h1>
                            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">Codexa MM brings education, software development, and ambitious people together in one focused platform.</p>
                            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                                <Link href="/courses" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Explore the Academy <ArrowRight size={18} /></Link>
                                <Link href="/services" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-600">Our solutions</Link>
                            </div>
                        </div>
                        <div className="relative z-10 mt-16 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl bg-slate-950 p-6 text-white sm:col-span-2"><p className="text-sm font-bold text-blue-300">01 — Learn by doing</p><p className="mt-12 max-w-md text-2xl font-bold leading-tight">A calmer, clearer path to becoming the developer you want to be.</p></div>
                            <div className="rounded-3xl bg-blue-600 p-6 text-white"><p className="text-sm font-bold text-blue-100">02 — Build together</p><p className="mt-12 text-2xl font-bold leading-tight">From idea to impact, with people who care about the details.</p></div>
                        </div>
                    </section>

                    <section className="border-y border-slate-200 bg-white py-20 lg:py-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">One platform. Three directions.</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Make your next move count.</h2></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{pillars.map((pillar) => { const Icon = pillar.icon; return <Link key={pillar.eyebrow} href={pillar.href} className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-xl hover:shadow-slate-200/60"><Icon className="text-blue-600" size={28} /><p className="mt-10 text-sm font-black uppercase tracking-wider text-slate-500">{pillar.eyebrow}</p><h3 className="mt-3 text-2xl font-black">{pillar.title}</h3><p className="mt-4 leading-7 text-slate-600">{pillar.copy}</p><span className="mt-8 inline-flex items-center gap-2 font-bold text-blue-600">Discover more <ArrowRight className="transition group-hover:translate-x-1" size={17} /></span></Link>; })}</div></div>
                    </section>
                </main>

                <footer className="bg-slate-950 text-slate-300"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><p className="font-black text-white">CODEXA<span className="text-blue-400"> MM</span></p><p className="mt-2 text-sm text-slate-500">Learn. Build. Innovate.</p></div><p className="text-sm text-slate-500">© {new Date().getFullYear()} Codexa MM. Built for the next generation.</p></div></footer>
            </div>
        </>
    );
}

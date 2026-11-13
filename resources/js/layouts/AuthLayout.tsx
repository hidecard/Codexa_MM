import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BrandLogo } from '../components/BrandLogo';

type AuthLayoutProps = { children: ReactNode; title: string; description: string };

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
                <div className="absolute -left-40 top-24 size-[30rem] rounded-full bg-blue-600/20 blur-3xl" />
                <BrandLogo variant="dark" className="relative z-10" />
                <div className="relative z-10 max-w-md"><p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">Learn. Build. Innovate.</p><h2 className="mt-5 text-5xl font-black leading-tight">Your next chapter in technology starts here.</h2><p className="mt-6 leading-7 text-slate-400">Join a community learning practical skills and building meaningful digital products for Myanmar and beyond.</p></div>
                <p className="relative z-10 text-sm text-slate-500">Technology · Education · Innovation</p>
            </aside>
            <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:justify-center lg:px-20">
                <div className="mx-auto w-full max-w-md"><div className="mb-12 lg:hidden"><BrandLogo /></div><p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Codexa MM</p><h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1><p className="mt-3 leading-7 text-slate-400">{description}</p><div className="mt-8">{children}</div><Link href="/" className="mt-10 inline-block text-sm font-semibold text-slate-500 transition hover:text-white">← Back to homepage</Link></div>
            </main>
        </div>
    );
}

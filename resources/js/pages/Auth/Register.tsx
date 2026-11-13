import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

export default function Register() {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/register'); };
    return <AuthLayout title="Create your account" description="Start your journey with practical learning and a community that builds together.">
        <Head title="Create an account" />
        <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Full name</span><input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoComplete="name" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Your name" />{form.errors.name && <span className="mt-1 block text-sm text-rose-300">{form.errors.name}</span>}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="you@example.com" />{form.errors.email && <span className="mt-1 block text-sm text-rose-300">{form.errors.email}</span>}</label>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Password</span><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="8+ characters" />{form.errors.password && <span className="mt-1 block text-sm text-rose-300">{form.errors.password}</span>}</label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Confirm password</span><input type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Repeat password" /></label></div>
            <p className="text-xs leading-5 text-slate-500">By creating an account, you agree to our <Link href="/terms" className="text-blue-400 hover:text-blue-300">Terms</Link> and <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.</p>
            <button disabled={form.processing} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{form.processing ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300">Sign in</Link></p>
    </AuthLayout>;
}

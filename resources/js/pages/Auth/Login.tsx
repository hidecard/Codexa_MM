import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

type LoginProps = { status?: string };

export default function Login({ status }: LoginProps) {
    const form = useForm({ email: '', password: '', remember: false });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/login'); };

    return <AuthLayout title="Welcome back" description="Sign in to continue learning, building, and growing with Codexa MM.">
        <Head title="Sign in" />
        {status && <div className="mb-5 rounded-xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-200">{status}</div>}
        <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="you@example.com" />{form.errors.email && <span className="mt-1 block text-sm text-rose-300">{form.errors.email}</span>}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Password</span><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Your password" />{form.errors.password && <span className="mt-1 block text-sm text-rose-300">{form.errors.password}</span>}</label>
            <div className="flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} className="size-4 rounded border-slate-600 bg-slate-800 text-blue-600" /> Remember me</label><Link href="/forgot-password" className="text-sm font-semibold text-blue-400 hover:text-blue-300">Forgot password?</Link></div>
            <button disabled={form.processing} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{form.processing ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">New to Codexa MM? <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300">Create an account</Link></p>
    </AuthLayout>;
}

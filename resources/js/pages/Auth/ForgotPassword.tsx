import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const form = useForm({ email: '' });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/forgot-password'); };
    return <AuthLayout title="Reset your password" description="Enter your email and we’ll send you a secure password reset link.">
        <Head title="Forgot password" />
        {status && <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{status}</div>}
        <form onSubmit={submit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="you@example.com" />{form.errors.email && <span className="mt-1 block text-sm text-rose-300">{form.errors.email}</span>}</label><button disabled={form.processing} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-60">{form.processing ? 'Sending…' : 'Email reset link'}</button></form>
        <p className="mt-8 text-center text-sm text-slate-400"><Link href="/login" className="font-bold text-blue-400 hover:text-blue-300">← Back to sign in</Link></p>
    </AuthLayout>;
}

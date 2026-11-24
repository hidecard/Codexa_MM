import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

type ResetPasswordProps = { email: string; token: string };

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const form = useForm({ token, email, password: '', password_confirmation: '' });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/reset-password'); };

    return <AuthLayout title="Choose a new password" description="Enter a new password for your Codexa MM account.">
        <Head title="Reset password" />
        <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="you@example.com" />{form.errors.email && <span className="mt-1 block text-sm text-rose-300">{form.errors.email}</span>}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">New password</span><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="new-password" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="At least 8 characters" />{form.errors.password && <span className="mt-1 block text-sm text-rose-300">{form.errors.password}</span>}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Confirm new password</span><input type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Repeat your new password" />{form.errors.password_confirmation && <span className="mt-1 block text-sm text-rose-300">{form.errors.password_confirmation}</span>}</label>
            <button disabled={form.processing} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{form.processing ? 'Resetting…' : 'Reset password'}</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400"><Link href="/login" className="font-bold text-blue-400 hover:text-blue-300">← Back to sign in</Link></p>
    </AuthLayout>;
}

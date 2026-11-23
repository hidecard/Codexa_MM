import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

type AcceptInviteProps = {
    name: string;
    email: string;
    acceptUrl: string;
};

export default function AcceptInvite({ name, email, acceptUrl }: AcceptInviteProps) {
    const form = useForm({ password: '', password_confirmation: '' });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post(acceptUrl); };

    return <AuthLayout title={`Welcome, ${name}`} description={`Set a password for your staff account (${email}) to start using Codexa MM.`}>
        <Head title="Accept invitation" />
        <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">New password</span><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="new-password" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="At least 8 characters" />{form.errors.password && <span className="mt-1 block text-sm text-rose-300">{form.errors.password}</span>}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Confirm password</span><input type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Repeat your password" />{form.errors.password_confirmation && <span className="mt-1 block text-sm text-rose-300">{form.errors.password_confirmation}</span>}</label>
            <button disabled={form.processing} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{form.processing ? 'Setting password…' : 'Set password & continue'}</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">This invitation link expires 7 days after it was sent. If it has expired, ask an admin to send a new invitation.</p>
    </AuthLayout>;
}

import { Head, Link, router } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';

export default function Maintenance() {
    return (
        <AuthLayout title="We'll be right back" description="Codexa MM is under maintenance right now. We're working to get things back up as soon as possible.">
            <Head title="Under Maintenance" />
            <p className="text-sm leading-6 text-slate-400">
                Please try again in a little while. If you were in the middle of a lesson, your progress is saved.
            </p>
            <div className="mt-6 flex flex-col gap-3">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-500"
                >
                    Try again
                </button>
                <button
                    onClick={() => router.post('/logout')}
                    className="w-full rounded-xl border border-slate-700 px-4 py-3.5 font-bold text-slate-200 transition hover:bg-slate-800"
                >
                    Log out
                </button>
                <Link href="/" className="mt-2 text-center text-sm font-semibold text-blue-400 hover:text-blue-300">
                    Back to the public site
                </Link>
            </div>
        </AuthLayout>
    );
}

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import type { FormEvent } from 'react';

type Flash = { flash?: { success?: string } };
export default function Contact() {
    const { props } = usePage<Flash>();
    const form = useForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/contact', { preserveScroll: true, onSuccess: () => form.reset() }); };
    return (
        <PublicLayout>
            <Head title="Contact" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader eyebrow="Get in touch" title="Contact Codexa MM" description="Tell us about your learning goals or project needs — we’ll get back to you." />
                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                    <Card><CardContent className="p-6 sm:p-8">
                        {props.flash?.success && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{props.flash.success}</div>}
                        <form className="space-y-5" onSubmit={submit} aria-label="Contact form">
                            <input type="text" name="website" value={form.data.website} onChange={(e) => form.setData('website', e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden" />
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input label="Name" name="name" autoComplete="name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                                <Input label="Email" name="email" type="email" autoComplete="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                            </div>
                            <Input label="Phone (optional)" name="phone" autoComplete="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} />
                            <Input label="Subject" name="subject" required value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} error={form.errors.subject} />
                            <div>
                                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                                <textarea id="message" name="message" required rows={5} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="How can we help?" aria-invalid={Boolean(form.errors.message)} />
                                {form.errors.message && <p className="mt-1.5 text-sm text-rose-600">{form.errors.message}</p>}
                            </div>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Sending…' : 'Send message'}</Button>
                        </form>
                    </CardContent></Card>
                    <div className="space-y-6">
                        <Card><CardContent className="flex items-start gap-4 p-6"><Mail className="mt-1 size-6 text-blue-600" aria-hidden="true" /><div><h2 className="font-bold">Email</h2><p className="mt-1 text-slate-600">Reach us for academy and solutions inquiries.</p><a href="mailto:hello@codexamm.com" className="mt-2 inline-block font-semibold text-blue-600 hover:text-blue-700">hello@codexamm.com</a></div></CardContent></Card>
                        <Card><CardContent className="p-6"><h2 className="font-bold">Explore</h2><p className="mt-2 text-slate-600">Looking for courses or services?</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Browse courses →</Link><Link href="/services" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View solutions →</Link></div></CardContent></Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PublicLayout } from '@/components/shared/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import type { FormEvent } from 'react';

type Flash = { flash?: { success?: string } };

const topics = ['သင်တန်း အကြောင်း မေးမြန်းရန်', 'ငွေပေးချေမှု ပြဿနာ', 'နည်းပညာ ပြဿနာ', 'အဖွဲ့လိုက် / ကုမ္ပဏီ သင်တန်း', 'အကြံပြုချက်', 'အခြား'];

export default function Contact() {
    const { props } = usePage<Flash>();
    const form = useForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/contact', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <PublicLayout>
            <Head title="ဆက်သွယ်ရန်" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">ဆက်သွယ်ရန်</h1>
                <p className="mt-1 max-w-2xl text-sm text-[#5a6a8a] dark:text-[#97a6c6]">
                    မေးခွန်း၊ အကြံပြုချက်၊ သင်တန်း အဖွဲ့လိုက် ဝယ်ယူမှု — ဘာပဲ ဖြစ်ဖြစ် ကျွန်ုပ်တို့ ထံ ဆက်သွယ်နိုင်ပါတယ်
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-start gap-4 p-5">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                                <Mail className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-extrabold">Email</h2>
                                <a href="mailto:support@codexamm.com" className="mt-0.5 block text-sm font-semibold text-teal-700 dark:text-teal-300">
                                    support@codexamm.com
                                </a>
                                <p className="mt-1 text-xs leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">ရုံးချိန် အတွင်း 24 နာရီအတွင်း ပြန်ကြားပေးပါတယ်</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-start gap-4 p-5">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                                <Phone className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-extrabold">ဖုန်း / Viber</h2>
                                <a href="tel:+959771234567" className="mt-0.5 block text-sm font-semibold text-teal-700 dark:text-teal-300">
                                    09 771 234 567
                                </a>
                                <p className="mt-1 flex items-center gap-1 text-xs leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                                    <Clock3 className="size-3.5" /> တနင်္လာ–စနေ · မနက် 9:00 – ညနေ 5:00
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-start gap-4 p-5">
                            <span className="grid size-11 flex-none place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                                <MapPin className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-extrabold">ရုံး လိပ်စာ</h2>
                                <p className="mt-0.5 text-sm font-semibold">အမှတ် ၁၂၃၊ ပြည်လမ်း၊ ကမာရွတ် မြို့နယ်၊ ရန်ကုန်</p>
                                <p className="mt-1 text-xs leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">လာရောက် ဆွေးနွေးချင်ရင် ကြိုတင် appointment ယူပါ</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-6 sm:p-8">
                            <h2 className="text-xl font-extrabold">Message ပို့ရန်</h2>
                            {props.flash?.success && (
                                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200" role="status">
                                    {props.flash.success}
                                </div>
                            )}
                            <form className="mt-5 space-y-5" onSubmit={submit} aria-label="Contact form">
                                <input
                                    type="text"
                                    name="website"
                                    value={form.data.website}
                                    onChange={(e) => form.setData('website', e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    className="absolute -left-[9999px] h-px w-px overflow-hidden"
                                />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="အမည်" name="name" autoComplete="name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                                    <Input label="Email" name="email" type="email" autoComplete="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                                </div>
                                <Input label="ဖုန်း (မထည့်လဲ ရပါတယ်)" name="phone" autoComplete="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} />
                                <div>
                                    <label htmlFor="topic" className="mb-1.5 block text-sm font-medium">
                                        ခေါင်းစဉ် အမျိုးအစား
                                    </label>
                                    <select
                                        id="topic"
                                        value={topics.includes(form.data.subject) ? form.data.subject : ''}
                                        onChange={(e) => form.setData('subject', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <option value="">ရွေးချယ်ပါ</option>
                                        {topics.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input label="ခေါင်းစဉ်" name="subject" required value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} error={form.errors.subject} />
                                <div>
                                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={5}
                                        value={form.data.message}
                                        onChange={(e) => form.setData('message', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="သင့် မေးခွန်း သို့မဟုတ် အကြံပြုချက်ကို ရေးပါ…"
                                        aria-invalid={Boolean(form.errors.message)}
                                    />
                                    {form.errors.message && <p className="mt-1.5 text-sm text-rose-600">{form.errors.message}</p>}
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'ပို့နေပါတယ်…' : 'Message ပို့ရန်'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-extrabold">မြန်ဆန်တဲ့ အကူအညီ</h2>
                                <p className="mt-2 text-sm leading-relaxed text-[#5a6a8a] dark:text-[#97a6c6]">
                                    အကောင့် ဝင်မရတာ၊ video ကြည့်မရတာ စတဲ့ အရေးပေါ် ကိစ္စတွေအတွက် Help page က Support Ticket က ပိုမြန်ပါတယ်။ ပို့လိုက်တဲ့ message တွေက Admin ဘက် Support Tickets ထဲ
                                    ရောက်သွားပြီး အဖွဲ့က အဲဒီကနေ ပြန်ကြားပေးပါတယ်။
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link href="/faq" className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
                                        အကူအညီ & FAQ သို့ →
                                    </Link>
                                    <Link href="/student/messages" className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
                                        ဆရာထံ Message ပို့ရန် →
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-extrabold">သင်တန်းများ ကြည့်ရန်</h2>
                                <p className="mt-2 text-sm text-[#5a6a8a] dark:text-[#97a6c6]">စာရင်းသွင်းဖို့ အဆင်သင့်ဖြစ်ပြီလား?</p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link href="/courses" className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
                                        သင်တန်းများ ကြည့်ရန် →
                                    </Link>
                                    <Link href="/services" className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
                                        ဝန်ဆောင်မှုများ →
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

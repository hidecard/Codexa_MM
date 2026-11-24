import { useState, type FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Category = { id: number; name: string };

const STEPS = ['အခြေခံ အချက်အလက်', 'ဖော်ပြချက်', 'ဈေးနှုန်းနဲ့ အခြေအနေ', 'အတည်ပြုရန်'];

export default function Create({ categories = [] }: { categories: Category[] }) {
    const [step, setStep] = useState(0);
    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id ?? '',
        title: '',
        slug: '',
        short_description: '',
        description: '',
        price: 0,
        sale_price: '',
        pricing_type: 'free',
        status: 'draft',
        level: 'beginner',
        language: 'en',
        duration: 0,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (step < STEPS.length - 1) {
            setStep(step + 1);
            return;
        }
        post('/instructor/courses');
    };

    const levelLabel = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[data.level] ?? data.level;

    return (
        <LmsShell title="သင်တန်း အသစ် ဖန်တီးရန်" nav="instructor">
            <Head title="သင်တန်း အသစ် ဖန်တီးရန်" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="သင်တန်း အသစ် ဖန်တီးရန်"
                description="အဆင့် ၄ ဆင့်နဲ့ သင်တန်း တစ်ခု အစအဆုံး ဖန်တီးပါ — ထုတ်ပြန်ရင် သင်တန်းများ page မှာ ချက်ချင်း ပေါ်လာပါတယ်"
                actions={
                    <Link href="/instructor/courses" className={btnGhostCls}>
                        <ChevronLeft className="size-4" /> ကျွန်ုပ်၏ သင်တန်းများ
                    </Link>
                }
            />

            {/* Step indicator */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
                {STEPS.map((label, i) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setStep(i)}
                        className={cn(
                            'flex items-center gap-2 rounded-full border px-3.5 py-2 text-[.82rem] font-bold transition',
                            i === step
                                ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950'
                                : i < step
                                  ? 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300'
                                  : 'border-slate-200 bg-white text-slate-500 dark:border-[#1e2c52] dark:bg-[#0d1730] dark:text-[#97a6c6]',
                        )}
                    >
                        <span
                            className={cn(
                                'grid size-5 place-items-center rounded-full text-[.7rem] font-extrabold',
                                i < step ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-teal-950' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
                            )}
                        >
                            {i < step ? <Check className="size-3" /> : i + 1}
                        </span>
                        {label}
                    </button>
                ))}
            </div>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <form onSubmit={submit} className="grid gap-5">
                    {step === 0 && (
                        <>
                            <Input label="သင်တန်း ခေါင်းစဉ်" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required />
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input label="Slug (optional)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select className={inputCls} value={data.category_id} onChange={(e) => setData('category_id', Number(e.target.value))}>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1.5 text-sm text-rose-600">{errors.category_id}</p>}
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelCls}>အဆင့်</label>
                                    <select className={inputCls} value={data.level} onChange={(e) => setData('level', e.target.value)}>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <Input label="ဘာသာစကား" value={data.language} onChange={(e) => setData('language', e.target.value)} error={errors.language} />
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <Input
                                label="အကျဉ်းချုပ် ဖော်ပြချက်"
                                value={data.short_description}
                                onChange={(e) => setData('short_description', e.target.value)}
                                error={errors.short_description}
                            />
                            <div>
                                <label className={labelCls}>အသေးစိတ် ဖော်ပြချက်</label>
                                <Textarea rows={6} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                {errors.description && <p className="mt-1.5 text-sm text-rose-600">{errors.description}</p>}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="grid gap-5 sm:grid-cols-3">
                                <div>
                                    <label className={labelCls}>ဈေးနှုန်း အမျိုးအစား</label>
                                    <select className={inputCls} value={data.pricing_type} onChange={(e) => setData('pricing_type', e.target.value)}>
                                        <option value="free">အခမဲ့ (Free)</option>
                                        <option value="paid">ပေးချေရမည် (Paid)</option>
                                        <option value="package">Package</option>
                                    </select>
                                </div>
                                <Input label="ဈေးနှုန်း (ကျပ်)" type="number" min={0} value={data.price} onChange={(e) => setData('price', Number(e.target.value))} error={errors.price} />
                                <Input
                                    label="လျှော့ဈေး (ကျပ်) — optional"
                                    type="number"
                                    min={0}
                                    value={data.sale_price}
                                    onChange={(e) => setData('sale_price', e.target.value)}
                                    error={errors.sale_price}
                                />
                            </div>
                            <div className="grid gap-5 sm:grid-cols-3">
                                <div>
                                    <label className={labelCls}>အခြေအနေ</label>
                                    <select className={inputCls} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <Input label="ကြာချိန် (နာရီ)" type="number" min={0} value={data.duration} onChange={(e) => setData('duration', Number(e.target.value))} error={errors.duration} />
                            </div>
                            <p className={`text-sm leading-relaxed ${mutedCls}`}>
                                အရင် Draft အဖြစ် သိမ်းပြီး သင်ရိုးကို Curriculum Builder မှာ ပြင်နိုင်ပါတယ်။ အဆင်သင့် ဖြစ်မှ Publish လုပ်ပါ — Publish လုပ်တဲ့
                                သင်တန်းပဲ ကျောင်းသားတွေ ဝယ်လို့ ရပါမယ်။
                            </p>
                        </>
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            <h2 className={`text-lg font-extrabold ${inkCls}`}>အတည်ပြုရန်</h2>
                            <dl className={`grid gap-2 text-sm sm:grid-cols-2 ${mutedCls}`}>
                                <div>
                                    <dt className="font-semibold">ခေါင်းစဉ်</dt>
                                    <dd className={inkCls}>{data.title || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">Category</dt>
                                    <dd className={inkCls}>{categories.find((c) => c.id === Number(data.category_id))?.name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">အဆင့်</dt>
                                    <dd className={inkCls}>{levelLabel}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">ဈေးနှုန်း</dt>
                                    <dd className={inkCls}>{data.pricing_type === 'free' ? 'အခမဲ့' : `${Number(data.price).toLocaleString()} ကျပ်`}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">အခြေအနေ</dt>
                                    <dd className={inkCls}>{data.status === 'draft' ? 'Draft' : data.status === 'published' ? 'Published' : 'Archived'}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">ကြာချိန်</dt>
                                    <dd className={inkCls}>{data.duration} နာရီ</dd>
                                </div>
                            </dl>
                            {data.short_description && (
                                <p className={`text-sm leading-relaxed ${mutedCls}`}>{data.short_description}</p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-[#18264a]">
                        <button
                            type="button"
                            className={btnGhostCls}
                            disabled={step === 0}
                            onClick={() => setStep(Math.max(0, step - 1))}
                        >
                            <ArrowLeft className="size-4" /> ရှေ့သို့
                        </button>
                        <button type="submit" className={btnAccentCls} disabled={processing}>
                            {step < STEPS.length - 1 ? (
                                <>
                                    နောက်သို့ <ArrowRight className="size-4" />
                                </>
                            ) : (
                                'Draft အဖြစ် ဖန်တီးရန်'
                            )}
                        </button>
                    </div>
                </form>
            </LmsCard>
        </LmsShell>
    );
}

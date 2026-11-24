import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type Course = { id: number; title: string };

export default function Create({ courses = [] }: { courses: Course[] }) {
    const { data, setData, post, processing, errors } = useForm({
        course_id: '',
        title: '',
        description: '',
        pass_mark: 60,
        time_limit: '' as string | number,
        shuffle_questions: false,
        show_correct_answers: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/instructor/quizzes');
    };

    return (
        <LmsShell title="Quiz အသစ် ဖန်တီးရန်" nav="instructor">
            <Head title="Quiz အသစ် ဖန်တီးရန်" />
            <PageIntro
                title="Quiz အသစ် ဖန်တီးရန်"
                description="သင်တန်း တစ်ခု ရွေးပြီး quiz အခြေခံ အချက်အလက်တွေ ဖြည့်ပါ — မေးခွန်းတွေကို နောက် အဆင့်မှာ ထည့်နိုင်ပါတယ်"
                actions={
                    <Link href="/instructor/quizzes" className={btnGhostCls}>
                        <ArrowLeft className="size-4" /> Quiz အားလုံး
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`text-lg font-extrabold ${inkCls}`}>အခြေခံ အချက်အလက်</h2>
                    <p className={`mt-0.5 text-sm ${mutedCls}`}>Quiz အသေးစိတ်နဲ့ သင်တန်း ရွေးချယ်ပါ။</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className={labelCls}>သင်တန်း *</label>
                            <select className={inputCls} value={data.course_id} onChange={(e) => setData('course_id', e.target.value)}>
                                <option value="">သင်တန်း ရွေးပါ</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                            {errors.course_id && <p className="mt-1 text-sm text-rose-600">{errors.course_id}</p>}
                        </div>
                        <Input label="Quiz ခေါင်းစဉ် *" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} placeholder="ဥပမာ — HTML အခြေခံ Quiz" required />
                        <div>
                            <label className={labelCls}>ဖော်ပြချက်</label>
                            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="ကျောင်းသားတွေအတွက် ရှင်းလင်းချက် (optional)" rows={3} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="အောင်မှတ် (%) *" type="number" min={0} max={100} value={data.pass_mark} onChange={(e) => setData('pass_mark', parseInt(e.target.value) || 0)} error={errors.pass_mark} required />
                            <Input
                                label="အချိန်ကန့်သတ်ချက် (မိနစ်, optional)"
                                type="number"
                                min={1}
                                max={600}
                                value={data.time_limit}
                                onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="ဥပမာ 30"
                            />
                        </div>
                    </div>
                </LmsCard>

                <LmsCard className="p-5 sm:p-6">
                    <h2 className={`text-lg font-extrabold ${inkCls}`}>ချိန်ညှိမှုများ</h2>
                    <div className="mt-4 space-y-4">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <span>
                                <span className={cn('block font-medium', inkCls)}>မေးခွန်း အစီအစဉ် ကျပန်းလုပ်ရန်</span>
                                <span className={cn('text-sm', mutedCls)}>ဖြေဆိုမှု တစ်ကြိမ်ချင်းမှာ မေးခွန်း အစီအစဉ် ပြောင်းလဲပေးပါမယ်။</span>
                            </span>
                            <input type="checkbox" checked={data.shuffle_questions} onChange={(e) => setData('shuffle_questions', e.target.checked)} className="size-5 accent-teal-700" />
                        </label>
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <span>
                                <span className={cn('block font-medium', inkCls)}>အဖြေမှန် ပြရန်</span>
                                <span className={cn('text-sm', mutedCls)}>တင်သွင်းပြီးနောက် ကျောင်းသားတွေ အဖြေမှန်ကို ကြည့်နိုင်ပါမယ်။</span>
                            </span>
                            <input type="checkbox" checked={data.show_correct_answers} onChange={(e) => setData('show_correct_answers', e.target.checked)} className="size-5 accent-teal-700" />
                        </label>
                    </div>
                </LmsCard>

                <div className="flex items-center justify-end gap-3">
                    <Link href="/instructor/quizzes" className={btnGhostCls}>
                        မလုပ်တော့ပါ
                    </Link>
                    <button type="submit" className={btnAccentCls} disabled={processing}>
                        <Plus className="size-4" /> Quiz ဖန်တီးရန်
                    </button>
                </div>
            </form>
        </LmsShell>
    );
}

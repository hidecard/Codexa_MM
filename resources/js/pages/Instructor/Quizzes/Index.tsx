import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BarChart2, Clock, Eye, Plus, Search, Trophy } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type Quiz = {
    id: number;
    title: string;
    pass_mark: number;
    time_limit: number | null;
    questions_count: number;
    attempts_count: number;
    course: { id: number; title: string } | null;
};

type Course = { id: number; title: string };

export default function Index({ quizzes = [], courses = [] }: { quizzes: Quiz[]; courses: Course[] }) {
    const [query, setQuery] = useState('');
    const [courseId, setCourseId] = useState('');

    const filtered = quizzes.filter((q) => {
        if (courseId && String(q.course?.id) !== courseId) return false;
        if (query && !q.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <LmsShell title="Quizzes" nav="instructor">
            <Head title="Quizzes" />
            <PageIntro
                title="Quizzes"
                description="သင်တန်းတွေအတွက် quiz ဖန်တီး၊ မေးခွန်း ပြင်ဆင်ပြီး ကျောင်းသားတွေရဲ့ ရလဒ်ကို ကြည့်ရန်"
                actions={
                    <Link href="/instructor/quizzes/create" className={btnAccentCls}>
                        <Plus className="size-4" /> Quiz အသစ်
                    </Link>
                }
            />

            <LmsCard className="mt-6 p-5">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[200px] flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#97a6c6]">ရှာဖွေရန်</label>
                        <div className="relative">
                            <Search className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${mutedCls}`} />
                            <input className={`${inputCls} pl-9`} placeholder="Quiz ခေါင်းစဉ် ရှာရန်…" value={query} onChange={(e) => setQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="min-w-[200px]">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#97a6c6]">သင်တန်း</label>
                        <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                            <option value="">သင်တန်း အားလုံး</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </LmsCard>

            {filtered.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="Quiz မရှိသေးပါ" description="ပထမဆုံး quiz ကို ဖန်တီးပြီး မေးခွန်းတွေ ထည့်နိုင်ပါတယ်" />
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {filtered.map((quiz) => (
                        <LmsCard key={quiz.id} className="p-4 transition hover:border-teal-300 dark:hover:border-teal-700">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className={`truncate font-bold ${inkCls}`}>{quiz.title}</h3>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                                        {quiz.course && <Pill tone="slate">{quiz.course.title}</Pill>}
                                        <Pill tone="amber">
                                            <Trophy className="mr-1 size-3" /> အောင်မှတ် {quiz.pass_mark}%
                                        </Pill>
                                        {quiz.time_limit && (
                                            <Pill tone="blue">
                                                <Clock className="mr-1 size-3" /> {quiz.time_limit} မိနစ်
                                            </Pill>
                                        )}
                                        <Pill tone="slate">{quiz.questions_count} မေးခွန်း</Pill>
                                        <Pill tone="slate">
                                            <BarChart2 className="mr-1 size-3" /> {quiz.attempts_count} ကြိမ် ဖြေထား
                                        </Pill>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/instructor/quizzes/${quiz.id}`} className={btnGhostCls}>
                                        <Eye className="size-4" /> ကြည့်ရန် / ပြင်ရန်
                                    </Link>
                                    <Link href={`/instructor/quizzes/${quiz.id}/results`} className={btnGhostCls}>
                                        <BarChart2 className="size-4" /> ရလဒ်
                                    </Link>
                                </div>
                            </div>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

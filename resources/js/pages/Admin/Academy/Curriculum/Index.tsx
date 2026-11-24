import { useState, type FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, Play, Plus, Trash2 } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { cn } from '@/lib/utils';

type LessonRow = { id: number; title: string; type: string; duration: number; video?: string | null };
type ModuleRow = { id: number; title: string; description: string | null; position: number; lessons: LessonRow[] };
type CourseOption = { id: number; title: string };

export default function Index({ courses = [], courseId = 0, modules = [] }: { courses?: CourseOption[]; courseId?: number; modules?: ModuleRow[] }) {
    const [open, setOpen] = useState<Record<number, boolean>>({});
    const [newModule, setNewModule] = useState('');
    const [lessonForm, setLessonForm] = useState<number | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState('video');
    const [lessonDuration, setLessonDuration] = useState('');
    const [lessonVideo, setLessonVideo] = useState('');
    const [lessonFree, setLessonFree] = useState(false);
    const [notice, setNotice] = useState('');

    const course = courses.find((c) => c.id === courseId);

    const pickCourse = (id: number) => {
        router.get('/admin/academy/curriculum', { course: id }, { preserveScroll: true });
    };

    const addModule = (e: FormEvent) => {
        e.preventDefault();
        if (!newModule.trim() || !courseId) return;
        router.post('/admin/academy/modules', { course_id: courseId, title: newModule.trim() }, { preserveScroll: true, onSuccess: () => { setNewModule(''); setNotice('အခန်း ထည့်ပြီးပါပြီ'); } });
    };

    const removeModule = (id: number) => {
        if (confirm('ဒီ အခန်းနဲ့ သင်ခန်းစာတွေကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/modules/${id}`, { preserveScroll: true, onSuccess: () => setNotice('အခန်း ဖျက်ပြီးပါပြီ') });
        }
    };

    const addLesson = (e: FormEvent, moduleId: number) => {
        e.preventDefault();
        if (!lessonTitle.trim()) return;
        router.post(
            '/admin/academy/lessons',
            { module_id: moduleId, title: lessonTitle.trim(), type: lessonType, duration: lessonDuration ? Number(lessonDuration) : 0, video_url: lessonVideo.trim() || null, is_free: lessonFree },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLessonTitle('');
                    setLessonType('video');
                    setLessonDuration('');
                    setLessonVideo('');
                    setLessonFree(false);
                    setLessonForm(null);
                    setNotice('သင်ခန်းစာ ထည့်ပြီးပါပြီ');
                },
            },
        );
    };

    const removeLesson = (id: number) => {
        if (confirm('ဒီ သင်ခန်းစာကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/admin/academy/lessons/${id}`, { preserveScroll: true, onSuccess: () => setNotice('သင်ခန်းစာ ဖျက်ပြီးပါပြီ') });
        }
    };

    return (
        <LmsShell title="သင်ရိုး တည်ဆောက်ရန်" nav="admin">
            <Head title="သင်ရိုး တည်ဆောက်ရန်" />
            <PageIntro
                eyebrow="ADMIN"
                title="သင်ရိုး တည်ဆောက်ရန်"
                description="သင်တန်း တစ်ခုချင်းရဲ့ အခန်း (Module) နဲ့ သင်ခန်းစာတွေကို စီမံရန် — သင်ခန်းစာတိုင်းမှာ YouTube link ချိတ်နိုင်ပြီး Player က embed နဲ့ တိုက်ရိုက် ဖွင့်ပေးပါတယ်။ ပြောင်းလဲမှုတွေက Player မှာ တိုက်ရိုက် သက်ရောက်ပါတယ်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                    <label className={labelCls}>သင်တန်း ရွေးရန်</label>
                    <select className={inputCls} value={courseId} onChange={(e) => pickCourse(Number(e.target.value))}>
                        {courses.length === 0 && <option value={0}>သင်တန်း မရှိသေးပါ</option>}
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>
                <form onSubmit={addModule} className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className={labelCls}>အခန်း (Module) အသစ် ထည့်ရန်</label>
                        <input className={inputCls} value={newModule} onChange={(e) => setNewModule(e.target.value)} placeholder="အခန်း အမည်" />
                    </div>
                    <button type="submit" className={btnAccentCls}>
                        <Plus className="size-4" /> ထည့်ရန်
                    </button>
                </form>
            </div>

            <p className={`mt-4 text-sm font-semibold ${mutedCls}`}>
                {course?.title} · အခန်း {modules.length} ခု · သင်ခန်းစာ {modules.reduce((s, m) => s + m.lessons.length, 0)} ခု
            </p>

            {modules.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="အခန်း မရှိသေးပါ" description="အပေါ်မှာ အခန်း အမည် ရိုက်ပြီး ပထမဆုံး အခန်း ထည့်ပါ" />
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {modules.map((m) => (
                        <LmsCard key={m.id} className="p-5">
                            <div className="flex w-full items-center gap-2">
                                <button type="button" onClick={() => setOpen({ ...open, [m.id]: !(open[m.id] ?? true) })} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                    <ChevronDown className={cn('size-4 flex-none transition', mutedCls, !(open[m.id] ?? true) && '-rotate-90')} />
                                    <span className={`truncate text-[1.02rem] font-extrabold ${inkCls}`}>{m.title}</span>
                                    <span className={`ml-auto flex-none text-[.8rem] font-semibold ${mutedCls}`}>{m.lessons.length} သင်ခန်းစာ</span>
                                </button>
                                <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => removeModule(m.id)}>
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                            {(open[m.id] ?? true) && (
                                <>
                                    <ul className="mt-3 space-y-2">
                                        {m.lessons.length === 0 ? (
                                            <li className={`text-sm ${mutedCls}`}>သင်ခန်းစာ မရှိသေးပါ။</li>
                                        ) : (
                                            m.lessons.map((l) => (
                                                <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f]">
                                                    <Play className="size-4 text-teal-700 dark:text-teal-300" />
                                                    <span className={`flex-1 font-semibold ${inkCls}`}>{l.title}</span>
                                                    <Pill tone="slate">{l.type}</Pill>
                                                    <span className={mutedCls}>{l.duration} မိနစ်</span>
                                                    {l.video && (
                                                        <a href={l.video} target="_blank" rel="noreferrer" className={btnGhostCls}>
                                                            YouTube
                                                        </a>
                                                    )}
                                                    <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => removeLesson(l.id)}>
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                    {lessonForm === m.id ? (
                                        <form onSubmit={(e) => addLesson(e, m.id)} className="mt-3 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2c52] dark:bg-[#0d1730]">
                                            <input className={`${inputCls} min-w-[180px] flex-1`} placeholder="သင်ခန်းစာ အမည်" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required />
                                            <select className={`${inputCls} w-32`} value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                                                <option value="video">Video</option>
                                                <option value="text">Text</option>
                                                <option value="quiz">Quiz</option>
                                                <option value="assignment">Assignment</option>
                                            </select>
                                            <input className={`${inputCls} w-28`} placeholder="မိနစ်" type="number" min={0} value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} />
                                            <input className={`${inputCls} min-w-[200px] flex-1`} placeholder="YouTube link (မထည့်လည်း ရပါတယ်)" value={lessonVideo} onChange={(e) => setLessonVideo(e.target.value)} />
                                            <label className={cn('flex items-center gap-2 text-sm font-medium', mutedCls)}>
                                                <input type="checkbox" checked={lessonFree} onChange={(e) => setLessonFree(e.target.checked)} className="size-4 accent-teal-700" />
                                                အခမဲ့
                                            </label>
                                            <button type="submit" className={btnAccentCls}>
                                                <Plus className="size-4" /> ထည့်ရန်
                                            </button>
                                            <button type="button" className={btnGhostCls} onClick={() => setLessonForm(null)}>
                                                ပယ်ဖျက်ရန်
                                            </button>
                                        </form>
                                    ) : (
                                        <button type="button" className={`${btnGhostCls} mt-3`} onClick={() => setLessonForm(m.id)}>
                                            <Plus className="size-4" /> သင်ခန်းစာ ထည့်ရန်
                                        </button>
                                    )}
                                </>
                            )}
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

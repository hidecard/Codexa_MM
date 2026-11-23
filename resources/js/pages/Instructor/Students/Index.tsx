import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Download, MessageSquare } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ProgressBar } from '@/components/lms/progress-bar';
import { formatNumber } from '@/lib/format';
import { Avatar, Chip, EmptyBox, LmsCard, PageIntro, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES, SAMPLE_INST_STUDENTS, type SampleInstStudent } from '@/pages/Admin/Academy/_sample';

type StudentRow = {
    id: number;
    name: string;
    init: string;
    col: string;
    courseId: number;
    courseTitle: string;
    progress: number;
    last: string;
    xp: number;
};

type CourseOption = { id: number; title: string };

export default function Index({ students, courses }: { students?: StudentRow[]; courses?: CourseOption[] }) {
    const [filter, setFilter] = useState<number | 'all'>('all');
    // SAMPLE DATA fallback (prototype): route is a closure with no props yet.
    const courseOptions: CourseOption[] =
        courses ?? SAMPLE_COURSES.filter((c) => c.instructor === 'Thura Aung').map((c) => ({ id: c.id, title: c.title }));
    const rows: StudentRow[] =
        students ??
        SAMPLE_INST_STUDENTS.map((s: SampleInstStudent, i: number) => ({
            id: i + 1,
            name: s.name,
            init: s.init,
            col: s.col,
            courseId: s.courseId,
            courseTitle: SAMPLE_COURSES.find((c) => c.id === s.courseId)?.title ?? '',
            progress: s.progress,
            last: s.last,
            xp: s.xp,
        }));

    const list = rows.filter((s) => filter === 'all' || s.courseId === filter);
    const avg = list.length ? Math.round(list.reduce((s, x) => s + x.progress, 0) / list.length) : 0;

    return (
        <LmsShell title="ဆရာ၏ ကျောင်းသားများ" nav="instructor">
            <Head title="ဆရာ၏ ကျောင်းသားများ" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="ဆရာ၏ ကျောင်းသားများ"
                description="သင့် သင်တန်းတွေမှာ စာရင်းသွင်းထားတဲ့ ကျောင်းသားတွေရဲ့ တိုးတက်မှုကို ကြည့်ပြီး message ပို့နိုင်ပါတယ်"
                actions={
                    <a href="/instructor/students" className={btnGhostCls}>
                        <Download className="size-4" /> ကျောင်းသားစာရင်း ဒေါင်းလုဒ်ရန်
                    </a>
                }
            />

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                    သင်တန်း အားလုံး
                </Chip>
                {courseOptions.map((c) => (
                    <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
                        {c.title}
                    </Chip>
                ))}
            </div>

            <p className={`mt-4 text-sm font-semibold ${mutedCls}`}>
                ကျောင်းသား {formatNumber(list.length)} ဦး · ပျမ်းမျှ တိုးတက်မှု {avg}%
            </p>

            {list.length === 0 ? (
                <div className="mt-6">
                    <EmptyBox title="ဒီ သင်တန်းမှာ ကျောင်းသား မရှိသေးပါ" description="ကျောင်းသားတွေ စာရင်းသွင်းရင် ဒီမှာ ပေါ်လာပါမယ်" />
                </div>
            ) : (
                <div className="mt-4 space-y-3.5">
                    {list.map((s) => (
                        <LmsCard key={s.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                            <Avatar init={s.init} color={s.col} size="lg" />
                            <div className="min-w-0 flex-1">
                                <p className={`text-[.95rem] font-extrabold ${inkCls}`}>
                                    {s.name} <span className={`text-[.78rem] font-semibold ${mutedCls}`}>· {formatNumber(s.xp)} XP</span>
                                </p>
                                <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                    {s.courseTitle} · နောက်ဆုံး တက်ရောက်မှု {s.last}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex-1">
                                        <ProgressBar value={s.progress} />
                                    </div>
                                    <span className={`flex-none text-[.8rem] font-extrabold ${inkCls}`}>{s.progress}%</span>
                                </div>
                            </div>
                            <Link href="/instructor/qa" className={`${btnGhostCls} flex-none`}>
                                <MessageSquare className="size-4" /> Message ပို့ရန်
                            </Link>
                        </LmsCard>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

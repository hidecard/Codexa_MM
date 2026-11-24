import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { HelpCircle, Plus } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Chip, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_COURSES } from '@/pages/Admin/Academy/_sample';

// SAMPLE DATA fallback (prototype): used until Admin/Academy/QuizController is wired.
const SAMPLE_QUESTIONS = [
    { id: 1, course: 'HTML & CSS Foundations', q: 'CSS Grid မှာ grid-template-columns: repeat(3, 1fr) ဆိုတာ ဘာကို ဆိုလိုသလဲ?', options: ['ကော်လံ ၃ ခု အညီအမျှ', 'အတန်း ၃ ခု', 'စာမျက်နှာ ၃ ခု', 'ဖောင့် အရွယ် ၃ မျိုး'], correct: 0 },
    { id: 2, course: 'React.js Complete Course', q: 'useEffect dependency array ချန်ထားမိရင် ဘာဖြစ်မလဲ?', options: ['တစ်ကြိမ်သာ run မည်', 'render တိုင်း run မည်', 'error တက်မည်', 'ဘာမှ မဖြစ်ပါ'], correct: 1 },
    { id: 3, course: 'Python for Beginners', q: 'Python မှာ list comprehension ရဲ့ ရည်ရွယ်ချက်က ဘာလဲ?', options: ['List အသစ် မြန်မြန် တည်ဆောက်ရန်', 'File ဖတ်ရန်', 'Loop ရပ်ရန်', 'Error ကိုင်တွယ်ရန်'], correct: 0 },
];

type QuestionRow = (typeof SAMPLE_QUESTIONS)[number];

export default function Index({ questions }: { questions?: QuestionRow[] }) {
    const [tab, setTab] = useState<'quiz' | 'assignments'>('quiz');
    const [items, setItems] = useState<QuestionRow[]>(questions ?? SAMPLE_QUESTIONS);
    const [course, setCourse] = useState(SAMPLE_COURSES[0].title);
    const [q, setQ] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correct, setCorrect] = useState(0);
    const [notice, setNotice] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!q.trim() || options.some((o) => !o.trim())) return;
        setItems([{ id: Date.now(), course, q: q.trim(), options: [...options], correct }, ...items]);
        setQ('');
        setOptions(['', '', '', '']);
        setNotice('မေးခွန်း ထည့်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const list = items.filter((x) => x.course === course);

    return (
        <LmsShell title="Quiz & Assignment စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Quiz & Assignment စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Quiz & Assignment စီမံခန့်ခွဲမှု"
                description="Quiz မေးခွန်းများ ဖန်တီးရန်နဲ့ ကျောင်းသားတွေ တင်ထားတဲ့ assignment များကို အမှတ်ပေးရန်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
                <Chip active={tab === 'quiz'} onClick={() => setTab('quiz')}>
                    Quiz မေးခွန်းများ
                </Chip>
                <Chip active={tab === 'assignments'} onClick={() => setTab('assignments')}>
                    Assignment အမှတ်ပေးရန်
                </Chip>
            </div>

            {tab === 'assignments' ? (
                <div className="mt-6">
                    <EmptyBox
                        title="Assignment အမှတ်ပေးရန် — သီးသန့် page ရှိပါတယ်"
                        description="Assignment စီမံခန့်ခွဲမှု page မှာ တင်သွင်းမှုတွေကို ကြည့်ပြီး အမှတ်ပေးနိုင်ပါတယ်"
                    />
                    <div className="mt-4 text-center">
                        <a href="/admin/academy/assignments" className={btnAccentCls}>
                            Assignment စီမံရန် သွားရန်
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    <LmsCard className="mt-6 p-5 sm:p-6">
                        <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                            <Plus className="size-5" /> မေးခွန်း အသစ် ထည့်ရန်
                        </h2>
                        <form onSubmit={submit} className="mt-4 grid gap-3">
                            <div>
                                <label className={labelCls}>သင်တန်း</label>
                                <select className={inputCls} value={course} onChange={(e) => setCourse(e.target.value)}>
                                    {SAMPLE_COURSES.map((c) => (
                                        <option key={c.id} value={c.title}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>မေးခွန်း</label>
                                <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="မေးခွန်း ရေးပါ" required />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {options.map((o, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input className={`${inputCls} flex-1`} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`ရွေးချယ်မှု ${i + 1}`} required />
                                        <label className={`flex flex-none cursor-pointer items-center gap-1.5 text-sm font-medium ${mutedCls}`}>
                                            <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} className="size-4 accent-teal-700" />
                                            အဖြေမှန်
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <button type="submit" className={btnAccentCls}>
                                    မေးခွန်း ထည့်ရန်
                                </button>
                            </div>
                        </form>
                    </LmsCard>

                    <h2 className={`mt-8 text-lg font-extrabold ${inkCls}`}>မေးခွန်း စာရင်း — {course}</h2>
                    {list.length === 0 ? (
                        <div className="mt-4">
                            <EmptyBox title="ဒီ သင်တန်းအတွက် မေးခွန်း မရှိသေးပါ" description="အပေါ်က form မှာ ပထမဆုံး မေးခွန်း ထည့်နိုင်ပါတယ်" />
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3.5">
                            {list.map((x) => (
                                <LmsCard key={x.id} className="p-5">
                                    <p className={`flex gap-2 text-[.95rem] font-extrabold leading-snug ${inkCls}`}>
                                        <HelpCircle className="mt-0.5 size-4 flex-none text-teal-700 dark:text-teal-300" />
                                        {x.q}
                                    </p>
                                    <ul className="mt-3 space-y-1.5">
                                        {x.options.map((o, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <span className={`grid size-5 flex-none place-items-center rounded-full text-[.7rem] font-extrabold ${i === x.correct ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-teal-950' : 'bg-slate-100 text-slate-600 dark:bg-[#12234a] dark:text-[#97a6c6]'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className={inkCls}>{o}</span>
                                                {i === x.correct && <Pill tone="teal">အဖြေမှန်</Pill>}
                                            </li>
                                        ))}
                                    </ul>
                                </LmsCard>
                            ))}
                        </div>
                    )}
                </>
            )}
        </LmsShell>
    );
}

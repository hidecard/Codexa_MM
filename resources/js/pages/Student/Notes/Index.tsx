import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { Download, NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react';

type Note = { id: number; courseId: number; course?: string | null; lesson: string; body: string; date: string };
type Props = { notes?: Note[] };

const COURSE_NAMES: Record<number, string> = {
    1: 'HTML & CSS Foundations',
    2: 'JavaScript Deep Dive',
    3: 'Python for Beginners',
    4: 'React.js Complete Course',
    5: 'PHP & Laravel Framework',
    6: 'Flutter Mobile Development',
    7: 'UI/UX Design with Figma',
    8: 'MySQL & Database Design',
    9: 'Node.js API Development',
    10: 'Git, GitHub & Team Workflow',
};

/* SAMPLE DATA — fallback only; no Note model exists yet (from prototype). Notes are kept in this browser only. */
const SAMPLE_NOTES: Note[] = [
    { id: 1, courseId: 2, lesson: 'Async JS & Fetch API — အဓိက သဘောတရားများ', body: 'Promise က pending / fulfilled / rejected အခြေအနေ ၃ ခု ရှိတယ်။ async function က အမြဲ Promise ပြန်တယ်။ await သုံးရင် try/catch နဲ့ error ကိုင်ရမယ်။ fetch က HTTP error မှာ reject မလုပ်ဘူး — response.ok ကို စစ်ရမယ်။', date: 'နိုဝင်ဘာ 21' },
    { id: 2, courseId: 3, lesson: 'OOP Basics — Class နဲ့ Object', body: 'Class က blueprint, object က instance။ __init__ မှာ attribute သတ်မှတ်တယ်။ self က instance ကိုယ်တိုင်ကို ရည်ညွှန်းတယ်။ Inheritance နဲ့ code ပြန်သုံးနိုင်တယ်။', date: 'နိုဝင်ဘာ 19' },
    { id: 3, courseId: 1, lesson: 'Flexbox & Grid Layout — လက်တွေ့ လေ့ကျင့်ခန်း', body: 'တစ်ဖက်တည်း စီချင်ရင် Flexbox, နှစ်ဖက် (row + column) စီချင်ရင် Grid။ gap သုံးရင် margin hack မလိုတော့ဘူး။ justify-content က main axis, align-items က cross axis။', date: 'နိုဝင်ဘာ 17' },
    { id: 4, courseId: 10, lesson: 'Branching & Merging', body: 'Feature branch တစ်ခုချင်းစီ ခွဲလုပ်ပြီး main ကို အမြဲ deploy လို့ရတဲ့ အခြေအနေမှာ ထားရမယ်။ Merge conflict ဖြစ်ရင် marker တွေကြားက code ကို ရွေးပြင်ရတယ်။', date: 'နိုဝင်ဘာ 12' },
    { id: 5, courseId: 7, lesson: 'Components & Auto Layout', body: 'Auto Layout မှာ padding နဲ့ spacing ကို ပုံသေ သတ်မှတ်ထားရင် design system က သပ်ရပ်တယ်။ Component variant ကို Size / Style / State axis ခွဲပြီး အမည်ပေးပါ။', date: 'နိုဝင်ဘာ 08' },
];

export default function Index({ notes }: Props) {
    const [list, setList] = useState<Note[]>(notes && notes.length > 0 ? notes : SAMPLE_NOTES);
    const [query, setQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [lesson, setLesson] = useState('');
    const [body, setBody] = useState('');
    const [courseId, setCourseId] = useState(1);
    const [nextId, setNextId] = useState(100);

    const courseName = (n: Note) => n.course ?? COURSE_NAMES[n.courseId] ?? 'သင်တန်း';
    const filtered = list.filter((n) => {
        if (courseFilter !== 'all' && String(n.courseId) !== courseFilter) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return n.lesson.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    });
    const courseCount = new Set(list.map((n) => n.courseId)).size;

    const startEdit = (n: Note) => {
        setEditingId(n.id); setLesson(n.lesson); setBody(n.body); setCourseId(n.courseId); setShowForm(true);
    };
    const save = () => {
        if (!lesson.trim() || !body.trim()) return;
        if (editingId) {
            setList((l) => l.map((n) => (n.id === editingId ? { ...n, lesson: lesson.trim(), body: body.trim(), courseId } : n)));
        } else {
            setList((l) => [{ id: nextId, courseId, lesson: lesson.trim(), body: body.trim(), date: 'ယနေ့' }, ...l]);
            setNextId((n) => n + 1);
        }
        setLesson(''); setBody(''); setEditingId(null); setShowForm(false);
    };
    const downloadNote = (n: Note) => {
        const blob = new Blob([`${n.lesson}\n${courseName(n)} · ${n.date}\n\n${n.body}\n`], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `codexa-note-${n.id}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <LmsShell title="မှတ်စုများ" nav="student">
            <Head title="My Notes" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><NotebookPen className="size-7 text-teal-600" /> မှတ်စုများ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်ခန်းစာများမှ ကိုယ်ပိုင် မှတ်စုများ — ဤ browser တွင်သာ သိမ်းဆည်းထားသည်</p>
                </div>
                <button onClick={() => { setShowForm((s) => !s); setEditingId(null); setLesson(''); setBody(''); }} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                    <Plus className="size-4" /> မှတ်စု အသစ်
                </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
                <StatCard label="မှတ်စု စုစုပေါင်း" value={list.length} tone="teal" />
                <StatCard label="သင်တန်း အရေအတွက်" value={courseCount} tone="blue" />
                <StatCard label="နောက်ဆုံး မှတ်ထားသည်" value={list.length > 0 ? list[0].date : '—'} tone="purple" />
            </div>

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">{editingId ? 'မှတ်စု ပြင်ဆင်ရန်' : 'မှတ်စု အသစ်'}</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
                        <input value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="သင်ခန်းစာ / ခေါင်းစဉ်" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <select value={courseId} onChange={(e) => setCourseId(Number(e.target.value))} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {Object.entries(COURSE_NAMES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                    </div>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="မှတ်စု အကြောင်းအရာ ရေးရန်…" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <div className="mt-3 flex gap-2">
                        <button onClick={save} disabled={!lesson.trim() || !body.trim()} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">သိမ်းရန်</button>
                        <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ပယ်ဖျက်ရန်</button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="မှတ်စု ရှာဖွေရန်…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                </div>
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    <option value="all">သင်တန်း အားလုံး</option>
                    {Object.entries(COURSE_NAMES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {filtered.map((n) => (
                    <article key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start gap-3">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{courseName(n)}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{n.date} မှာ မှတ်ထားပါတယ်</span>
                            <span className="ml-auto flex gap-2">
                                <button onClick={() => startEdit(n)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Pencil className="size-3.5" /> ပြင်ရန်</button>
                                <button onClick={() => downloadNote(n)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download className="size-3.5" /> ဒေါင်းလုဒ်</button>
                                <button onClick={() => setList((l) => l.filter((x) => x.id !== n.id))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20"><Trash2 className="size-3.5" /> ဖျက်ရန်</button>
                            </span>
                        </div>
                        <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{n.lesson}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-500 dark:text-slate-400">{n.body}</p>
                        <Link href={`/student/courses/${n.courseId}/learn`} className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">ဒီသင်ခန်းစာကို ပြန်ကြည့်ရန် →</Link>
                    </article>
                ))}
                {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">မှတ်စု မတွေ့ပါ။</p>}
            </div>
        </LmsShell>
    );
}

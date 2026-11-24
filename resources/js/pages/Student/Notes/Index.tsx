import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { formatDate } from '@/lib/format';
import { Download, NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react';

type Note = { id: number; courseId: number | null; course?: string | null; lesson: string; body: string; date?: string | null };
type Course = { id: number; title: string };
type Props = { notes?: Note[]; courses?: Course[]; flash?: { success?: string | null } };

export default function Index({ notes = [], courses = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const [query, setQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [lesson, setLesson] = useState('');
    const [body, setBody] = useState('');
    const [courseId, setCourseId] = useState<number | ''>('');
    const [processing, setProcessing] = useState(false);

    const courseName = (n: Note) => n.course ?? courses.find((c) => c.id === n.courseId)?.title ?? 'သင်တန်း';
    const filtered = notes.filter((n) => {
        if (courseFilter !== 'all' && String(n.courseId) !== courseFilter) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return n.lesson.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    });
    const courseCount = new Set(notes.map((n) => n.courseId)).size;

    const startEdit = (n: Note) => {
        setEditingId(n.id); setLesson(n.lesson); setBody(n.body); setCourseId(n.courseId ?? ''); setShowForm(true);
    };
    const resetForm = () => {
        setLesson(''); setBody(''); setEditingId(null); setCourseId(''); setShowForm(false);
    };
    const save = () => {
        if (!lesson.trim() || !body.trim() || processing) return;
        setProcessing(true);
        const payload = { title: lesson.trim(), content: body.trim(), course_id: courseId === '' ? null : courseId };
        const opts = { onFinish: () => setProcessing(false), onSuccess: () => resetForm() };
        if (editingId) {
            router.put(`/student/notes/${editingId}`, payload, opts);
        } else {
            router.post('/student/notes', payload, opts);
        }
    };
    const remove = (id: number) => {
        if (!window.confirm('ဤမှတ်စုကို ဖျက်မှာလား?')) return;
        router.delete(`/student/notes/${id}`);
    };
    const downloadNote = (n: Note) => {
        const blob = new Blob([`${n.lesson}\n${courseName(n)} · ${formatDate(n.date)}\n\n${n.body}\n`], { type: 'text/plain;charset=utf-8' });
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
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်ခန်းစာများမှ ကိုယ်ပိုင် မှတ်စုများ</p>
                </div>
                <button onClick={() => { setShowForm((s) => !s); setEditingId(null); setLesson(''); setBody(''); setCourseId(''); }} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                    <Plus className="size-4" /> မှတ်စု အသစ်
                </button>
            </div>

            {flash?.success && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                    {flash.success}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
                <StatCard label="မှတ်စု စုစုပေါင်း" value={notes.length} tone="teal" />
                <StatCard label="သင်တန်း အရေအတွက်" value={courseCount} tone="blue" />
                <StatCard label="နောက်ဆုံး မှတ်ထားသည်" value={notes.length > 0 ? formatDate(notes[0].date) : '—'} tone="purple" />
            </div>

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">{editingId ? 'မှတ်စု ပြင်ဆင်ရန်' : 'မှတ်စု အသစ်'}</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
                        <input value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="သင်ခန်းစာ / ခေါင်းစဉ်" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <select value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            <option value="">သင်တန်း မရွေးပါ</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="မှတ်စု အကြောင်းအရာ ရေးရန်…" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <div className="mt-3 flex gap-2">
                        <button onClick={save} disabled={!lesson.trim() || !body.trim() || processing} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">သိမ်းရန်</button>
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
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {filtered.map((n) => (
                    <article key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start gap-3">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{courseName(n)}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatDate(n.date)} မှာ မှတ်ထားပါတယ်</span>
                            <span className="ml-auto flex gap-2">
                                <button onClick={() => startEdit(n)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Pencil className="size-3.5" /> ပြင်ရန်</button>
                                <button onClick={() => downloadNote(n)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download className="size-3.5" /> ဒေါင်းလုဒ်</button>
                                <button onClick={() => remove(n.id)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20"><Trash2 className="size-3.5" /> ဖျက်ရန်</button>
                            </span>
                        </div>
                        <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{n.lesson}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-500 dark:text-slate-400">{n.body}</p>
                        {n.courseId && <Link href={`/student/courses/${n.courseId}/learn`} className="mt-3 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">ဒီသင်ခန်းစာကို ပြန်ကြည့်ရန် →</Link>}
                    </article>
                ))}
                {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">မှတ်စု မတွေ့ပါ။</p>}
            </div>
        </LmsShell>
    );
}

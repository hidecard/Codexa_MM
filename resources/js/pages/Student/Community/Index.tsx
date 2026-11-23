import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bookmark, Heart, MessageCircle, PenLine, Trash2, Users } from 'lucide-react';

type Post = {
    id: number;
    name: string;
    init: string;
    col: string;
    time: string;
    cat: string;
    title: string;
    body: string;
    likes: number;
    comments: number;
    liked: boolean;
    saved: boolean;
    mine: boolean;
    status: string;
};

type Props = { posts?: Post[]; categories?: string[] };

export default function Index({ posts = [], categories = [] }: Props) {
    const cats = ['All', ...categories.filter((c) => c !== 'General')];
    const [cat, setCat] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [newCat, setNewCat] = useState(categories[0] ?? 'General');
    const [notice, setNotice] = useState('');
    // Saves have no backend model yet — local display state only.
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

    const filtered = posts.filter((p) => cat === 'All' || p.cat === cat);

    const toggleLike = (id: number) => router.post(`/student/community/${id}/like`, {}, { preserveScroll: true });
    const toggleSave = (id: number) => setSavedIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    const addPost = () => {
        if (!title.trim()) return;
        router.post('/student/community', { category: newCat, title: title.trim(), body: body.trim() || null }, {
            preserveScroll: true,
            onSuccess: () => { setTitle(''); setBody(''); setShowForm(false); setCat('All'); setNotice('ပို့စ် တင်ပြီးပါပြီ'); },
        });
    };

    const removePost = (id: number) => {
        if (confirm('ဒီ ပို့စ်ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/student/community/${id}`, { preserveScroll: true, onSuccess: () => setNotice('ပို့စ် ဖျက်ပြီးပါပြီ') });
        }
    };

    return (
        <LmsShell title="Community" nav="student">
            <Head title="Community" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Users className="size-7 text-teal-600" /> Community</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">မေးခွန်းများ မေးမြန်းခြင်း၊ အတွေ့အကြုံများ မျှဝေခြင်းနှင့် အချင်းချင်း ကူညီခြင်း</p>
                </div>
                <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                    <PenLine className="size-4" /> ပို့စ် အသစ် ရေးရန်
                </button>
            </div>

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">ဆွေးနွေးချက် အသစ်</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ခေါင်းစဉ် ရေးရန်…" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="အသေးစိတ် ရေးရန်… (မဖြစ်မနေ မဟုတ်)" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <button onClick={addPost} disabled={!title.trim()} className="mt-3 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">တင်ရန်</button>
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
                {cats.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCat(c)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {c === 'All' ? 'အားလုံး' : c}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {filtered.map((p) => {
                    const liked = p.liked;
                    const saved = savedIds.has(p.id);
                    return (
                    <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: p.col }}>{p.init}</span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.time}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{p.cat}</span>
                            {p.mine && (
                                <button onClick={() => removePost(p.id)} title="ပို့စ် ဖျက်ရန်" className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400">
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                        <Link href={`/student/community/${p.id}`}>
                            <h3 className="mt-3.5 font-extrabold leading-snug text-slate-900 hover:text-teal-700 dark:text-white">{p.title}</h3>
                        </Link>
                        {p.body && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.body}</p>}
                        <div className="mt-4 flex flex-wrap gap-2.5">
                            <button onClick={() => toggleLike(p.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${liked ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                <Heart className={`size-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} /> {p.likes}
                            </button>
                            <Link href={`/student/community/${p.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                <MessageCircle className="size-4" /> မှတ်ချက် {p.comments}
                            </Link>
                            <button onClick={() => toggleSave(p.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${saved ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                <Bookmark className={`size-4 ${saved ? 'fill-teal-600 text-teal-600' : ''}`} /> {saved ? 'သိမ်းထားပြီး' : 'သိမ်းရန်'}
                            </button>
                        </div>
                    </article>
                    );
                })}
                {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ပို့စ် မရှိသေးပါ — ပထမဆုံး ပို့စ် ရေးလိုက်ပါ။</p>}
            </div>
        </LmsShell>
    );
}

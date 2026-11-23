import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bookmark, ChevronLeft, Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react';

type Post = { id: number; name: string; init: string; col: string; time: string; cat: string; title: string; body: string; likes: number; comments: number; mine: boolean; status: string };

export default function Show({ post, categories = [] }: { post: Post; categories?: string[] }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const [cat, setCat] = useState(post.cat);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notice, setNotice] = useState('');

    const saveEdit = () => {
        if (!title.trim()) return;
        router.put(`/student/community/${post.id}`, { category: cat, title: title.trim(), body: body.trim() || null }, {
            preserveScroll: true,
            onSuccess: () => { setEditing(false); setNotice('ပို့စ် ပြင်ဆင်ပြီးပါပြီ'); },
        });
    };

    const removePost = () => {
        if (confirm('ဒီ ပို့စ်ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/student/community/${post.id}`);
        }
    };

    return (
        <LmsShell title="Community" nav="student">
            <Head title={post.title} />
            <Link href="/student/community" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Community သို့ ပြန်သွားရန်</Link>

            {notice && (
                <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: post.col }}>{post.init}</span>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{post.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{post.time}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{post.cat}</span>
                    {post.status === 'hidden' && <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">ဖျောက်ထားသည်</span>}
                    {post.mine && (
                        <div className="flex shrink-0 gap-2">
                            <button onClick={() => setEditing((v) => !v)} title="ပို့စ် ပြင်ရန်" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400">
                                <Pencil className="size-4" />
                            </button>
                            <button onClick={removePost} title="ပို့စ် ဖျက်ရန်" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400">
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
                {editing ? (
                    <div className="mt-4 grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ခေါင်းစဉ် ရေးရန်…" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="အသေးစိတ် ရေးရန်…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <div className="flex gap-2">
                            <button onClick={saveEdit} disabled={!title.trim()} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">သိမ်းရန်</button>
                            <button onClick={() => { setEditing(false); setTitle(post.title); setBody(post.body); setCat(post.cat); }} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">မလုပ်တော့ပါ</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 dark:text-white sm:text-2xl">{post.title}</h1>
                        <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{post.body}</p>
                    </>
                )}
                <div className="mt-5 flex flex-wrap gap-2.5">
                    <button onClick={() => setLiked((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${liked ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Heart className={`size-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} /> {post.likes + (liked ? 1 : 0)}
                    </button>
                    <button onClick={() => setSaved((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${saved ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Bookmark className={`size-4 ${saved ? 'fill-teal-600 text-teal-600' : ''}`} /> {saved ? 'သိမ်းထားပြီး' : 'သိမ်းရန်'}
                    </button>
                </div>
            </article>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><MessageCircle className="size-5 text-teal-600" /> မှတ်ချက်များ</h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">မှတ်ချက်ရေးသားခြင်း လုပ်ဆောင်ချက် မကြာမီ ရရှိနိုင်ပါမယ်။</p>
            </section>
        </LmsShell>
    );
}

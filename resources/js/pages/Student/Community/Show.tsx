import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bookmark, ChevronLeft, Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react';

type Post = { id: number; name: string; init: string; col: string; time: string; cat: string; title: string; body: string; likes: number; comments: number; liked: boolean; mine: boolean; status: string };

type Comment = { id: number; name: string; init: string; col: string; time: string; body: string; mine: boolean };

export default function Show({ post, comments = [], categories = [] }: { post: Post; comments?: Comment[]; categories?: string[] }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const [cat, setCat] = useState(post.cat);
    const [saved, setSaved] = useState(false);
    const [notice, setNotice] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentBody, setEditingCommentBody] = useState('');

    const toggleLike = () => router.post(`/student/community/${post.id}/like`, {}, { preserveScroll: true });

    const addComment = () => {
        if (!commentBody.trim()) return;
        router.post(`/student/community/${post.id}/comments`, { body: commentBody.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setCommentBody(''); setNotice('မှတ်ချက် ရေးပြီးပါပြီ'); },
        });
    };

    const saveCommentEdit = (id: number) => {
        if (!editingCommentBody.trim()) return;
        router.put(`/student/community/comments/${id}`, { body: editingCommentBody.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setEditingCommentId(null); setNotice('မှတ်ချက် ပြင်ဆင်ပြီးပါပြီ'); },
        });
    };

    const removeComment = (id: number) => {
        if (confirm('ဒီ မှတ်ချက်ကို ဖျက်မှာ သေချာပါသလား?')) {
            router.delete(`/student/community/comments/${id}`, { preserveScroll: true, onSuccess: () => setNotice('မှတ်ချက် ဖျက်ပြီးပါပြီ') });
        }
    };

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
                    <button onClick={toggleLike} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${post.liked ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Heart className={`size-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} /> {post.likes}
                    </button>
                    <button onClick={() => setSaved((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${saved ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Bookmark className={`size-4 ${saved ? 'fill-teal-600 text-teal-600' : ''}`} /> {saved ? 'သိမ်းထားပြီး' : 'သိမ်းရန်'}
                    </button>
                </div>
            </article>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><MessageCircle className="size-5 text-teal-600" /> မှတ်ချက်များ ({comments.length})</h2>

                <div className="mt-4 flex flex-col gap-4">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: c.col }}>{c.init}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                                    <p className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{c.time}</p>
                                    {c.mine && (
                                        <div className="ml-auto flex shrink-0 gap-1.5">
                                            <button onClick={() => { setEditingCommentId(c.id); setEditingCommentBody(c.body); }} title="မှတ်ချက် ပြင်ရန်" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400">
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button onClick={() => removeComment(c.id)} title="မှတ်ချက် ဖျက်ရန်" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400">
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingCommentId === c.id ? (
                                    <div className="mt-2 grid gap-2">
                                        <textarea value={editingCommentBody} onChange={(e) => setEditingCommentBody(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                        <div className="flex gap-2">
                                            <button onClick={() => saveCommentEdit(c.id)} disabled={!editingCommentBody.trim()} className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50">သိမ်းရန်</button>
                                            <button onClick={() => setEditingCommentId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">မလုပ်တော့ပါ</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{c.body}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">မှတ်ချက် မရှိသေးပါ — ပထမဆုံး မှတ်ချက် ရေးလိုက်ပါ။</p>}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={2} placeholder="မှတ်ချက် ရေးရန်…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <button onClick={addComment} disabled={!commentBody.trim()} className="mt-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">မှတ်ချက် ရေးရန်</button>
                </div>
            </section>
        </LmsShell>
    );
}

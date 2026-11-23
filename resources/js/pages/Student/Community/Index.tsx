import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bookmark, Heart, MessageCircle, PenLine, Users } from 'lucide-react';

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
};

type Props = { posts?: Post[] };

/* SAMPLE DATA — fallback only; no community Post model exists yet (from prototype). */
const SAMPLE_POSTS: Post[] = [
    { id: 1, name: 'Thiri Nanda', init: 'TN', col: '#6366f1', time: 'လွန်ခဲ့သော 2 နာရီ', cat: 'React', title: 'useEffect ကို ဘယ်အချိန်မှာ သုံးသင့်လဲ?', body: 'API ကနေ data ခေါ်တဲ့နေရာမှာ useEffect သုံးတာ မှန်ပေမယ့် button click လို event တွေမှာပါ လိုက်သုံးနေမိတယ်။ ဘယ်လို ခွဲခြား စဉ်းစားသင့်လဲ ဆိုတာ ဥပမာနဲ့ ရှင်းပြပေးပါဦး။', likes: 24, comments: 8, liked: false, saved: false },
    { id: 2, name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', time: 'လွန်ခဲ့သော 5 နာရီ', cat: 'Python', title: 'List နဲ့ Dict — ဘယ်အချိန် ဘာသုံးသင့်လဲ?', body: 'ကျောင်းသား အမှတ်စာရင်း သိမ်းတဲ့ exercise မှာ list of dict သုံးထားတာ အဆင်ပြေပေမယ့် ရှာရတာ နှေးနေသလို ခံစားရတယ်။ Data structure ရွေးနည်းလေး မျှဝေပေးပါ။', likes: 18, comments: 12, liked: false, saved: false },
    { id: 3, name: 'May Thandar', init: 'MT', col: '#ec4899', time: 'မနေ့က', cat: 'Career', title: 'Portfolio website လေး review လုပ်ပေးကြပါဦး', body: 'HTML & CSS သင်တန်း project အနေနဲ့ portfolio ဆောက်ပြီး GitHub Pages ပေါ် တင်ထားပါတယ်။ Layout နဲ့ color ရွေးချယ်မှုအပေါ် feedback လေး လိုချင်ပါတယ်။', likes: 42, comments: 21, liked: false, saved: false },
    { id: 4, name: 'Aung Khant Min', init: 'AK', col: '#0ea892', time: 'မနေ့က', cat: 'Web', title: 'Laravel မှာ API Resource သုံးတာ ဘာကောင်းလဲ?', body: 'Controller ထဲမှာ model ကို တိုက်ရိုက် return ပြန်တာနဲ့ Resource class သုံးတာနဲ့ ဘာကွာလဲ။ Project ကြီးလာရင် ဘယ်ဟာက ပိုကောင်းလဲ သိချင်ပါတယ်။', likes: 15, comments: 6, liked: false, saved: false },
    { id: 5, name: 'Su Myat Noe', init: 'SM', col: '#38bdf8', time: 'လွန်ခဲ့သော 2 ရက်', cat: 'Mobile', title: 'Flutter မှာ state management ဘာနဲ့ စသင့်လဲ?', body: 'setState နဲ့ စထားပေမယ့် screen တွေ များလာတော့ code က ရှုပ်လာတယ်။ Provider နဲ့ Riverpod ဘယ်ဟာကို အရင် လေ့လာသင့်လဲ အကြံပေးပါဦး။', likes: 27, comments: 14, liked: false, saved: false },
    { id: 6, name: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', time: 'လွန်ခဲ့သော 3 ရက်', cat: 'Design', title: 'Figma မှာ component variant တွေ ဘယ်လို စီမံရမလဲ?', body: 'Button component တစ်ခုတည်းမှာ size နဲ့ color variant တွေ များလာတော့ ရှုပ်လာတယ်။ Naming convention ကောင်းကောင်းလေး မျှဝေပေးကြပါ။', likes: 11, comments: 5, liked: false, saved: false },
];

const CATS = ['All', 'React', 'Python', 'Web', 'Mobile', 'Design', 'Career'];

export default function Index({ posts }: Props) {
    const [list, setList] = useState<Post[]>(posts && posts.length > 0 ? posts : SAMPLE_POSTS);
    const [cat, setCat] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [newCat, setNewCat] = useState('React');
    const [nextId, setNextId] = useState(100);

    const filtered = list.filter((p) => cat === 'All' || p.cat === cat);

    const toggleLike = (id: number) => setList((l) => l.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
    const toggleSave = (id: number) => setList((l) => l.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    const addPost = () => {
        if (!title.trim()) return;
        setList((l) => [{ id: nextId, name: 'Kaung Htet', init: 'KH', col: '#0ea892', time: 'အခုလေးတင်', cat: newCat, title: title.trim(), body: body.trim(), likes: 0, comments: 0, liked: false, saved: false }, ...l]);
        setNextId((n) => n + 1);
        setTitle(''); setBody(''); setShowForm(false); setCat('All');
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

            {showForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="font-extrabold text-slate-900 dark:text-white">ဆွေးနွေးချက် အသစ်</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ခေါင်းစဉ် ရေးရန်…" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {CATS.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="အသေးစိတ် ရေးရန်… (မဖြစ်မနေ မဟုတ်)" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <button onClick={addPost} disabled={!title.trim()} className="mt-3 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">တင်ရန်</button>
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
                {CATS.map((c) => (
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
                {filtered.map((p) => (
                    <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: p.col }}>{p.init}</span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.time}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{p.cat}</span>
                        </div>
                        <Link href={`/student/community/${p.id}`}>
                            <h3 className="mt-3.5 font-extrabold leading-snug text-slate-900 hover:text-teal-700 dark:text-white">{p.title}</h3>
                        </Link>
                        {p.body && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.body}</p>}
                        <div className="mt-4 flex flex-wrap gap-2.5">
                            <button onClick={() => toggleLike(p.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${p.liked ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                <Heart className={`size-4 ${p.liked ? 'fill-rose-500 text-rose-500' : ''}`} /> {p.likes}
                            </button>
                            <Link href={`/student/community/${p.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                <MessageCircle className="size-4" /> မှတ်ချက် {p.comments}
                            </Link>
                            <button onClick={() => toggleSave(p.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${p.saved ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                <Bookmark className={`size-4 ${p.saved ? 'fill-teal-600 text-teal-600' : ''}`} /> {p.saved ? 'သိမ်းထားပြီး' : 'သိမ်းရန်'}
                            </button>
                        </div>
                    </article>
                ))}
                {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">ဤအမျိုးအစားတွင် ပို့စ် မရှိသေးပါ။</p>}
            </div>
        </LmsShell>
    );
}

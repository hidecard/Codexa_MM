import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bookmark, ChevronLeft, Heart, MessageCircle } from 'lucide-react';

type Post = { id: number; name: string; init: string; col: string; time: string; cat: string; title: string; body: string; likes: number; comments: number };
type Comment = { n: string; init: string; col: string; time: string; text: string; likes: number };

/* SAMPLE DATA — fallback only (from prototype). */
const SAMPLE_POSTS: Post[] = [
    { id: 1, name: 'Thiri Nanda', init: 'TN', col: '#6366f1', time: 'လွန်ခဲ့သော 2 နာရီ', cat: 'React', title: 'useEffect ကို ဘယ်အချိန်မှာ သုံးသင့်လဲ?', body: 'API ကနေ data ခေါ်တဲ့နေရာမှာ useEffect သုံးတာ မှန်ပေမယ့် button click လို event တွေမှာပါ လိုက်သုံးနေမိတယ်။ ဘယ်လို ခွဲခြား စဉ်းစားသင့်လဲ ဆိုတာ ဥပမာနဲ့ ရှင်းပြပေးပါဦး။', likes: 24, comments: 8 },
    { id: 2, name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', time: 'လွန်ခဲ့သော 5 နာရီ', cat: 'Python', title: 'List နဲ့ Dict — ဘယ်အချိန် ဘာသုံးသင့်လဲ?', body: 'ကျောင်းသား အမှတ်စာရင်း သိမ်းတဲ့ exercise မှာ list of dict သုံးထားတာ အဆင်ပြေပေမယ့် ရှာရတာ နှေးနေသလို ခံစားရတယ်။ Data structure ရွေးနည်းလေး မျှဝေပေးပါ။', likes: 18, comments: 12 },
    { id: 3, name: 'May Thandar', init: 'MT', col: '#ec4899', time: 'မနေ့က', cat: 'Career', title: 'Portfolio website လေး review လုပ်ပေးကြပါဦး', body: 'HTML & CSS သင်တန်း project အနေနဲ့ portfolio ဆောက်ပြီး GitHub Pages ပေါ် တင်ထားပါတယ်။ Layout နဲ့ color ရွေးချယ်မှုအပေါ် feedback လေး လိုချင်ပါတယ်။', likes: 42, comments: 21 },
    { id: 4, name: 'Aung Khant Min', init: 'AK', col: '#0ea892', time: 'မနေ့က', cat: 'Web', title: 'Laravel မှာ API Resource သုံးတာ ဘာကောင်းလဲ?', body: 'Controller ထဲမှာ model ကို တိုက်ရိုက် return ပြန်တာနဲ့ Resource class သုံးတာနဲ့ ဘာကွာလဲ။ Project ကြီးလာရင် ဘယ်ဟာက ပိုကောင်းလဲ သိချင်ပါတယ်။', likes: 15, comments: 6 },
    { id: 5, name: 'Su Myat Noe', init: 'SM', col: '#38bdf8', time: 'လွန်ခဲ့သော 2 ရက်', cat: 'Mobile', title: 'Flutter မှာ state management ဘာနဲ့ စသင့်လဲ?', body: 'setState နဲ့ စထားပေမယ့် screen တွေ များလာတော့ code က ရှုပ်လာတယ်။ Provider နဲ့ Riverpod ဘယ်ဟာကို အရင် လေ့လာသင့်လဲ အကြံပေးပါဦး။', likes: 27, comments: 14 },
    { id: 6, name: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', time: 'လွန်ခဲ့သော 3 ရက်', cat: 'Design', title: 'Figma မှာ component variant တွေ ဘယ်လို စီမံရမလဲ?', body: 'Button component တစ်ခုတည်းမှာ size နဲ့ color variant တွေ များလာတော့ ရှုပ်လာတယ်။ Naming convention ကောင်းကောင်းလေး မျှဝေပေးကြပါ။', likes: 11, comments: 5 },
];
const SAMPLE_COMMENTS: Record<number, Comment[]> = {
    1: [
        { n: 'Kaung Htet', init: 'KH', col: '#0ea892', time: 'လွန်ခဲ့သော 1 နာရီ', text: 'ကျွန်တော်လည်း အရင်က အဲလိုပဲ သုံးမိတယ်။ Event handler ထဲမှာ ဆိုရင် function ကို တိုက်ရိုက် ခေါ်တာ ပိုရှင်းတယ်၊ side effect (API call, subscription) မျိုးမှ useEffect သုံးသင့်တယ် လို့ ဆရာက ရှင်းပြဖူးတယ်။', likes: 9 },
        { n: 'May Thazin', init: 'MT', col: '#ec4899', time: 'လွန်ခဲ့သော 45 မိနစ်', text: 'မှတ်နည်းလေးကတော့ — render လုပ်နေစဉ် တွက်လို့ရရင် effect မလိုဘူး၊ browser / ပြင်ပ system နဲ့ ချိတ်ဆက်မှ effect လိုတယ်။ ဒီနည်းနဲ့ စဉ်းစားရင် ခွဲရလွယ်သွားတယ်။', likes: 14 },
    ],
    2: [
        { n: 'Thiri Nanda', init: 'TN', col: '#6366f1', time: 'လွန်ခဲ့သော 3 နာရီ', text: 'ရှာရတာ မြန်ချင်ရင် id ကို key အဖြစ် ထားတဲ့ dict ပုံစံ ပြောင်းလိုက်ပါ။ List က အစဉ်လိုက် ပြသဖို့၊ Dict က တိုက်ရိုက် ရှာဖို့ ပိုကောင်းတယ်။', likes: 7 },
        { n: 'Kaung Htet Oo', init: 'KO', col: '#22c55e', time: 'လွန်ခဲ့သော 2 နာရီ', text: 'ဆရာ့မှတ်ချက် — အရွယ်အစား သေးရင် list လည်း လုံလောက်ပါတယ်။ Data ကြီးလာမှ structure ကို စဉ်းစားပါ၊ အစကတည်းက over-engineer မလုပ်ပါနဲ့။', likes: 11 },
    ],
    3: [
        { n: 'Su Myat Noe', init: 'SM', col: '#38bdf8', time: 'မနေ့က', text: 'Layout က သပ်ရပ်ပါတယ်။ Hero section မှာ whitespace နည်းနည်း ပိုထည့်ရင် ပိုဖတ်ရလွယ်မယ် ထင်တယ်။', likes: 6 },
        { n: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', time: 'မနေ့က', text: 'Color contrast ကောင်းတယ်။ Mobile မှာ menu ကို hamburger ပြောင်းထားတာ အဆင်ပြေတယ်၊ ဆက်ကြိုးစားပါ!', likes: 4 },
    ],
    4: [
        { n: 'Aung Khant', init: 'AK', col: '#ef4444', time: 'မနေ့က', text: 'ဆရာ့မှတ်ချက် — Resource သုံးရင် API response ပုံစံကို တစ်နေရာတည်းကနေ ထိန်းနိုင်တယ်။ Project ကြီးလာရင် field တွေ ဖျောက်တာ၊ အမည်ပြောင်းတာတွေ လွယ်သွားတယ်။', likes: 8 },
    ],
    5: [
        { n: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', time: 'လွန်ခဲ့သော 1 ရက်', text: 'ကျွန်တော်တော့ Provider နဲ့ စခဲ့တာ အဆင်ပြေတယ်။ Riverpod က type-safe ပိုဖြစ်ပေမယ့် စလေ့လာသူ အတွက် Provider က ပိုရိုးရှင်းတယ်။', likes: 5 },
    ],
};

export default function Show({ post }: { post?: Post | null }) {
    const { url } = usePage();
    const idFromUrl = Number(url.split('/').filter(Boolean).pop());
    const item = post ?? SAMPLE_POSTS.find((p) => p.id === idFromUrl) ?? SAMPLE_POSTS[0];
    const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS[item.id] ?? []);
    const [reply, setReply] = useState('');
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(item.likes);
    const [saved, setSaved] = useState(false);

    const submitReply = () => {
        if (!reply.trim()) return;
        setComments((c) => [...c, { n: 'Kaung Htet', init: 'KH', col: '#0ea892', time: 'အခုလေးတင်', text: reply.trim(), likes: 0 }]);
        setReply('');
    };

    return (
        <LmsShell title="Community" nav="student">
            <Head title={item.title} />
            <Link href="/student/community" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Community သို့ ပြန်သွားရန်</Link>

            <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: item.col }}>{item.init}</span>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{item.cat}</span>
                </div>
                <h1 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 dark:text-white sm:text-2xl">{item.title}</h1>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                    <button onClick={() => { setLiked((v) => !v); setLikes((n) => n + (liked ? -1 : 1)); }} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${liked ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Heart className={`size-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} /> {likes}
                    </button>
                    <button onClick={() => setSaved((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold ${saved ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        <Bookmark className={`size-4 ${saved ? 'fill-teal-600 text-teal-600' : ''}`} /> {saved ? 'သိမ်းထားပြီး' : 'သိမ်းရန်'}
                    </button>
                </div>
            </article>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><MessageCircle className="size-5 text-teal-600" /> မှတ်ချက်များ ({comments.length})</h2>
                <div className="mt-4 flex gap-2.5">
                    <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitReply(); }} placeholder="မှတ်ချက် ရေးရန်…" className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <button onClick={submitReply} disabled={!reply.trim()} className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">တင်ရန်</button>
                </div>
                <ul className="mt-5 space-y-4">
                    {comments.map((c, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: c.col }}>{c.init}</span>
                            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800">
                                <p className="flex flex-wrap items-center gap-2 text-sm"><span className="font-bold text-slate-900 dark:text-white">{c.n}</span><span className="text-xs text-slate-500 dark:text-slate-400">{c.time}</span></p>
                                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{c.text}</p>
                                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><Heart className="size-3.5" /> {c.likes}</p>
                            </div>
                        </li>
                    ))}
                    {comments.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">မှတ်ချက် မရှိသေးပါ — ပထမဆုံး ဖြေကြားသူဖြစ်လိုက်ပါ။</p>}
                </ul>
            </section>
        </LmsShell>
    );
}

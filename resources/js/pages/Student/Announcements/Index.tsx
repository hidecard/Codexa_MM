import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import { Megaphone, Pin } from 'lucide-react';

type Announcement = {
    id: number;
    title: string;
    content?: string | null;
    body?: string | null;
    cat?: string | null;
    category?: string | null;
    audience?: string | null;
    course?: string | { id: number; title: string; slug: string } | null;
    course_title?: string | null;
    date?: string | null;
    published_at?: string | null;
    pinned?: boolean;
    read?: boolean;
};

type Props = { announcements?: Announcement[] };

/* SAMPLE DATA — fallback only, shown when no real announcements exist (from prototype). */
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'ဒီဇင်ဘာ Live Bootcamp — စာရင်းဖွင့်ပါပြီ', body: 'ဒီဇင်ဘာ 1 ရက်ကနေ 20 ရက်အထိ Web Development Live Bootcamp ကျင်းပပါမယ်။ ဆရာ Thura Aung နဲ့ May Thazin တို့ ဦးဆောင်ပြီး project အခြေပြု သင်ကြားပါမယ်။ နေရာ အကန့်အသတ် ရှိလို့ စောစော စာရင်းပေးပါ။', cat: 'live', audience: 'ကျောင်းသား အားလုံး', date: 'နိုဝင်ဘာ 22', pinned: true, read: false },
    { id: 2, title: 'Data Science with Python သင်တန်း အသစ် မကြာမီ', body: 'တောင်းဆိုမှု များခဲ့တဲ့ Data Science with Python သင်တန်း စစ်ဆေးမှု ပြီးဆုံးနေပါပြီ။ Pandas, visualization နဲ့ machine learning အခြေခံတွေ ပါဝင်ပြီး ဒီဇင်ဘာလထဲမှာ စတင် ရရှိနိုင်ပါမယ်။', cat: 'course', audience: 'ကျောင်းသား အားလုံး', date: 'နိုဝင်ဘာ 21', pinned: false, read: false },
    { id: 3, title: 'Black Friday — သင်တန်း အားလုံး 50% အထိ လျှော့ဈေး', body: 'နိုဝင်ဘာ 28 ရက် တစ်ရက်တည်း FLASH50 coupon သုံးရင် သင်တန်း အားလုံး 50% လျှော့ဈေး ရပါမယ်။ Wishlist ထဲ သိမ်းထားတဲ့ သင်တန်းတွေ ဝယ်ဖို့ အကောင်းဆုံး အချိန်ပါ။', cat: 'promo', audience: 'ကျောင်းသား အားလုံး', date: 'နိုဝင်ဘာ 20', pinned: false, read: true },
    { id: 4, title: 'စနစ် ထိန်းသိမ်းမှု — နိုဝင်ဘာ 25 ည 11:00–11:30', body: 'Server ထိန်းသိမ်းမှုကြောင့် နိုဝင်ဘာ 25 ရက် ည 11:00 ကနေ 11:30 အထိ platform ခဏ ရပ်နားပါမယ်။ Download လုပ်ထားတဲ့ ဖိုင်တွေကိုတော့ offline ဆက် လေ့ကျင့်နိုင်ပါတယ်။', cat: 'system', audience: 'ကျောင်းသား အားလုံး', date: 'နိုဝင်ဘာ 19', pinned: false, read: true },
    { id: 5, title: 'Pro Plan အသစ် — လစဉ် 30,000 ကျပ်', body: 'Pro Plan မှာ သင်တန်း အားလုံး unlimited, Live class ဦးစားပေး နေရာနဲ့ 1-on-1 mentor session တွေ ပါဝင်ပါတယ်။ Profile page ကနေ အဆင့်မြှင့်နိုင်ပါတယ်။', cat: 'promo', audience: 'Free Plan သာ', date: 'နိုဝင်ဘာ 15', pinned: false, read: true },
];

const CAT_LABEL: Record<string, string> = { live: 'Live Class', course: 'သင်တန်း', promo: 'ပရိုမိုးရှင်း', system: 'စနစ်', general: 'အထွေထွေ' };
const CAT_STYLE: Record<string, string> = {
    live: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    course: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    promo: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    system: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    general: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function Index({ announcements }: Props) {
    const initial = announcements && announcements.length > 0 ? announcements : SAMPLE_ANNOUNCEMENTS;
    const [list, setList] = useState<Announcement[]>(initial);
    const [cat, setCat] = useState('all');
    const cats = ['all', ...Array.from(new Set(list.map((a) => a.cat ?? a.category ?? 'general')))];
    const filtered = list
        .filter((a) => cat === 'all' || (a.cat ?? a.category ?? 'general') === cat)
        .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));
    const unread = list.filter((a) => !a.read).length;

    return (
        <LmsShell title="ကြေညာချက်များ" nav="student">
            <Head title="Announcements" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><Megaphone className="size-7 text-teal-600" /> ကြေညာချက်များ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">သင်တန်း၊ Live class နှင့် platform ဆိုင်ရာ ကြေညာချက်များ{unread > 0 ? ` · မဖတ်ရသေး ${unread} ခု` : ''}</p>
                </div>
                {unread > 0 && (
                    <button onClick={() => setList((l) => l.map((a) => ({ ...a, read: true })))} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        အားလုံး ဖတ်ပြီးကြောင်း မှတ်ရန်
                    </button>
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {cats.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCat(c)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                        {c === 'all' ? 'အားလုံး' : (CAT_LABEL[c] ?? c)}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Megaphone className="size-10" />}
                    title="ကြေညာချက် မရှိသေးပါ"
                    description="ကြေညာချက် အသစ်ရှိရင် ဒီနေရာမှာ ပေါ်လာပါမယ်။"
                />
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {filtered.map((a) => {
                        const category = a.cat ?? a.category ?? 'general';
                        const body = a.body ?? a.content ?? '';
                        const when = a.date ?? formatDate(a.published_at);
                        const courseName = typeof a.course === 'string' ? a.course : a.course?.title;
                        return (
                            <article key={a.id} className={`rounded-2xl border p-5 sm:p-6 dark:border-slate-800 ${a.pinned ? 'border-teal-300 bg-teal-50/40 dark:border-teal-800 dark:bg-teal-900/10' : 'border-slate-200 bg-white dark:bg-slate-900'} ${!a.read ? 'ring-1 ring-teal-100 dark:ring-teal-900' : ''}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CAT_STYLE[category] ?? CAT_STYLE.general}`}>{CAT_LABEL[category] ?? category}</span>
                                    {a.pinned && <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-bold text-white"><Pin className="size-3" /> အဓိက</span>}
                                    {!a.read && <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">အသစ်</span>}
                                    <span className="ml-auto text-xs text-slate-400">{when}</span>
                                </div>
                                <h2 className="mt-3 text-lg font-extrabold leading-snug text-slate-900 dark:text-white">{a.title}</h2>
                                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
                                <p className="mt-3 text-xs text-slate-400">{a.course_title ?? courseName ?? a.audience ?? ''}</p>
                            </article>
                        );
                    })}
                </div>
            )}
        </LmsShell>
    );
}

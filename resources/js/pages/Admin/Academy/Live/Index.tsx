import { useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { CalendarPlus, Star, Users, Video, XCircle } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { formatNumber } from '@/lib/format';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_LIVE, type SampleLive } from '@/pages/Admin/Academy/_sample';

type LiveRow = SampleLive & { cancelled?: boolean };

export default function Index({ sessions }: { sessions?: LiveRow[] }) {
    // SAMPLE DATA fallback (prototype): no LiveSession model exists yet.
    const [items, setItems] = useState<LiveRow[]>(sessions ?? SAMPLE_LIVE);
    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('Thura Aung');
    const [day, setDay] = useState('မနက်ဖြန်');
    const [time, setTime] = useState('ညနေ 7:00 – 8:30');
    const [notice, setNotice] = useState('');

    const active = items.filter((s) => !s.cancelled);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setItems([
            { day: '—', mon: 'နိုဝင်ဘာ', when: day, title: title.trim(), instructor, time, courseTitle: '', desc: '', liveNow: false, joined: 0 },
            ...items,
        ]);
        setTitle('');
        setNotice('Session စီစဉ်ပြီးပါပြီ (ဤ page မှာသာ — backend endpoint မရှိသေးပါ)');
    };

    const toggleCancel = (titleText: string) => {
        setItems(items.map((s) => (s.title === titleText ? { ...s, cancelled: !s.cancelled } : s)));
    };

    return (
        <LmsShell title="Live Class စီမံခန့်ခွဲမှု" nav="admin">
            <Head title="Live Class စီမံခန့်ခွဲမှု" />
            <PageIntro
                eyebrow="ADMIN"
                title="Live Class စီမံခန့်ခွဲမှု"
                description="Live session အသစ် စီစဉ်ရန်၊ စာရင်းပေးထားသူ ကြည့်ရန်နဲ့ session ဖျက်သိမ်းရန်"
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="ဒီလ Session စုစုပေါင်း" value="14 ခု" icon={Video} tone="teal" />
                <StatCard label="ပျမ်းမျှ တက်ရောက်သူ" value="68 ဦး" icon={Users} tone="blue" />
                <StatCard label="မှတ်တမ်း ကြည့်ရှုမှု" value={formatNumber(2980)} sub="ကြိမ်" icon={Video} tone="purple" />
                <StatCard label="Session Rating" value="4.9 / 5" icon={Star} tone="amber" />
            </div>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <CalendarPlus className="size-5" /> Live Session အသစ် စီစဉ်ရန်
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label className={labelCls}>Session ခေါင်းစဉ်</label>
                        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className={labelCls}>သင်ကြားသူ</label>
                        <select className={inputCls} value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                            <option>Thura Aung</option>
                            <option>May Thazin</option>
                            <option>Kaung Htet Oo</option>
                            <option>Aung Khant</option>
                            <option>Su Myat Noe</option>
                            <option>Nilar Win</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>နေ့</label>
                        <select className={inputCls} value={day} onChange={(e) => setDay(e.target.value)}>
                            <option>မနက်ဖြန်</option>
                            <option>စနေ</option>
                            <option>တနင်္ဂနွေ</option>
                            <option>တနင်္လာ</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelCls}>အချိန်</label>
                        <select className={inputCls} value={time} onChange={(e) => setTime(e.target.value)}>
                            <option>ညနေ 7:00 – 8:30</option>
                            <option>ညနေ 7:30 – 8:30</option>
                            <option>မနက် 10:00 – 11:30</option>
                            <option>နေ့လယ် 2:00 – 3:30</option>
                        </select>
                    </div>
                    <div className="flex items-end sm:col-span-2">
                        <button type="submit" className={btnAccentCls}>
                            Session စီစဉ်ရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            <SectionCard title={`လာမည့် Session များ — ${active.length} ခု`}>
                {active.length === 0 ? (
                    <p className={`text-sm ${mutedCls}`}>စီစဉ်ထားသော session မရှိတော့ပါ — အပေါ်က form မှာ session အသစ် စီစဉ်နိုင်ပါတယ်</p>
                ) : (
                    <div className="space-y-3.5">
                        {items.map((s) => (
                            <LmsCard key={s.title} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${s.cancelled ? 'opacity-55' : ''}`}>
                                <div className="grid size-16 flex-none place-items-center rounded-xl bg-teal-600/10 text-center">
                                    <div>
                                        <p className={`text-lg font-extrabold leading-none ${inkCls}`}>{s.day}</p>
                                        <p className={`text-[.7rem] font-bold ${mutedCls}`}>{s.mon}</p>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{s.title}</p>
                                        {s.liveNow && <Pill tone="rose">LIVE NOW</Pill>}
                                        {s.cancelled && <Pill tone="slate">ဖျက်သိမ်းထား</Pill>}
                                    </div>
                                    <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                        {s.instructor} · {s.when} · {s.time} · စာရင်းပေးထားသူ {s.joined} ဦး
                                    </p>
                                    {s.desc && <p className={`mt-1 text-[.84rem] leading-relaxed ${mutedCls}`}>{s.desc}</p>}
                                </div>
                                <button type="button" className={`${btnGhostCls} flex-none`} onClick={() => toggleCancel(s.title)}>
                                    <XCircle className="size-4" /> {s.cancelled ? 'ပြန်ဖွင့်ရန်' : 'ဖျက်သိမ်းရန်'}
                                </button>
                            </LmsCard>
                        ))}
                    </div>
                )}
            </SectionCard>
        </LmsShell>
    );
}

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Hand, Mic, MonitorUp, Play, Radio, Send, Square, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Avatar, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type SessionRow = {
    id: number;
    title: string;
    desc: string;
    scheduled_at: string | null;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    instructor: string;
    courseTitle: string;
    when: string;
    time: string;
    liveNow: boolean;
    joined: number;
};

type Props = { sessions?: SessionRow[] };

const ATTENDEES = [
    { name: 'Kaung Htet', init: 'KH', col: '#0ea892', hand: false },
    { name: 'May Thandar', init: 'MT', col: '#ec4899', hand: true },
    { name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', hand: false },
    { name: 'Thiri Nanda', init: 'TN', col: '#6366f1', hand: true },
    { name: 'Aung Min Khant', init: 'AM', col: '#38bdf8', hand: false },
];

const CHAT_SEED = [
    { name: 'May Thandar', text: 'ဆရာ အသံ ကောင်းပါတယ်၊ စလို့ ရပါပြီ', time: '6:58 PM' },
    { name: 'Kaung Htet', text: 'useEffect အခန်းကို စောင့်နေတာ ကြာပြီ', time: '6:59 PM' },
];

export default function Index({ sessions = [] }: Props) {
    const defaultSession = sessions.find((s) => s.status === 'live') ?? sessions[0] ?? null;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const session = sessions.find((s) => s.id === selectedId) ?? defaultSession;

    const [recording, setRecording] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [chat, setChat] = useState(CHAT_SEED);
    const [msg, setMsg] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const raised = ATTENDEES.filter((a) => a.hand);

    const live = session?.status === 'live';

    const send = () => {
        const text = msg.trim();
        if (!text) return;
        setChat([...chat, { name: 'သင် (Host)', text, time: 'ယခု' }]);
        setMsg('');
    };

    const start = () => {
        if (!session) return;
        setError('');
        router.post(
            `/instructor/live-host/${session.id}/start`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice('အတန်း စတင်ပါပြီ — ကျောင်းသားတွေ ဝင်ရောက်နိုင်ပါပြီ'),
                onError: (errs) => setError(Object.values(errs)[0] as string),
            },
        );
    };

    const end = () => {
        if (!session) return;
        setError('');
        router.post(
            `/instructor/live-host/${session.id}/end`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice('အတန်း ပြီးဆုံးပါပြီ'),
                onError: (errs) => setError(Object.values(errs)[0] as string),
            },
        );
    };

    return (
        <LmsShell title="Live Class Host View" nav="instructor">
            <Head title="Live Class Host View" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="Live Class Host View"
                description={session ? `${session.title} · ${session.when} ${session.time} · ${session.instructor} သင်ကြားမည်` : 'မိမိ၏ live session များကို ဒီကနေ စတင်/ပြီးဆုံးနိုင်ပါတယ်'}
                actions={
                    <Link href="/student/live-classes" className={btnGhostCls}>
                        Live Classes သို့
                    </Link>
                }
            />

            {notice && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {notice}
                </div>
            )}
            {error && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
                </div>
            )}

            {!session ? (
                <div className="mt-6">
                    <EmptyBox title="Live session မရှိသေးပါ" description="စီစဉ်ထားသော session မရှိသေးပါ — admin က session စီစဉ်ပေးပါမယ်" />
                </div>
            ) : (
                <>
                    {sessions.length > 1 && (
                        <div className="mt-6 max-w-md">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#97a6c6]">Host လုပ်မည့် session</label>
                            <select className={inputCls} value={session.id} onChange={(e) => setSelectedId(Number(e.target.value))}>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title} — {s.when} {s.time}
                                        {s.status === 'live' ? ' (LIVE)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                        <div className="min-w-0 space-y-5 xl:col-span-2">
                            <LmsCard className="overflow-hidden">
                                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center">
                                    {live ? (
                                        <>
                                            <span className="flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white">
                                                <Radio className="size-3.5 animate-pulse" /> LIVE · ကြည့်ရှုသူ {session.joined} ဦး
                                            </span>
                                            <p className="text-lg font-extrabold text-white">{session.title}</p>
                                            <p className="text-sm text-slate-300">အတန်း လုပ်ဆောင်နေပါတယ် — ကျောင်းသားတွေ ဝင်ရောက်ကြည့်ရှုနေပါတယ်</p>
                                            {recording && <Pill tone="rose">အသံဖမ်းနေပါတယ်</Pill>}
                                            {sharing && <Pill tone="blue">စခရင် မျှဝေနေပါတယ်</Pill>}
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-xs font-extrabold text-slate-200">
                                                <Users className="size-3.5" /> ကြည့်ရှုသူ 0 ဦး
                                            </span>
                                            <p className="text-lg font-extrabold text-white">အတန်း မစတင်ရသေးပါ</p>
                                            <p className="max-w-md text-sm text-slate-300">
                                                စတင်ရန် ခလုတ်နှိပ်ရင် ကျောင်းသားတွေ ချက်ချင်း ဝင်ရောက်နိုင်ပါမယ်။
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2.5 p-4">
                                    {live ? (
                                        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700" onClick={end}>
                                            <Square className="size-4" /> အတန်း ပြီးဆုံးရန်
                                        </button>
                                    ) : (
                                        <button type="button" className={btnAccentCls} onClick={start}>
                                            <Play className="size-4" /> အတန်း စတင်ရန်
                                        </button>
                                    )}
                                    <button type="button" className={btnGhostCls} onClick={() => setSharing(!sharing)} disabled={!live}>
                                        <MonitorUp className="size-4" /> {sharing ? 'မျှဝေမှု ရပ်ရန်' : 'စခရင် မျှဝေရန်'}
                                    </button>
                                    <button type="button" className={btnGhostCls} onClick={() => setRecording(!recording)} disabled={!live}>
                                        <Mic className="size-4" /> {recording ? 'အသံဖမ်းမှု ရပ်ရန်' : 'အသံဖမ်းရန်'}
                                    </button>
                                </div>
                            </LmsCard>

                            <SectionCard title={`လက်ထောင်ထားသူများ (Raise Hand) — ${raised.length} ဦး`}>
                                {raised.length === 0 ? (
                                    <p className={`text-sm ${mutedCls}`}>လက်ထောင်ထားသူ မရှိသေးပါ။</p>
                                ) : (
                                    <div className="space-y-2">
                                        {raised.map((a) => (
                                            <div key={a.name} className="flex items-center gap-3">
                                                <Avatar init={a.init} color={a.col} size="sm" />
                                                <span className={`flex-1 text-sm font-bold ${inkCls}`}>{a.name}</span>
                                                <Hand className="size-4 text-amber-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>

                        <div className="min-w-0 space-y-5">
                            <SectionCard title={`တက်ရောက်သူ စာရင်း — ${ATTENDEES.length} ဦး`}>
                                <div className="space-y-2.5">
                                    {ATTENDEES.map((a) => (
                                        <div key={a.name} className="flex items-center gap-3">
                                            <Avatar init={a.init} color={a.col} size="sm" />
                                            <span className={`flex-1 text-sm font-bold ${inkCls}`}>{a.name}</span>
                                            {a.hand && <Hand className="size-4 text-amber-500" />}
                                        </div>
                                    ))}
                                </div>
                                <p className={`mt-3 text-[.78rem] ${mutedCls}`}>စာရင်းပေးထားသူ စုစုပေါင်း {session.joined} ဦး</p>
                            </SectionCard>

                            <SectionCard title="Live Chat">
                                <div className="max-h-64 space-y-3 overflow-y-auto">
                                    {chat.map((m, i) => (
                                        <div key={i}>
                                            <p className={`text-[.78rem] font-bold ${inkCls}`}>
                                                {m.name} <span className={`font-semibold ${mutedCls}`}>{m.time}</span>
                                            </p>
                                            <p className={`mt-0.5 text-[.86rem] leading-relaxed ${mutedCls}`}>{m.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                        placeholder="စာတို ရေးရန်…"
                                        value={msg}
                                        onChange={(e) => setMsg(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') send();
                                        }}
                                    />
                                    <button type="button" className={btnAccentCls} onClick={send}>
                                        <Send className="size-4" /> ပို့ရန်
                                    </button>
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                </>
            )}
        </LmsShell>
    );
}

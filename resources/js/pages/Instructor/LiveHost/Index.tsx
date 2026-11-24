import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Hand, Mic, MonitorUp, Play, Radio, Send, Square, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Avatar, EmptyBox, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { getJson, postJson } from '@/lib/csrf';

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

type RoomAttendee = { user_id: number; name: string; initials: string; color: string; hand_raised: boolean; joined_at: string | null };
type RoomMessage = { id: number; user_id: number; name: string; message: string; time: string; is_host: boolean; is_mine: boolean };
type RaisedHand = { id: number; user_id: number; name: string; status: string; raised_at: string };
type RoomState = {
    attendees: RoomAttendee[];
    chat: RoomMessage[];
    raised_hands: RaisedHand[];
    attendance_count: number;
    joined: boolean;
    my_hand_raised: boolean;
};

export default function Index({ sessions = [] }: Props) {
    const defaultSession = sessions.find((s) => s.status === 'live') ?? sessions[0] ?? null;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const session = sessions.find((s) => s.id === selectedId) ?? defaultSession;

    const [recording, setRecording] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [room, setRoom] = useState<RoomState | null>(null);
    const [msg, setMsg] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    const live = session?.status === 'live';
    const sessionId = session?.id ?? null;

    const fetchRoom = useCallback(async () => {
        if (!sessionId) return;
        try {
            const res = await getJson(`/instructor/live-host/${sessionId}/room`);
            if (!res.ok) return;
            setRoom((await res.json()) as RoomState);
        } catch {
            // Polling is best-effort; a failed refresh keeps the last state.
        }
    }, [sessionId]);

    // Poll room state while the selected session is live.
    useEffect(() => {
        setRoom(null);
        if (!live) return;
        fetchRoom();
        const timer = setInterval(fetchRoom, 5000);
        return () => clearInterval(timer);
    }, [live, fetchRoom]);

    // Keep the chat scrolled to the latest message.
    useEffect(() => {
        const el = chatBoxRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [room?.chat.length]);

    const send = async () => {
        const text = msg.trim();
        if (!text || !sessionId || !live) return;
        try {
            const res = await postJson(`/instructor/live-host/${sessionId}/chat`, { message: text });
            if (!res.ok) {
                setError('Chat ပို့ခြင်း မအောင်မြင်ပါ');
                return;
            }
            setMsg('');
            fetchRoom();
        } catch {
            setError('Chat ပို့ခြင်း မအောင်မြင်ပါ');
        }
    };

    const lowerHand = async (handId: number) => {
        if (!sessionId) return;
        try {
            await postJson(`/instructor/live-host/${sessionId}/raise-hands/${handId}/lower`);
            fetchRoom();
        } catch {
            setError('လက်ချခြင်း မအောင်မြင်ပါ');
        }
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
                                                <Radio className="size-3.5 animate-pulse" /> LIVE · ကြည့်ရှုသူ {room?.attendance_count ?? session.joined} ဦး
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

                            <SectionCard title={`လက်ထောင်ထားသူများ (Raise Hand) — ${room?.raised_hands.length ?? 0} ဦး`}>
                                {!live ? (
                                    <p className={`text-sm ${mutedCls}`}>အတန်း မစတင်ရသေးပါ — live ဖြစ်နေမှ ကျောင်းသားတွေ လက်ထောင်နိုင်ပါတယ်။</p>
                                ) : (room?.raised_hands ?? []).length === 0 ? (
                                    <p className={`text-sm ${mutedCls}`}>လက်ထောင်ထားသူ မရှိသေးပါ။</p>
                                ) : (
                                    <div className="space-y-2">
                                        {room!.raised_hands.map((h) => (
                                            <div key={h.id} className="flex items-center gap-3">
                                                <Avatar init={h.name.slice(0, 2).toUpperCase()} color="#f59e0b" size="sm" />
                                                <span className={`flex-1 text-sm font-bold ${inkCls}`}>{h.name}</span>
                                                <span className={`text-[.76rem] font-semibold ${mutedCls}`}>{h.raised_at}</span>
                                                <Hand className="size-4 text-amber-500" />
                                                <button type="button" className={btnGhostCls} onClick={() => lowerHand(h.id)}>
                                                    လက်ချရန်
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>

                        <div className="min-w-0 space-y-5">
                            <SectionCard title={`တက်ရောက်သူ စာရင်း — ${room?.attendance_count ?? 0} ဦး`}>
                                {!live ? (
                                    <p className={`text-sm ${mutedCls}`}>အတန်း မစတင်ရသေးပါ — စတင်မှ တက်ရောက်သူ စာရင်း ပေါ်လာပါမယ်။</p>
                                ) : (room?.attendees ?? []).length === 0 ? (
                                    <p className={`text-sm ${mutedCls}`}>တက်ရောက်သူ မရှိသေးပါ။</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {room!.attendees.map((a) => (
                                            <div key={a.user_id} className="flex items-center gap-3">
                                                <Avatar init={a.initials} color={a.color} size="sm" />
                                                <span className={`flex-1 text-sm font-bold ${inkCls}`}>{a.name}</span>
                                                {a.hand_raised && <Hand className="size-4 text-amber-500" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className={`mt-3 text-[.78rem] ${mutedCls}`}>ပါဝင်ဖူးသူ စုစုပေါင်း {session.joined} ဦး</p>
                            </SectionCard>

                            <SectionCard title="Live Chat">
                                <div ref={chatBoxRef} className="max-h-64 space-y-3 overflow-y-auto">
                                    {(room?.chat ?? []).length === 0 ? (
                                        <p className={`text-sm ${mutedCls}`}>{live ? 'Chat မရှိသေးပါ — ပထမဆုံး စာတို ပို့နိုင်ပါတယ်။' : 'အတန်း မစတင်ရသေးပါ — live ဖြစ်မှ chat သုံးနိုင်ပါတယ်။'}</p>
                                    ) : (
                                        room!.chat.map((m) => (
                                            <div key={m.id}>
                                                <p className={`text-[.78rem] font-bold ${inkCls}`}>
                                                    {m.name}
                                                    {m.is_host && <span className="ml-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">HOST</span>}
                                                    <span className={`ml-1.5 font-semibold ${mutedCls}`}>{m.time}</span>
                                                </p>
                                                <p className={`mt-0.5 text-[.86rem] leading-relaxed ${mutedCls}`}>{m.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[#1e2c52] dark:bg-[#070d1f] dark:text-[#e9eefb]"
                                        placeholder="စာတို ရေးရန်…"
                                        value={msg}
                                        disabled={!live}
                                        onChange={(e) => setMsg(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') send();
                                        }}
                                    />
                                    <button type="button" className={btnAccentCls} onClick={send} disabled={!live}>
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { Bell, CalendarDays, ChevronLeft, Clock3, Eye, Hand, PlayCircle, Radio, Send, User, Users } from 'lucide-react';
import { getJson, jsonHeaders, postJson } from '@/lib/csrf';

type LiveClass = {
    id: number;
    day: string;
    mon: string;
    when: string;
    title: string;
    instructor: string;
    time: string;
    courseTitle: string;
    desc: string;
    liveNow: boolean;
    joined: number;
};

type Recording = { id: number; live_session_id: number; title: string; video_url: string; duration: string; dur: string; views: number; date: string };

type RoomAttendee = { user_id: number; name: string; initials: string; color: string; hand_raised: boolean; joined_at: string | null };
type RoomMessage = { id: number; user_id: number; name: string; message: string; time: string; is_host: boolean; is_mine: boolean };
type RoomState = {
    attendees: RoomAttendee[];
    chat: RoomMessage[];
    raised_hands: { id: number; user_id: number; name: string; raised_at: string }[];
    attendance_count: number;
    joined: boolean;
    my_hand_raised: boolean;
};

const AGENDA = [
    { time: '7:00', item: 'အတန်း စတင်ခြင်း နှင့် မိတ်ဆက်ခြင်း' },
    { time: '7:10', item: 'အဓိက အကြောင်းအရာ live coding ဖြင့် ရှင်းပြခြင်း' },
    { time: '8:00', item: 'လက်တွေ့ ဥပမာ နှင့် လေ့ကျင့်ခန်း' },
    { time: '8:20', item: 'မေးခွန်း ဖြေကြားခြင်း (Q&A)' },
];

export default function Show({ live, recordings = [] }: { live?: LiveClass | null; recordings?: Recording[] }) {
    const [reminded, setReminded] = useState(false);
    const [joined, setJoined] = useState(false);
    const [room, setRoom] = useState<RoomState | null>(null);
    const [chatMsg, setChatMsg] = useState('');
    const [roomError, setRoomError] = useState('');
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    const liveId = live?.id ?? null;
    const isLive = live?.liveNow ?? false;

    const fetchRoom = useCallback(async () => {
        if (!liveId) return;
        try {
            const res = await getJson(`/student/live-classes/${liveId}/room`);
            if (!res.ok) return;
            const data = (await res.json()) as RoomState;
            setRoom(data);
            setJoined(data.joined);
        } catch {
            // Polling is best-effort; a failed refresh keeps the last state.
        }
    }, [liveId]);

    // Poll room state while inside a live class.
    useEffect(() => {
        if (!isLive || !joined) return;
        fetchRoom();
        const timer = setInterval(fetchRoom, 5000);
        return () => clearInterval(timer);
    }, [isLive, joined, fetchRoom]);

    // Best-effort leave on page close (the server also closes open
    // attendance rows when the session ends).
    useEffect(() => {
        if (!joined || !liveId) return;
        const onUnload = () => {
            try {
                void fetch(`/student/live-classes/${liveId}/leave`, {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: '{}',
                    keepalive: true,
                });
            } catch {
                // Ignore — attendance is closed when the session ends.
            }
        };
        window.addEventListener('beforeunload', onUnload);
        return () => window.removeEventListener('beforeunload', onUnload);
    }, [joined, liveId]);

    // Keep the chat scrolled to the latest message.
    useEffect(() => {
        const el = chatBoxRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [room?.chat.length]);

    const joinClass = async () => {
        if (!liveId) return;
        setRoomError('');
        try {
            const res = await postJson(`/student/live-classes/${liveId}/join`);
            const data = (await res.json().catch(() => ({}))) as { message?: string };
            if (!res.ok) {
                setRoomError(data.message ?? 'အတန်း ဝင်ခြင်း မအောင်မြင်ပါ');
                return;
            }
            setJoined(true);
            fetchRoom();
        } catch {
            setRoomError('အတန်း ဝင်ခြင်း မအောင်မြင်ပါ');
        }
    };

    const leaveClass = async () => {
        if (!liveId) return;
        try {
            await postJson(`/student/live-classes/${liveId}/leave`);
        } catch {
            // Ignore — attendance is closed when the session ends.
        }
        setJoined(false);
        setRoom(null);
    };

    const sendChat = async () => {
        const text = chatMsg.trim();
        if (!text || !liveId) return;
        try {
            const res = await postJson(`/student/live-classes/${liveId}/chat`, { message: text });
            if (!res.ok) {
                setRoomError('Chat ပို့ခြင်း မအောင်မြင်ပါ');
                return;
            }
            setChatMsg('');
            fetchRoom();
        } catch {
            setRoomError('Chat ပို့ခြင်း မအောင်မြင်ပါ');
        }
    };

    const toggleHand = async () => {
        if (!liveId) return;
        const action = room?.my_hand_raised ? 'lower-hand' : 'raise-hand';
        try {
            await postJson(`/student/live-classes/${liveId}/${action}`);
            fetchRoom();
        } catch {
            setRoomError('လက်ထောင်ခြင်း မအောင်မြင်ပါ');
        }
    };

    // Fire-and-forget view count; the video opens in a new tab.
    const trackView = (r: Recording) => {
        postJson(`/student/live-classes/${r.live_session_id}/recordings/${r.id}/view`).catch(() => {});
    };

    if (!live) {
        return (
            <LmsShell title="Live Class" nav="student">
                <Head title="Live Class" />
                <Link href="/student/live-classes" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Live Classes အားလုံး</Link>
                <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">ဤ live class ကို ရှာမတွေ့ပါ။</p>
            </LmsShell>
        );
    }

    const item = live;

    return (
        <LmsShell title="Live Class" nav="student">
            <Head title={item.title} />
            <Link href="/student/live-classes" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"><ChevronLeft className="size-4" /> Live Classes အားလုံး</Link>

            <div className="mt-4 rounded-3xl bg-slate-950 p-6 text-white dark:bg-slate-800 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                    {item.liveNow && <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold"><Radio className="size-3" /> ယခု LIVE လွှင့်နေသည်</span>}
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{item.courseTitle}</span>
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{item.desc}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5"><User className="size-4" /> {item.instructor}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {item.mon} {item.day} · {item.when}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {item.time}</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {item.joined} ယောက် ပါဝင်မည်</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    {item.liveNow ? (
                        joined ? (
                            <button onClick={leaveClass} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50">
                                <Radio className="size-4" /> အတန်းထဲ ရောက်ရှိနေပါပြီ — ထွက်ရန်
                            </button>
                        ) : (
                            <button onClick={joinClass} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700">
                                <Radio className="size-4" /> အတန်း ဝင်ရန်
                            </button>
                        )
                    ) : (
                        <button onClick={() => setReminded((r) => !r)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500">
                            <Bell className="size-4" /> {reminded ? 'သတိပေးချက် ထားပြီးပါပြီ ✓' : 'သတိပေးချက် ထားရန်'}
                        </button>
                    )}
                    <Link href="/student/schedule" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">အချိန်ဇယားတွင် ကြည့်ရန်</Link>
                </div>
                {reminded && !item.liveNow && <p className="mt-3 text-sm text-teal-300">အတန်း မစခင် 30 မိနစ် အလို သတိပေးပါမည်။</p>}
                {roomError && <p className="mt-3 text-sm font-semibold text-rose-300">{roomError}</p>}
                {item.liveNow && joined && room && <p className="mt-3 text-sm text-slate-300">ယခု {room.attendance_count} ယောက် ပါဝင်နေပါတယ်</p>}
            </div>

            {item.liveNow && joined && (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Live Chat</h2>
                        <div ref={chatBoxRef} className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {(room?.chat ?? []).length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">Chat မရှိသေးပါ — ပထမဆုံး စာတို ပို့နိုင်ပါတယ်။</p>
                            ) : (
                                room!.chat.map((m) => (
                                    <div key={m.id}>
                                        <p className="text-[.78rem] font-bold text-slate-900 dark:text-white">
                                            {m.name}
                                            {m.is_host && <span className="ml-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">HOST</span>}
                                            <span className="ml-1.5 font-semibold text-slate-400">{m.time}</span>
                                        </p>
                                        <p className="mt-0.5 text-[.86rem] leading-relaxed text-slate-600 dark:text-slate-300">{m.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <input
                                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                placeholder="စာတို ရေးရန်…"
                                value={chatMsg}
                                onChange={(e) => setChatMsg(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') sendChat();
                                }}
                            />
                            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500" onClick={sendChat}>
                                <Send className="size-4" /> ပို့ရန်
                            </button>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">တက်ရောက်သူများ — {room?.attendance_count ?? 0} ဦး</h2>
                            <button
                                type="button"
                                onClick={toggleHand}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${room?.my_hand_raised ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                            >
                                <Hand className="size-4" /> {room?.my_hand_raised ? 'လက်ချရန်' : 'လက်ထောင်ရန်'}
                            </button>
                        </div>
                        <div className="mt-4 space-y-2.5">
                            {(room?.attendees ?? []).length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">တက်ရောက်သူ မရှိသေးပါ။</p>
                            ) : (
                                room!.attendees.map((a) => (
                                    <div key={a.user_id} className="flex items-center gap-3">
                                        <span className="grid size-8 flex-none place-items-center rounded-full text-xs font-extrabold text-white" style={{ backgroundColor: a.color }}>
                                            {a.initials}
                                        </span>
                                        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-white">{a.name}</span>
                                        {a.hand_raised && <Hand className="size-4 text-amber-500" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">အတန်း အစီအစဉ်</h2>
                    <ul className="mt-4 space-y-3">
                        {AGENDA.map((a) => (
                            <li key={a.time} className="flex gap-4 text-sm">
                                <span className="w-12 shrink-0 font-extrabold text-teal-600">{a.time}</span>
                                <span className="text-slate-700 dark:text-slate-200">{a.item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">ပြင်ဆင်ထားရန်</h2>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <li>အတန်း မစခင် သက်ဆိုင်ရာ သင်ခန်းစာကို အရင် ကြည့်ထားပါ။</li>
                        <li>မေးခွန်း ရှိပါက အတန်း အတွင်း chat မှ မေးမြန်းနိုင်ပါသည်။</li>
                        <li>Live ပြီးနောက် မှတ်တမ်း video ကို ဤစာမျက်နှာတွင် ပြန်ကြည့်နိုင်ပါမည်။</li>
                        <li>အင်တာနက် လိုင်းကောင်းသော နေရာမှ ဝင်ရောက်ပါ။</li>
                    </ul>
                </div>
            </div>

            {recordings.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                        <PlayCircle className="size-5 text-teal-600" /> အတန်း မှတ်တမ်းများ
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {recordings.map((r) => (
                            <div key={r.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                <a href={r.video_url} target="_blank" rel="noreferrer" onClick={() => trackView(r)} className="grid aspect-video place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800">
                                    <PlayCircle className="size-10 opacity-80" />
                                </a>
                                <h3 className="mt-3 font-extrabold leading-snug text-slate-900 dark:text-white">{r.title}</h3>
                                <p className="mt-1 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {r.dur || '—'}</span>
                                    <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {r.views.toLocaleString()} ကြည့်ရှုမှု</span>
                                    <span>{r.date}</span>
                                </p>
                                <a href={r.video_url} target="_blank" rel="noreferrer" onClick={() => trackView(r)} className="mt-2 inline-block text-sm font-bold text-teal-600 hover:text-teal-700">
                                    မှတ်တမ်း ကြည့်ရန် →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </LmsShell>
    );
}

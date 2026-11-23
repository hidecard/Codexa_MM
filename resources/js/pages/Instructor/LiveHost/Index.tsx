import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Hand, Mic, MonitorUp, Play, Radio, Send, Square, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { SectionCard } from '@/components/lms/section-card';
import { Avatar, LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { SAMPLE_LIVE } from '@/pages/Admin/Academy/_sample';

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

export default function Index() {
    const session = SAMPLE_LIVE[0];
    const [live, setLive] = useState(false);
    const [recording, setRecording] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [chat, setChat] = useState(CHAT_SEED);
    const [msg, setMsg] = useState('');
    const raised = ATTENDEES.filter((a) => a.hand);

    const send = () => {
        const text = msg.trim();
        if (!text) return;
        setChat([...chat, { name: 'သင် (Host)', text, time: 'ယခု' }]);
        setMsg('');
    };

    return (
        <LmsShell title="Live Class Host View" nav="instructor">
            <Head title="Live Class Host View" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="Live Class Host View"
                description={`${session.title} · ${session.when} ${session.time} · ${session.instructor} သင်ကြားမည်`}
                actions={
                    <Link href="/student/live-classes" className={btnGhostCls}>
                        Live Classes သို့
                    </Link>
                }
            />

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
                                <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700" onClick={() => setLive(false)}>
                                    <Square className="size-4" /> အတန်း ပြီးဆုံးရန်
                                </button>
                            ) : (
                                <button type="button" className={btnAccentCls} onClick={() => setLive(true)}>
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
        </LmsShell>
    );
}

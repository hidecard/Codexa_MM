import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CalendarPlus, Pencil, Play, Square, Trash2, Users, Video, XCircle } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { SectionCard } from '@/components/lms/section-card';
import { LmsCard, PageIntro, Pill, btnAccentCls, btnGhostCls, inkCls, inputCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type SessionRow = {
    id: number;
    course_id: number | null;
    instructor_id: number;
    title: string;
    description: string | null;
    desc: string;
    scheduled_at: string | null;
    duration_minutes: number;
    meeting_url: string | null;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    max_participants: number | null;
    instructor: string;
    courseTitle: string;
    day: string;
    mon: string;
    when: string;
    time: string;
    liveNow: boolean;
    joined: number;
};

type RecordingRow = {
    id: number;
    live_session_id: number;
    title: string;
    video_url: string;
    duration: string;
    dur: string;
    views: number;
    session_title: string;
    instructor: string;
    date: string;
    course: number;
};

type Props = {
    sessions?: SessionRow[];
    instructors?: { id: number; name: string }[];
    courses?: { id: number; title: string }[];
    recordings?: RecordingRow[];
    stats?: { total: number; upcoming: number; live: number; ended: number };
};

const STATUS_PILL: Record<SessionRow['status'], { tone: 'teal' | 'rose' | 'slate' | 'amber'; label: string }> = {
    scheduled: { tone: 'teal', label: 'စီစဉ်ထား' },
    live: { tone: 'rose', label: 'LIVE NOW' },
    ended: { tone: 'slate', label: 'ပြီးဆုံးပြီး' },
    cancelled: { tone: 'amber', label: 'ဖျက်သိမ်းထား' },
};

function toLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Index({ sessions = [], instructors = [], courses = [], recordings = [], stats = { total: 0, upcoming: 0, live: 0, ended: 0 } }: Props) {
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingRecordingId, setEditingRecordingId] = useState<number | null>(null);
    const form = useForm({
        title: '',
        instructor_id: '',
        course_id: '',
        scheduled_at: '',
        duration_minutes: 60,
        meeting_url: '',
        max_participants: '',
        description: '',
    });
    const recForm = useForm({
        live_session_id: '',
        title: '',
        video_url: '',
        duration: '',
    });

    const active = sessions.filter((s) => s.status !== 'cancelled');

    const startEdit = (s: SessionRow) => {
        setEditingId(s.id);
        form.setData({
            title: s.title,
            instructor_id: String(s.instructor_id),
            course_id: s.course_id ? String(s.course_id) : '',
            scheduled_at: toLocalInput(s.scheduled_at),
            duration_minutes: s.duration_minutes,
            meeting_url: s.meeting_url ?? '',
            max_participants: s.max_participants ? String(s.max_participants) : '',
            description: s.description ?? '',
        });
        setNotice('');
        setError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        form.transform((data) => ({
            title: data.title,
            instructor_id: Number(data.instructor_id),
            course_id: data.course_id === '' ? null : Number(data.course_id),
            scheduled_at: data.scheduled_at,
            duration_minutes: Number(data.duration_minutes),
            meeting_url: data.meeting_url === '' ? null : data.meeting_url,
            max_participants: data.max_participants === '' ? null : Number(data.max_participants),
            description: data.description === '' ? null : data.description,
        }));
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setNotice(editingId ? 'Session ပြင်ဆင်ပြီးပါပြီ' : 'Session စီစဉ်ပြီးပါပြီ');
                setEditingId(null);
                form.reset();
            },
            onError: () => setError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အချက်အလက်များ စစ်ဆေးပါ'),
        };
        if (editingId) {
            form.put(`/admin/academy/live-classes/${editingId}`, opts);
        } else {
            form.post('/admin/academy/live-classes', opts);
        }
    };

    const act = (s: SessionRow, action: 'start' | 'end' | 'cancel' | 'restore', label: string) => {
        router.post(
            `/admin/academy/live-classes/${s.id}/${action}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setNotice(`"${s.title}" — ${label}`),
                onError: (errs) => setError(Object.values(errs)[0] as string),
            },
        );
    };

    const remove = (s: SessionRow) => {
        router.delete(`/admin/academy/live-classes/${s.id}`, {
            preserveScroll: true,
            onSuccess: () => setNotice(`"${s.title}" ဖျက်ပြီးပါပြီ`),
        });
    };

    const startRecordingEdit = (r: RecordingRow) => {
        setEditingRecordingId(r.id);
        recForm.setData({
            live_session_id: String(r.live_session_id),
            title: r.title,
            video_url: r.video_url,
            duration: r.duration,
        });
        setNotice('');
        setError('');
    };

    const cancelRecordingEdit = () => {
        setEditingRecordingId(null);
        recForm.reset();
    };

    const submitRecording = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setNotice(editingRecordingId ? 'မှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ' : 'မှတ်တမ်း ထည့်ပြီးပါပြီ');
                setEditingRecordingId(null);
                recForm.reset();
            },
            onError: () => setError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အချက်အလက်များ စစ်ဆေးပါ'),
        };
        recForm.transform((data) => ({
            live_session_id: Number(data.live_session_id),
            title: data.title,
            video_url: data.video_url,
            duration: data.duration === '' ? null : data.duration,
        }));
        if (editingRecordingId) {
            recForm.put(`/admin/academy/live-classes/recordings/${editingRecordingId}`, opts);
        } else {
            recForm.post('/admin/academy/live-classes/recordings', opts);
        }
    };

    const removeRecording = (r: RecordingRow) => {
        router.delete(`/admin/academy/live-classes/recordings/${r.id}`, {
            preserveScroll: true,
            onSuccess: () => setNotice(`"${r.title}" မှတ်တမ်း ဖျက်ပြီးပါပြီ`),
        });
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
            {error && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
                <StatCard label="Session စုစုပေါင်း" value={`${stats.total} ခု`} icon={Video} tone="teal" />
                <StatCard label="လာမည့် Session" value={`${stats.upcoming} ခု`} icon={CalendarPlus} tone="blue" />
                <StatCard label="တိုက်ရိုက် ထုတ်လွှင့်နေဆဲ" value={`${stats.live} ခု`} icon={Users} tone="rose" />
                <StatCard label="ပြီးဆုံးပြီး Session" value={`${stats.ended} ခု`} icon={Video} tone="purple" />
            </div>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`flex items-center gap-2 text-[1.05rem] font-extrabold ${inkCls}`}>
                    <CalendarPlus className="size-5" /> {editingId ? 'Live Session ပြင်ဆင်ရန်' : 'Live Session အသစ် စီစဉ်ရန်'}
                </h2>
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label className={labelCls}>Session ခေါင်းစဉ်</label>
                        <input className={inputCls} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                        {form.errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.title}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>သင်ကြားသူ</label>
                        <select className={inputCls} value={form.data.instructor_id} onChange={(e) => form.setData('instructor_id', e.target.value)} required>
                            <option value="">ရွေးချယ်ပါ</option>
                            {instructors.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.instructor_id && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.instructor_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>သင်တန်း (မရွေးချယ်လည်း ရသည်)</label>
                        <select className={inputCls} value={form.data.course_id} onChange={(e) => form.setData('course_id', e.target.value)}>
                            <option value="">—</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>စတင်မည့် ရက်/အချိန်</label>
                        <input className={inputCls} type="datetime-local" value={form.data.scheduled_at} onChange={(e) => form.setData('scheduled_at', e.target.value)} required />
                        {form.errors.scheduled_at && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.scheduled_at}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>ကြာချိန် (မိနစ်)</label>
                        <select className={inputCls} value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', Number(e.target.value))}>
                            <option value={30}>30 မိနစ်</option>
                            <option value={60}>60 မိနစ်</option>
                            <option value={90}>90 မိနစ်</option>
                            <option value={120}>120 မိနစ်</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>အများဆုံး ပါဝင်သူ (မရှိပါက လွတ်ထားပါ)</label>
                        <input className={inputCls} type="number" min={1} value={form.data.max_participants} onChange={(e) => form.setData('max_participants', e.target.value)} placeholder="ဥပမာ 100" />
                    </div>
                    <div>
                        <label className={labelCls}>Meeting Link (Zoom / Meet)</label>
                        <input className={inputCls} type="url" value={form.data.meeting_url} onChange={(e) => form.setData('meeting_url', e.target.value)} placeholder="https://…" />
                        {form.errors.meeting_url && <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.meeting_url}</p>}
                    </div>
                    <div className="sm:col-span-4">
                        <label className={labelCls}>ဖော်ပြချက်</label>
                        <input className={inputCls} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Session အကြောင်း အကျဉ်းချုပ်" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2.5 sm:col-span-4">
                        <button type="submit" className={btnAccentCls} disabled={form.processing}>
                            {editingId ? 'ပြင်ဆင်မှု သိမ်းရန်' : 'Session စီစဉ်ရန်'}
                        </button>
                        {editingId && (
                            <button type="button" className={btnGhostCls} onClick={cancelEdit}>
                                ပြင်ဆင်မှု ပယ်ဖျက်ရန်
                            </button>
                        )}
                    </div>
                </form>
            </LmsCard>

            <SectionCard title={`Session များ — ${active.length} ခု`}>
                {sessions.length === 0 ? (
                    <p className={`text-sm ${mutedCls}`}>စီစဉ်ထားသော session မရှိသေးပါ — အပေါ်က form မှာ session အသစ် စီစဉ်နိုင်ပါတယ်</p>
                ) : (
                    <div className="space-y-3.5">
                        {sessions.map((s) => (
                            <LmsCard key={s.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${s.status === 'cancelled' ? 'opacity-55' : ''}`}>
                                <div className="grid size-16 flex-none place-items-center rounded-xl bg-teal-600/10 text-center">
                                    <div>
                                        <p className={`text-lg font-extrabold leading-none ${inkCls}`}>{s.day}</p>
                                        <p className={`text-[.7rem] font-bold ${mutedCls}`}>{s.mon}</p>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-[.95rem] font-extrabold leading-snug ${inkCls}`}>{s.title}</p>
                                        <Pill tone={STATUS_PILL[s.status].tone}>{STATUS_PILL[s.status].label}</Pill>
                                    </div>
                                    <p className={`mt-1 text-[.8rem] ${mutedCls}`}>
                                        {s.instructor} · {s.when} · {s.time}
                                        {s.courseTitle ? ` · ${s.courseTitle}` : ''}
                                        {s.max_participants ? ` · အများဆုံး ${s.max_participants} ဦး` : ''}
                                    </p>
                                    {s.desc && <p className={`mt-1 text-[.84rem] leading-relaxed ${mutedCls}`}>{s.desc}</p>}
                                    {s.meeting_url && (
                                        <a href={s.meeting_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[.8rem] font-bold text-teal-700 hover:underline dark:text-teal-300">
                                            Meeting link ဖွင့်ရန် →
                                        </a>
                                    )}
                                </div>
                                <div className="flex flex-none flex-wrap items-center gap-2">
                                    {s.status === 'scheduled' && (
                                        <button type="button" className={btnAccentCls} onClick={() => act(s, 'start', 'စတင်ပါပြီ')}>
                                            <Play className="size-4" /> စတင်ရန်
                                        </button>
                                    )}
                                    {s.status === 'live' && (
                                        <button type="button" className={btnAccentCls} onClick={() => act(s, 'end', 'ပြီးဆုံးပါပြီ')}>
                                            <Square className="size-4" /> ပြီးဆုံးရန်
                                        </button>
                                    )}
                                    {s.status === 'cancelled' ? (
                                        <button type="button" className={btnGhostCls} onClick={() => act(s, 'restore', 'ပြန်ဖွင့်ပြီးပါပြီ')}>
                                            ပြန်ဖွင့်ရန်
                                        </button>
                                    ) : (
                                        s.status !== 'ended' && (
                                            <button type="button" className={btnGhostCls} onClick={() => act(s, 'cancel', 'ဖျက်သိမ်းပြီးပါပြီ')}>
                                                <XCircle className="size-4" /> ဖျက်သိမ်းရန်
                                            </button>
                                        )
                                    )}
                                    <button type="button" className={btnGhostCls} onClick={() => startEdit(s)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                    <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(s)} title="ဖျက်ရန်">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </LmsCard>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title={`Session မှတ်တမ်းများ (Recordings) — ${recordings.length} ခု`}>
                <form onSubmit={submitRecording} className="grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label className={labelCls}>Session</label>
                        <select className={inputCls} value={recForm.data.live_session_id} onChange={(e) => recForm.setData('live_session_id', e.target.value)} required>
                            <option value="">ရွေးချယ်ပါ</option>
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title} — {s.when} {s.time}
                                </option>
                            ))}
                        </select>
                        {recForm.errors.live_session_id && <p className="mt-1 text-xs font-semibold text-rose-600">{recForm.errors.live_session_id}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelCls}>မှတ်တမ်း ခေါင်းစဉ်</label>
                        <input className={inputCls} value={recForm.data.title} onChange={(e) => recForm.setData('title', e.target.value)} placeholder="ဥပမာ React Hooks Live — မှတ်တမ်း" required />
                        {recForm.errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{recForm.errors.title}</p>}
                    </div>
                    <div className="sm:col-span-3">
                        <label className={labelCls}>Video URL (YouTube / Zoom / Drive)</label>
                        <input className={inputCls} type="url" value={recForm.data.video_url} onChange={(e) => recForm.setData('video_url', e.target.value)} placeholder="https://…" required />
                        {recForm.errors.video_url && <p className="mt-1 text-xs font-semibold text-rose-600">{recForm.errors.video_url}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>ကြာချိန် (ဥပမာ 1:24:00)</label>
                        <input className={inputCls} value={recForm.data.duration} onChange={(e) => recForm.setData('duration', e.target.value)} placeholder="1:24:00" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2.5 sm:col-span-4">
                        <button type="submit" className={btnAccentCls} disabled={recForm.processing}>
                            <Video className="size-4" /> {editingRecordingId ? 'မှတ်တမ်း ပြင်ဆင်မှု သိမ်းရန်' : 'မှတ်တမ်း ထည့်ရန်'}
                        </button>
                        {editingRecordingId && (
                            <button type="button" className={btnGhostCls} onClick={cancelRecordingEdit}>
                                ပြင်ဆင်မှု ပယ်ဖျက်ရန်
                            </button>
                        )}
                    </div>
                </form>

                {recordings.length === 0 ? (
                    <p className={`mt-4 text-sm ${mutedCls}`}>မှတ်တမ်း မရှိသေးပါ — အပေါ်က form မှာ session အတွက် video URL ထည့်နိုင်ပါတယ်။</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {recordings.map((r) => (
                            <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center dark:border-[#18264a]">
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[.92rem] font-extrabold ${inkCls}`}>{r.title}</p>
                                    <p className={`mt-0.5 text-[.8rem] ${mutedCls}`}>
                                        {r.session_title} · {r.instructor} · {r.date}
                                        {r.dur ? ` · ${r.dur}` : ''} · ကြည့်ရှုမှု {r.views.toLocaleString()} ကြိမ်
                                    </p>
                                    <a href={r.video_url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-[.8rem] font-bold text-teal-700 hover:underline dark:text-teal-300">
                                        Video ဖွင့်ရန် →
                                    </a>
                                </div>
                                <div className="flex flex-none items-center gap-2">
                                    <button type="button" className={btnGhostCls} onClick={() => startRecordingEdit(r)}>
                                        <Pencil className="size-4" /> ပြင်ရန်
                                    </button>
                                    <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => removeRecording(r)} title="ဖျက်ရန်">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </LmsShell>
    );
}

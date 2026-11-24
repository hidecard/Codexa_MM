import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { ChevronLeft, MessageCircle, Plus, Search, Send } from 'lucide-react';

type Msg = { from: 'me' | 'them'; text: string; time: string };
type Thread = { id: number; name: string; role: string; init: string; col: string; unread: number; time: string; msgs: Msg[] };
type Contact = { id: number; name: string; role: string; init: string; col: string; hasThread: boolean };
type Props = { threads: Thread[]; contacts: Contact[] };

export default function Index({ threads, contacts }: Props) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [input, setInput] = useState('');
    const [showContacts, setShowContacts] = useState(false);
    const active = threads.find((t) => t.id === activeId) ?? null;
    const unreadTotal = threads.reduce((s, t) => s + t.unread, 0);
    const filtered = threads.filter((t) => !query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase()));
    const newContacts = contacts.filter((c) => !c.hasThread);

    const openThread = (id: number) => {
        setActiveId(id);
        setShowContacts(false);
        const thread = threads.find((t) => t.id === id);
        if (thread && thread.unread > 0) {
            router.post(`/student/messages/${id}/read`, {}, { preserveScroll: true });
        }
    };
    const send = () => {
        if (!input.trim() || !active) return;
        router.post('/student/messages', { recipient_id: active.id, body: input.trim() }, { preserveScroll: true });
        setInput('');
    };
    const startThread = (contact: Contact) => {
        setActiveId(contact.id);
        setShowContacts(false);
    };

    const threadList = (
        <div className="flex h-full flex-col">
            <div className="relative p-3">
                <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ရှာဖွေရန်…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
            <div className="px-3 pb-2">
                <button onClick={() => setShowContacts((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Plus className="size-4" /> စာအသစ် ပို့ရန်
                </button>
            </div>
            {showContacts && (
                <div className="border-b border-slate-200 px-3 pb-3 dark:border-slate-800">
                    {newContacts.length === 0 ? (
                        <p className="py-2 text-xs text-slate-500 dark:text-slate-400">စာပို့နိုင်သူ အားလုံးနဲ့ စကားပြောခန်း ရှိပြီးပါပြီ။</p>
                    ) : (
                        newContacts.map((c) => (
                            <button key={c.id} onClick={() => startThread(c)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white" style={{ background: c.col }}>{c.init}</span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{c.role}</span>
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">မက်ဆေ့ချ် မရှိသေးပါ။</p>
                )}
                {filtered.map((t) => {
                    const last = t.msgs[t.msgs.length - 1];
                    return (
                        <button key={t.id} onClick={() => openThread(t.id)} className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${t.id === activeId ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                            <span className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: t.col }}>{t.init}</span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.name}</span>
                                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">{t.time}</span>
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{last ? last.text : ''}</span>
                            </span>
                            {t.unread > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose-600 text-[11px] font-bold text-white">{t.unread}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // A contact picked from "စာအသစ်" has no thread yet — show an empty composer.
    const pendingContact = !active && activeId !== null ? contacts.find((c) => c.id === activeId) ?? null : null;

    return (
        <LmsShell title="မက်ဆေ့ချ်များ" nav="student">
            <Head title="Messages" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"><MessageCircle className="size-7 text-teal-600" /> မက်ဆေ့ချ်များ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဆရာ/ဆရာမများနှင့် Support အဖွဲ့နှင့် စကားပြောရန်{unreadTotal > 0 ? ` · မဖတ်ရသေး ${unreadTotal} စောင်` : ''}</p>
                </div>
                <Link href="/student/help" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">အကူအညီ ရယူရန်</Link>
            </div>

            <div className="mt-6 grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[340px_1fr]" style={{ height: '640px' }}>
                <div className={`${active || pendingContact ? 'hidden lg:block' : 'block'} border-r border-slate-200 dark:border-slate-800`}>{threadList}</div>
                <div className={`${active || pendingContact ? 'flex' : 'hidden lg:flex'} flex-col`}>
                    {active ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                                <button onClick={() => setActiveId(null)} className="grid size-8 place-items-center rounded-lg border border-slate-200 lg:hidden dark:border-slate-700"><ChevronLeft className="size-4" /></button>
                                <span className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: active.col }}>{active.init}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-extrabold text-slate-900 dark:text-white">{active.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{active.role}</p>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-800/40">
                                {active.msgs.map((m, i) => (
                                    <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${m.from === 'me' ? 'ml-auto rounded-br-sm bg-teal-600 text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'}`}>
                                        <p>{m.text}</p>
                                        <p className={`mt-1 text-[11px] ${m.from === 'me' ? 'text-right text-teal-100' : 'text-slate-400'}`}>{m.time}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2.5 border-t border-slate-200 p-3.5 dark:border-slate-800">
                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="မက်ဆေ့ချ် ရေးရန်…" className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                <button onClick={send} disabled={!input.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"><Send className="size-4" /> ပို့ရန်</button>
                            </div>
                        </>
                    ) : pendingContact ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                                <button onClick={() => setActiveId(null)} className="grid size-8 place-items-center rounded-lg border border-slate-200 lg:hidden dark:border-slate-700"><ChevronLeft className="size-4" /></button>
                                <span className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: pendingContact.col }}>{pendingContact.init}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-extrabold text-slate-900 dark:text-white">{pendingContact.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{pendingContact.role}</p>
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                                <MessageCircle className="size-12 text-slate-300" />
                                <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">{pendingContact.name} နှင့် စကားပြောခန်း အသစ်</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">အောက်မှာ ပထမဆုံး မက်ဆေ့ချ် ရေးပြီး ပို့နိုင်ပါသည်။</p>
                            </div>
                            <div className="flex gap-2.5 border-t border-slate-200 p-3.5 dark:border-slate-800">
                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { router.post('/student/messages', { recipient_id: pendingContact.id, body: input.trim() }, { preserveScroll: true }); setInput(''); } }} placeholder="မက်ဆေ့ချ် ရေးရန်…" className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                <button onClick={() => { if (!input.trim()) return; router.post('/student/messages', { recipient_id: pendingContact.id, body: input.trim() }, { preserveScroll: true }); setInput(''); }} disabled={!input.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"><Send className="size-4" /> ပို့ရန်</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                            <MessageCircle className="size-12 text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">စကားပြောခန်း ရွေးချယ်ပါ</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ဘယ်ဘက်မှ စကားပြောခန်း တစ်ခုကို နှိပ်ပြီး စာပို့နိုင်ပါသည်။</p>
                        </div>
                    )}
                </div>
            </div>
        </LmsShell>
    );
}

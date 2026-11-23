import { useState, type FormEvent } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { BadgeCheck, BookOpen, Star, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';
import { ME_INSTRUCTOR, mySampleCourses } from '@/pages/Admin/Academy/_sample';

type AuthUser = { id: number; name: string; email: string; roles: string[] };

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Profile() {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;
    const user = auth?.user;
    const name = user?.name ?? ME_INSTRUCTOR;
    const mine = mySampleCourses();
    const students = mine.reduce((s, c) => s + c.students, 0);
    const avg = mine.length ? mine.reduce((s, c) => s + c.rating, 0) / mine.length : 0;

    const [bio, setBio] = useState('Full-stack developer နဲ့ သင်တန်းဆရာ။ React, JavaScript နဲ့ Web Development ကို မြန်မာဘာသာနဲ့ လွယ်ကူရှင်းလင်းစွာ သင်ကြားပေးနေတာ ၆ နှစ်ကျော် ရှိပါပြီ။');
    const [title, setTitle] = useState('Senior Frontend Developer & Instructor');
    const [saved, setSaved] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // No profile update endpoint exists for instructors yet — local only.
        setSaved(true);
    };

    return (
        <LmsShell title="Instructor Profile" nav="instructor">
            <Head title="Instructor Profile" />
            <PageIntro
                eyebrow="INSTRUCTOR"
                title="Instructor Profile"
                description="ကျောင်းသားတွေ မြင်ရမယ့် သင့် profile အချက်အလက်များ"
                actions={
                    <Link href="/instructors" className={btnGhostCls}>
                        Public Instructor Page ကြည့်ရန်
                    </Link>
                }
            />

            <LmsCard className="mt-6 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar init={initials(name)} color="#0ea892" size="lg" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className={`text-xl font-extrabold ${inkCls}`}>{name}</h2>
                            <BadgeCheck className="size-5 text-teal-600" />
                        </div>
                        <p className={`mt-0.5 text-sm ${mutedCls}`}>{title}</p>
                        <p className={`mt-0.5 text-sm ${mutedCls}`}>{user?.email ?? ''}</p>
                    </div>
                </div>
                <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
                    <StatCard label="သင်တန်း" value={String(mine.length)} sub="Published သင်တန်းများ" icon={BookOpen} tone="purple" />
                    <StatCard label="ကျောင်းသား စုစုပေါင်း" value={students.toLocaleString()} sub="စာရင်းသွင်းထားသူ" icon={Users} tone="blue" />
                    <StatCard label="ပျမ်းမျှ Rating" value={avg.toFixed(1)} sub={`Review ${mine.reduce((s, c) => s + c.reviews, 0).toLocaleString()} ခု`} icon={Star} tone="amber" />
                </div>
            </LmsCard>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>Profile ပြင်ဆင်ရန်</h2>
                {saved && (
                    <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                        သိမ်းပြီးပါပြီ (ဤ page မှာသာ — profile update endpoint မရှိသေးပါ)
                    </div>
                )}
                <form onSubmit={submit} className="mt-4 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="အမည်" value={name} readOnly />
                        <Input label="Email" value={user?.email ?? ''} readOnly />
                    </div>
                    <Input label="ရာထူး / ခေါင်းစဉ်" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <div>
                        <label className={labelCls}>ကိုယ်ရေးအကျဉ်း (Bio)</label>
                        <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                    <div>
                        <button type="submit" className={btnAccentCls}>
                            Profile သိမ်းရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>သင်ကြားတဲ့ သင်တန်းများ</h2>
                <ul className="mt-3 space-y-2">
                    {mine.map((c) => (
                        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <Link href={`/instructor/courses/${c.id}/edit`} className={`font-bold hover:underline ${inkCls}`}>
                                {c.title}
                            </Link>
                            <span className={mutedCls}>
                                ကျောင်းသား {c.students.toLocaleString()} ဦး · Rating {c.rating}
                            </span>
                        </li>
                    ))}
                </ul>
            </LmsCard>
        </LmsShell>
    );
}

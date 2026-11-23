import { type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, BookOpen, Star, Users } from 'lucide-react';
import { LmsShell } from '@/components/shared/lms-shell';
import { StatCard } from '@/components/lms/stat-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, LmsCard, PageIntro, btnAccentCls, btnGhostCls, inkCls, labelCls, mutedCls } from '@/pages/Admin/Academy/_shared';

type ProfileUser = { id: number; name: string; email: string };
type ProfileData = { bio?: string | null; phone?: string | null; address?: string | null };
type Stats = { courses: number; students: number; avgRating: number; reviewCount: number };
type TaughtCourse = { id: number; title: string; students: number; rating: number | null };

type Props = {
    user?: ProfileUser;
    profile?: ProfileData;
    stats?: Stats;
    courses?: TaughtCourse[];
    flash?: { success?: string | null };
};

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Profile({ user, profile, stats, courses = [] }: Props) {
    const { flash } = usePage<Props>().props;
    const name = user?.name ?? '';
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name ?? '',
        bio: profile?.bio ?? '',
        phone: profile?.phone ?? '',
        address: profile?.address ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/instructor/profile');
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

            {flash?.success && (
                <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                    {flash.success}
                </div>
            )}

            <LmsCard className="mt-6 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar init={initials(name)} color="#0ea892" size="lg" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className={`text-xl font-extrabold ${inkCls}`}>{name}</h2>
                            <BadgeCheck className="size-5 text-teal-600" />
                        </div>
                        <p className={`mt-0.5 text-sm ${mutedCls}`}>{user?.email ?? ''}</p>
                    </div>
                </div>
                <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
                    <StatCard label="သင်တန်း" value={String(stats?.courses ?? 0)} sub="Published သင်တန်းများ" icon={BookOpen} tone="purple" />
                    <StatCard label="ကျောင်းသား စုစုပေါင်း" value={(stats?.students ?? 0).toLocaleString()} sub="စာရင်းသွင်းထားသူ" icon={Users} tone="blue" />
                    <StatCard label="ပျမ်းမျှ Rating" value={(stats?.avgRating ?? 0).toFixed(1)} sub={`Review ${(stats?.reviewCount ?? 0).toLocaleString()} ခု`} icon={Star} tone="amber" />
                </div>
            </LmsCard>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>Profile ပြင်ဆင်ရန်</h2>
                <form onSubmit={submit} className="mt-4 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <Input label="အမည်" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                        </div>
                        <Input label="Email" value={user?.email ?? ''} readOnly />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <Input label="ဖုန်းနံပါတ်" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                        </div>
                        <div>
                            <Input label="လိပ်စာ" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                            {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>ကိုယ်ရေးအကျဉ်း (Bio)</label>
                        <Textarea rows={4} value={data.bio} onChange={(e) => setData('bio', e.target.value)} />
                        {errors.bio && <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>}
                    </div>
                    <div>
                        <button type="submit" className={btnAccentCls} disabled={processing}>
                            Profile သိမ်းရန်
                        </button>
                    </div>
                </form>
            </LmsCard>

            <LmsCard className="mt-6 p-5 sm:p-6">
                <h2 className={`text-lg font-extrabold ${inkCls}`}>သင်ကြားတဲ့ သင်တန်းများ</h2>
                {courses.length === 0 ? (
                    <p className={`mt-3 text-sm ${mutedCls}`}>သင်တန်း မရှိသေးပါ။</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {courses.map((c) => (
                            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <Link href={`/instructor/courses/${c.id}/edit`} className={`font-bold hover:underline ${inkCls}`}>
                                    {c.title}
                                </Link>
                                <span className={mutedCls}>
                                    ကျောင်းသား {c.students.toLocaleString()} ဦး{c.rating !== null ? ` · Rating ${c.rating}` : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </LmsCard>
        </LmsShell>
    );
}

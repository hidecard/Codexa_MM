import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { LmsShell } from '@/components/shared/lms-shell';
import { CourseCard } from '@/components/lms/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart, ShoppingCart } from 'lucide-react';

type WishlistCourse = {
    id: number;
    slug: string;
    title: string;
    category?: string | null;
    instructor?: string | null;
    price?: number | null;
    oldPrice?: number | null;
    rating?: number | null;
    students?: number | null;
    level?: string | null;
    image?: string | null;
};

type Props = { courses?: WishlistCourse[] };

/* SAMPLE DATA — fallback only; no Wishlist model exists yet (from prototype saved courses). */
const SAMPLE_WISHLIST: WishlistCourse[] = [
    { id: 1, slug: 'html-css-foundations', title: 'HTML & CSS Foundations', category: 'Web Development', instructor: 'Thura Aung', price: 45000, oldPrice: 90000, rating: 4.9, students: 2340, level: 'Beginner' },
    { id: 4, slug: 'react-complete-course', title: 'React.js Complete Course', category: 'Web Development', instructor: 'Thura Aung', price: 95000, oldPrice: 180000, rating: 4.8, students: 1640, level: 'Intermediate' },
    { id: 3, slug: 'python-for-beginners', title: 'Python for Beginners', category: 'Programming', instructor: 'Kaung Htet Oo', price: 50000, oldPrice: 100000, rating: 4.9, students: 3120, level: 'Beginner' },
    { id: 8, slug: 'mysql-database-design', title: 'MySQL & Database Design', category: 'Backend', instructor: 'Aung Khant', price: 35000, oldPrice: 70000, rating: 4.7, students: 890, level: 'Beginner' },
];

export default function Wishlist({ courses }: Props) {
    const initial = courses && courses.length > 0 ? courses : SAMPLE_WISHLIST;
    const [saved, setSaved] = useState<WishlistCourse[]>(initial);
    const [cart, setCart] = useState<number[]>([]);

    const remove = (id: number) => setSaved((s) => s.filter((c) => c.id !== id));
    const addToCart = (id: number) => setCart((c) => (c.includes(id) ? c : [...c, id]));

    return (
        <LmsShell title="သိမ်းထားသော သင်တန်းများ" nav="student">
            <Head title="Wishlist" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">သိမ်းထားသော သင်တန်းများ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">နောက်မှ ဝယ်ယူရန် သိမ်းထားသော သင်တန်း {saved.length} ခု</p>
                </div>
                {cart.length > 0 && (
                    <Link href="/student/cart" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                        <ShoppingCart className="size-4" /> ခြင်းတောင်း ({cart.length})
                    </Link>
                )}
            </div>

            {saved.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    icon={<Heart className="size-10" />}
                    title="သိမ်းထားသော သင်တန်း မရှိပါ"
                    description="စိတ်ဝင်စားသော သင်တန်းကို နှလုံးသား ခလုတ်နှိပ်၍ သိမ်းထားနိုင်ပါသည်။"
                    action={<Link href="/courses" className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700">သင်တန်းများ ရှာဖွေရန်</Link>}
                />
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {saved.map((c) => (
                        <div key={c.id} className="relative">
                            <CourseCard course={{ id: c.id, slug: c.slug, title: c.title, category: c.category ?? undefined, instructor: c.instructor ?? undefined, price: c.price ?? undefined, oldPrice: c.oldPrice ?? undefined, rating: c.rating ?? undefined, students: c.students ?? undefined, level: c.level ?? undefined }} />
                            <div className="mt-2 flex gap-2">
                                <button onClick={() => addToCart(c.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60" disabled={cart.includes(c.id)}>
                                    <ShoppingCart className="size-4" /> {cart.includes(c.id) ? 'ခြင်းတောင်းထဲ ရောက်ပြီးပါပြီ' : 'ခြင်းတောင်းထဲ ထည့်ရန်'}
                                </button>
                                <button onClick={() => remove(c.id)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-rose-900/20">
                                    ဖယ်ရှားရန်
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </LmsShell>
    );
}

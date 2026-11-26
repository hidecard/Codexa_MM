export function formatCount(n: number): string {
    return n.toLocaleString('en-US');
}

export function initials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export type LmsCourse = {
    id: number;
    slug: string;
    title: string;
    category?: string;
    instructor?: string;
    price?: number;
    oldPrice?: number;
    rating?: number;
    students?: number;
    level?: string;
    image?: string;
    progress?: number;
};

export type ApiCourse = {
    id: number;
    slug: string;
    title: string;
    short_description?: string | null;
    level?: string | null;
    price?: string | number | null;
    sale_price?: string | number | null;
    thumbnail?: string | null;
    category?: { name?: string } | null;
    instructor?: { name?: string } | null;
    instructors?: { name?: string }[] | null;
};

export function mapApiCourse(course: ApiCourse): LmsCourse {
    const price = course.sale_price ?? course.price;
    const oldPrice = course.sale_price != null && course.price != null ? Number(course.price) : undefined;
    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        category: course.category?.name ?? undefined,
        instructor: course.instructor?.name ?? course.instructors?.[0]?.name ?? undefined,
        price: price != null ? Number(price) : undefined,
        oldPrice,
        level: course.level ?? undefined,
        image: course.thumbnail ?? undefined,
    };
}

const CATEGORY_GRADIENTS: Record<string, { glyph: string; grad: string }> = {
    'Web Development': { glyph: '</>', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)' },
    'Programming': { glyph: 'Py', grad: 'linear-gradient(130deg,#14532d,#22c55e)' },
    'Backend': { glyph: '{;}', grad: 'linear-gradient(130deg,#312e81,#6366f1)' },
    'Mobile': { glyph: 'Fl', grad: 'linear-gradient(130deg,#123a6d,#38bdf8)' },
    'Design': { glyph: 'UX', grad: 'linear-gradient(130deg,#831843,#ec4899)' },
    'Tools': { glyph: 'Git', grad: 'linear-gradient(130deg,#3f3f46,#a1a1aa)' },
};

export function categoryMeta(name?: string | null): { glyph: string; grad: string } {
    return (name && CATEGORY_GRADIENTS[name]) || { glyph: '</>', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)' };
}

const INSTRUCTOR_GRADIENTS: Record<string, { role: string; bio: string; grad: string }> = {
    'Thura Aung': { role: 'Web Development Instructor', bio: 'Frontend development အတွေ့အကြုံ 8 နှစ်ကျော်ရှိပြီး HTML/CSS ကနေ React အထိ လက်တွေ့ project-based သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#0b3b5e,#0ea892)' },
    'May Thazin': { role: 'JavaScript & Node.js Instructor', bio: 'Full-stack developer အဖြစ် startup တွေမှာ လုပ်ကိုင်ခဲ့ပြီး JavaScript ကို နက်နက်နဲနဲ ရှင်းပြရာမှာ အားသာပါတယ်။', grad: 'linear-gradient(135deg,#7c2d12,#f59e0b)' },
    'Kaung Htet Oo': { role: 'Programming Instructor', bio: 'Programming အခြေခံကို စတင်သူတွေ နားလည်လွယ်အောင် ဥပမာများများနဲ့ စိတ်ရှည်စွာ သင်ကြားပေးပါတယ်။', grad: 'linear-gradient(135deg,#14532d,#22c55e)' },
    'Aung Khant': { role: 'Backend Instructor', bio: 'PHP, Laravel နဲ့ database design ပိုင်းမှာ လက်တွေ့ စနစ်ကြီးတွေ တည်ဆောက်ခဲ့တဲ့ အတွေ့အကြုံကို မျှဝေပါတယ်။', grad: 'linear-gradient(135deg,#7f1d1d,#ef4444)' },
    'Su Myat Noe': { role: 'Mobile Development Instructor', bio: 'Flutter ဖြင့် app များစွာကို Play Store / App Store ပေါ် တင်ခဲ့ပြီး cross-platform development ကို သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#123a6d,#38bdf8)' },
    'Nilar Win': { role: 'UI/UX Design Instructor', bio: 'Product designer အဖြစ် 6 နှစ်ကျော် လုပ်ကိုင်ခဲ့ပြီး Figma နဲ့ design system တည်ဆောက်နည်းကို သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#831843,#ec4899)' },
};

export function instructorInfo(name?: string | null): { role: string; bio: string; grad: string } {
    return (name && INSTRUCTOR_GRADIENTS[name]) || { role: 'Instructor', bio: 'Codexa MM instructor တစ်ဦးဖြစ်ပါတယ်။', grad: 'linear-gradient(135deg,#0ea892,#2563eb)' };
}
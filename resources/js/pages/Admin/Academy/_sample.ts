/**
 * SAMPLE DATA — clearly-marked fallback from the prototype (~/workspace/your_files/codexa-mm-lms).
 * Pages use real Inertia props when the backend supplies them and fall back to
 * these arrays otherwise, so every page renders with no props (per CONTRACT).
 * TODO: replace with real data as backend endpoints land.
 */

export type SampleCourse = {
    id: number;
    title: string;
    cat: string;
    level: string;
    lessons: number;
    hours: number;
    rating: number;
    reviews: number;
    students: number;
    price: number;
    instructor: string;
    status: 'published' | 'draft' | 'review';
};

export const SAMPLE_COURSES: SampleCourse[] = [
    { id: 1, title: 'HTML & CSS Foundations', cat: 'Web Development', level: 'Beginner', lessons: 48, hours: 12, rating: 4.9, reviews: 812, students: 2340, price: 45000, instructor: 'Thura Aung', status: 'published' },
    { id: 2, title: 'JavaScript Deep Dive', cat: 'Web Development', level: 'Intermediate', lessons: 86, hours: 24, rating: 4.8, reviews: 654, students: 1985, price: 75000, instructor: 'May Thazin', status: 'published' },
    { id: 3, title: 'Python for Beginners', cat: 'Programming', level: 'Beginner', lessons: 64, hours: 18, rating: 4.9, reviews: 903, students: 3120, price: 50000, instructor: 'Kaung Htet Oo', status: 'published' },
    { id: 4, title: 'React.js Complete Course', cat: 'Web Development', level: 'Intermediate', lessons: 92, hours: 28, rating: 4.8, reviews: 521, students: 1640, price: 95000, instructor: 'Thura Aung', status: 'published' },
    { id: 5, title: 'Node.js API Development', cat: 'Backend', level: 'Intermediate', lessons: 72, hours: 20, rating: 4.7, reviews: 402, students: 1280, price: 80000, instructor: 'Aung Khant', status: 'published' },
    { id: 6, title: 'Flutter Mobile Development', cat: 'Mobile', level: 'Intermediate', lessons: 78, hours: 22, rating: 4.8, reviews: 389, students: 1120, price: 90000, instructor: 'Su Myat Noe', status: 'published' },
    { id: 7, title: 'UI/UX Design with Figma', cat: 'Design', level: 'Beginner', lessons: 54, hours: 14, rating: 4.9, reviews: 445, students: 1540, price: 40000, instructor: 'Nilar Win', status: 'published' },
    { id: 8, title: 'PHP & Laravel Framework', cat: 'Backend', level: 'Intermediate', lessons: 88, hours: 26, rating: 4.8, reviews: 376, students: 980, price: 85000, instructor: 'Aung Khant', status: 'published' },
    { id: 9, title: 'MySQL & Database Design', cat: 'Backend', level: 'Beginner', lessons: 42, hours: 10, rating: 4.7, reviews: 298, students: 860, price: 35000, instructor: 'Kaung Htet Oo', status: 'published' },
    { id: 10, title: 'Git, GitHub & Team Workflow', cat: 'Tools', level: 'Beginner', lessons: 28, hours: 6, rating: 4.8, reviews: 267, students: 1240, price: 25000, instructor: 'Kaung Htet Oo', status: 'published' },
    { id: 101, title: 'Data Science with Python', cat: 'Programming', level: 'Intermediate', lessons: 0, hours: 0, rating: 0, reviews: 0, students: 0, price: 110000, instructor: 'Kaung Htet Oo', status: 'review' },
    { id: 102, title: 'Advanced React Patterns', cat: 'Web Development', level: 'Advanced', lessons: 0, hours: 0, rating: 0, reviews: 0, students: 0, price: 120000, instructor: 'Thura Aung', status: 'draft' },
];

export const ME_INSTRUCTOR = 'Thura Aung';
export const mySampleCourses = () => SAMPLE_COURSES.filter((c) => c.instructor === ME_INSTRUCTOR);

export type SampleStudent = {
    name: string;
    init: string;
    col: string;
    city: string;
    courses: number;
    xp: number;
    prog: number;
    plan: 'pro' | 'free';
    active: string;
    status: 'active' | 'inactive';
};

export const SAMPLE_STUDENTS: SampleStudent[] = [
    { name: 'May Thandar', init: 'MT', col: '#ec4899', city: 'Yangon', courses: 5, xp: 2480, prog: 74, plan: 'pro', active: 'ယနေ့', status: 'active' },
    { name: 'Kaung Htet', init: 'KH', col: '#0ea892', city: 'Yangon', courses: 6, xp: 2310, prog: 68, plan: 'pro', active: 'ယနေ့', status: 'active' },
    { name: 'Thiri Nanda', init: 'TN', col: '#6366f1', city: 'Mandalay', courses: 4, xp: 2105, prog: 63, plan: 'pro', active: 'ယနေ့', status: 'active' },
    { name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', city: 'Yangon', courses: 4, xp: 1940, prog: 58, plan: 'free', active: 'မနေ့က', status: 'active' },
    { name: 'Aung Khant Min', init: 'AK', col: '#38bdf8', city: 'Naypyidaw', courses: 3, xp: 1820, prog: 52, plan: 'pro', active: 'မနေ့က', status: 'active' },
    { name: 'Su Myat Noe', init: 'SM', col: '#22c55e', city: 'Yangon', courses: 3, xp: 1690, prog: 49, plan: 'free', active: 'လွန်ခဲ့သော 2 ရက်', status: 'active' },
    { name: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', city: 'Bago', courses: 2, xp: 1540, prog: 41, plan: 'free', active: 'လွန်ခဲ့သော 6 ရက်', status: 'inactive' },
    { name: 'Ei Mon Kyaw', init: 'EM', col: '#f43f5e', city: 'Mandalay', courses: 2, xp: 1410, prog: 38, plan: 'pro', active: 'ယနေ့', status: 'active' },
    { name: 'Phyo Min Khant', init: 'PM', col: '#eab308', city: 'Yangon', courses: 2, xp: 1280, prog: 33, plan: 'free', active: 'လွန်ခဲ့သော 12 ရက်', status: 'inactive' },
    { name: 'Nanda Win', init: 'NW', col: '#14b8a6', city: 'Taunggyi', courses: 1, xp: 1150, prog: 27, plan: 'free', active: 'လွန်ခဲ့သော 20 ရက်', status: 'inactive' },
];

export type SampleTxn = {
    id: string;
    n: string;
    item: string;
    method: string;
    amount: number;
    date: string;
    status: 'success' | 'pending' | 'refunded';
};

export const SAMPLE_TXNS: SampleTxn[] = [
    { id: 'TXN-8841', n: 'Thiri Nanda', item: 'React.js Complete Course', method: 'KBZPay', amount: 95000, date: 'နိုဝင်ဘာ 22 · မနက် 9:42', status: 'success' },
    { id: 'TXN-8840', n: 'Zaw Lin Htet', item: 'Pro Plan — လစဉ်', method: 'WavePay', amount: 30000, date: 'နိုဝင်ဘာ 22 · မနက် 8:15', status: 'success' },
    { id: 'TXN-8839', n: 'Ei Mon Kyaw', item: 'Flutter Mobile Development', method: 'Bank Transfer', amount: 90000, date: 'နိုဝင်ဘာ 22 · မနက် 7:58', status: 'pending' },
    { id: 'TXN-8836', n: 'May Thandar', item: 'Node.js API Development', method: 'KBZPay', amount: 80000, date: 'နိုဝင်ဘာ 21 · ည 8:20', status: 'success' },
    { id: 'TXN-8833', n: 'Phyo Min Khant', item: 'Python for Beginners', method: 'CB Pay', amount: 50000, date: 'နိုဝင်ဘာ 21 · နေ့လယ် 1:05', status: 'success' },
    { id: 'TXN-8830', n: 'Aung Khant Min', item: 'PHP & Laravel Framework', method: 'Bank Transfer', amount: 85000, date: 'နိုဝင်ဘာ 21 · မနက် 10:30', status: 'pending' },
    { id: 'TXN-8827', n: 'Su Myat Noe', item: 'Pro Plan — လစဉ်', method: 'KBZPay', amount: 30000, date: 'နိုဝင်ဘာ 20 · ည 7:44', status: 'success' },
    { id: 'TXN-8821', n: 'Hein Htet Aung', item: 'MySQL & Database Design', method: 'WavePay', amount: 35000, date: 'နိုဝင်ဘာ 20 · မနက် 11:12', status: 'success' },
    { id: 'TXN-8818', n: 'Nanda Win', item: 'Git, GitHub & Team Workflow', method: 'KBZPay', amount: 25000, date: 'နိုဝင်ဘာ 19 · ည 9:03', status: 'refunded' },
    { id: 'TXN-8812', n: 'Kaung Htet', item: 'Pro Plan — လစဉ်', method: 'KBZPay', amount: 30000, date: 'နိုဝင်ဘာ 15 · မနက် 9:00', status: 'success' },
];

export const SAMPLE_PAY_MIX = [
    { name: 'KBZPay', pct: 46, amount: '5,727,000 ကျပ်', col: '#0ea5a4' },
    { name: 'WavePay', pct: 28, amount: '3,486,000 ကျပ်', col: '#f59e0b' },
    { name: 'CB Pay', pct: 15, amount: '1,868,000 ကျပ်', col: '#2563eb' },
    { name: 'Bank Transfer', pct: 11, amount: '1,369,000 ကျပ်', col: '#64748b' },
];

export const SAMPLE_MONTHLY_REVENUE = [
    { label: 'ဇွန်', value: 6.2 },
    { label: 'ဇူလိုင်', value: 7.4 },
    { label: 'ဩဂုတ်', value: 8.1 },
    { label: 'စက်တင်ဘာ', value: 9.6 },
    { label: 'အောက်တိုဘာ', value: 11.1 },
    { label: 'နိုဝင်ဘာ', value: 12.45 },
];

export const SAMPLE_INS_MONTHLY = [
    { label: 'ဇွန်', value: 18 },
    { label: 'ဇူလိုင်', value: 22 },
    { label: 'ဩဂုတ်', value: 25 },
    { label: 'စက်တင်ဘာ', value: 29 },
    { label: 'အောက်တိုဘာ', value: 34 },
    { label: 'နိုဝင်ဘာ', value: 38 },
];

export type SampleReview = {
    id: number;
    name: string;
    init: string;
    col: string;
    course: string;
    stars: number;
    text: string;
    date: string;
    status: 'pending' | 'reported' | 'approved' | 'hidden';
    reportReason?: string;
};

export const SAMPLE_INS_REVIEWS: SampleReview[] = [
    { id: 1, name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', course: 'React.js Complete Course', stars: 5, text: 'Custom hooks အခန်းက ကျွန်တော် အလုပ်မှာ တိုက်ရိုက် အသုံးချနိုင်ခဲ့ပါတယ်။ Live session တွေကလည်း အရမ်း အထောက်အကူ ဖြစ်ပါတယ်။', date: 'နိုဝင်ဘာ 21', status: 'approved' },
    { id: 2, name: 'May Thandar', init: 'MT', col: '#ec4899', course: 'HTML & CSS Foundations', stars: 5, text: 'သုညကနေ စသူတောင် လိုက်နိုင်အောင် တစ်ဆင့်ချင်း ရှင်းပြထားပါတယ်။ Portfolio project က အလုပ်လျှောက်တဲ့အခါ အများကြီး အထောက်အကူ ဖြစ်ခဲ့ပါတယ်။', date: 'နိုဝင်ဘာ 19', status: 'approved' },
    { id: 3, name: 'Phyo Min Khant', init: 'PM', col: '#eab308', course: 'React.js Complete Course', stars: 4, text: 'Routing အခန်းမှာ လေ့ကျင့်ခန်း နည်းနည်း ပိုထည့်ရင် ပိုကောင်းပါမယ်။ ကျန်တာတော့ အရမ်း စနစ်ကျပါတယ်။', date: 'နိုဝင်ဘာ 17', status: 'approved' },
];

export const SAMPLE_ADMIN_REVIEWS: SampleReview[] = [
    { id: 1, name: 'Thiri Nanda', init: 'TN', col: '#6366f1', course: 'React.js Complete Course', stars: 5, text: 'Hooks အပိုင်းကို ဥပမာများများနဲ့ ရှင်းပြထားတာ အရမ်း ကောင်းပါတယ်။ Live session တွေကလည်း အထောက်အကူ အများကြီး ဖြစ်ပါတယ်။', date: 'နိုဝင်ဘာ 21', status: 'pending' },
    { id: 2, name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', course: 'Python for Beginners', stars: 5, text: 'စတင်သူတွေ အတွက် အရမ်း သင့်တော်ပါတယ်။ တစ်ဆင့်ချင်း ရှင်းပြထားလို့ programming ကို ပထမဆုံး စသူတောင် လိုက်နိုင်ပါတယ်။', date: 'နိုဝင်ဘာ 20', status: 'pending' },
    { id: 3, name: 'Hein Htet Aung', init: 'HH', col: '#8b5cf6', course: 'JavaScript Deep Dive', stars: 4, text: 'အကြောင်းအရာ ကောင်းပေမယ့် Async အခန်းမှာ လေ့ကျင့်ခန်း နည်းနည်း ပိုထည့်ပေးရင် ပိုကောင်းပါမယ်။', date: 'နိုဝင်ဘာ 19', status: 'pending' },
    { id: 4, name: 'Ei Mon Kyaw', init: 'EM', col: '#f43f5e', course: 'UI/UX Design with Figma', stars: 5, text: 'ဒီသင်တန်း အရမ်း ကောင်းတယ်၊ အားလုံး ဝယ်ကြပါ၊ အပြင် link တွေ နှိပ်ကြည့်ပါ ဆိုတဲ့ ကြော်ငြာဆန်ဆန် စာသားများ ပါဝင်နေပါတယ်။', date: 'နိုဝင်ဘာ 18', status: 'reported', reportReason: 'Spam / ကြော်ငြာ ပါဝင်သည်ဟု ကျောင်းသားတစ်ဦးက report လုပ်ထားပါတယ်' },
    { id: 5, name: 'Su Myat Noe', init: 'SM', col: '#22c55e', course: 'HTML & CSS Foundations', stars: 5, text: 'Portfolio project လုပ်ရင်း အလုပ်လျှောက်ဖို့ အဆင်သင့် ဖြစ်သွားပါတယ်။ ဆရာ့ feedback တွေကလည်း အသေးစိတ် ကျပါတယ်။', date: 'နိုဝင်ဘာ 15', status: 'approved' },
    { id: 6, name: 'Phyo Min Khant', init: 'PM', col: '#eab308', course: 'Git, GitHub & Team Workflow', stars: 4, text: 'Team workflow အပိုင်းက လက်တွေ့ အလုပ်မှာ တိုက်ရိုက် အသုံးချနိုင်ပါတယ်။ အချိန်တိုပေမယ့် အနှစ်သာရ ပြည့်ဝပါတယ်။', date: 'နိုဝင်ဘာ 12', status: 'approved' },
];

export type SampleQA = {
    id: number;
    student: string;
    init: string;
    col: string;
    courseId: number;
    lesson: string;
    q: string;
    time: string;
    answer: string;
};

export const SAMPLE_QA: SampleQA[] = [
    { id: 1, student: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', courseId: 4, lesson: 'Hooks in Depth — useEffect', q: 'useEffect ထဲမှာ dependency array ချန်ထားမိရင် ဘာဖြစ်မလဲ ဆရာ? Infinite loop ဖြစ်နိုင်လား သိချင်ပါတယ်။', time: 'လွန်ခဲ့သော 2 နာရီ', answer: '' },
    { id: 2, student: 'Ei Mon Kyaw', init: 'EM', col: '#f43f5e', courseId: 1, lesson: 'Flexbox & Grid Layout', q: 'Grid နဲ့ Flexbox ကို ဘယ်အချိန်မှာ ဘယ်ဟာ သုံးရမလဲ ခွဲခြားနည်း ရှင်းပြပေးပါဦး ဆရာ။', time: 'လွန်ခဲ့သော 5 နာရီ', answer: '' },
    { id: 3, student: 'Nanda Win', init: 'NW', col: '#14b8a6', courseId: 4, lesson: 'Components & JSX', q: 'Component တစ်ခုထဲမှာ state ဘယ်နှခုလောက် အထိ ထားသင့်လဲ ဆရာ?', time: 'မနေ့က', answer: 'State ကို လိုအပ်သလောက်ပဲ ထားပါ။ တစ်ခုကနေ တွက်ထုတ်လို့ ရတဲ့ တန်ဖိုးတွေကို state မလုပ်ဘဲ render ထဲမှာ တိုက်ရိုက် တွက်တာ ပိုသန့်ပါတယ်။' },
    { id: 4, student: 'May Thandar', init: 'MT', col: '#ec4899', courseId: 1, lesson: 'Responsive Design', q: 'Mobile မှာ font-size ကို rem နဲ့ သတ်မှတ်တာ မှန်ပါသလား ဆရာ?', time: 'နိုဝင်ဘာ 20', answer: 'မှန်ပါတယ်။ rem သုံးရင် root font-size အလိုက် လိုက်ပြောင်းနိုင်လို့ accessibility အတွက်လည်း ကောင်းပါတယ်။ px ကို border လို နေရာမျိုးမှာပဲ သုံးပါ။' },
];

export type SampleInstStudent = { name: string; init: string; col: string; courseId: number; progress: number; last: string; xp: number };

export const SAMPLE_INST_STUDENTS: SampleInstStudent[] = [
    { name: 'Kaung Htet', init: 'KH', col: '#0ea892', courseId: 1, progress: 68, last: 'ယနေ့', xp: 2310 },
    { name: 'May Thandar', init: 'MT', col: '#ec4899', courseId: 1, progress: 92, last: 'ယနေ့', xp: 2480 },
    { name: 'Zaw Lin Htet', init: 'ZL', col: '#f59e0b', courseId: 1, progress: 45, last: 'မနေ့က', xp: 1940 },
    { name: 'Thiri Nanda', init: 'TN', col: '#6366f1', courseId: 4, progress: 30, last: 'ယနေ့', xp: 2105 },
    { name: 'Aung Min Khant', init: 'AM', col: '#38bdf8', courseId: 4, progress: 57, last: 'လွန်ခဲ့သော 2 ရက်', xp: 1520 },
    { name: 'Su Su Win', init: 'SW', col: '#22c55e', courseId: 4, progress: 100, last: 'လွန်ခဲ့သော 3 ရက်', xp: 2680 },
    { name: 'Nanda Kyaw', init: 'NK', col: '#a855f7', courseId: 1, progress: 12, last: 'လွန်ခဲ့သော 6 ရက်', xp: 640 },
];

export type SampleLive = {
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

export const SAMPLE_LIVE: SampleLive[] = [
    { day: '22', mon: 'နိုဝင်ဘာ', when: 'ယနေ့', title: 'React Hooks Deep Dive — Live Session', instructor: 'Thura Aung', time: 'ညနေ 7:00 – 8:30', courseTitle: 'React.js Complete Course', desc: 'useState, useEffect နဲ့ custom hooks တွေကို live coding နဲ့တကွ ရှင်းပြပါမယ်။', liveNow: true, joined: 84 },
    { day: '23', mon: 'နိုဝင်ဘာ', when: 'မနက်ဖြန်', title: 'JavaScript Async Patterns — Q&A Live', instructor: 'May Thazin', time: 'ညနေ 7:00 – 8:00', courseTitle: 'JavaScript Deep Dive', desc: 'Promise, async/await နဲ့ ပတ်သက်တဲ့ မေးခွန်းတွေကို တိုက်ရိုက် ဖြေကြားပေးပါမယ်။', liveNow: false, joined: 56 },
    { day: '28', mon: 'နိုဝင်ဘာ', when: 'စနေ', title: 'Python OOP Workshop — Live Coding', instructor: 'Kaung Htet Oo', time: 'မနက် 10:00 – 11:30', courseTitle: 'Python for Beginners', desc: 'Class နဲ့ object တွေကို လက်တွေ့ mini project တစ်ခု ဆောက်ရင်း သင်ယူပါမယ်။', liveNow: false, joined: 112 },
    { day: '29', mon: 'နိုဝင်ဘာ', when: 'တနင်္ဂနွေ', title: 'Figma Auto Layout Masterclass', instructor: 'Nilar Win', time: 'နေ့လယ် 2:00 – 3:30', courseTitle: 'UI/UX Design with Figma', desc: 'Responsive UI တွေအတွက် Auto Layout ကို အဆင့်မြင့် နည်းလမ်းတွေနဲ့ သုံးပြပါမယ်။', liveNow: false, joined: 73 },
    { day: '30', mon: 'နိုဝင်ဘာ', when: 'တနင်္လာ', title: 'Laravel REST API — Live Q&A', instructor: 'Aung Khant', time: 'ညနေ 7:30 – 8:30', courseTitle: 'PHP & Laravel Framework', desc: 'API project လုပ်နေသူတွေအတွက် error ဖြေရှင်းနည်းနဲ့ best practice များ ဆွေးနွေးပါမယ်။', liveNow: false, joined: 41 },
];

export type SamplePayout = { id: string; name: string; amount: number; method: string; date: string; status: 'pending' | 'paid' | 'hold' };

export const SAMPLE_PAYOUTS: SamplePayout[] = [
    { id: 'PAY-014', name: 'Kaung Htet Oo', amount: 2950000, method: 'KBZPay', date: 'နိုဝင်ဘာ 5', status: 'pending' },
    { id: 'PAY-015', name: 'Su Myat Noe', amount: 1760000, method: 'WavePay', date: 'နိုဝင်ဘာ 5', status: 'pending' },
    { id: 'PAY-011', name: 'Thura Aung', amount: 3420000, method: 'KBZPay', date: 'အောက်တိုဘာ 5', status: 'paid' },
    { id: 'PAY-012', name: 'May Thazin', amount: 3110000, method: 'KBZPay', date: 'အောက်တိုဘာ 5', status: 'paid' },
    { id: 'PAY-013', name: 'Aung Khant', amount: 2140000, method: 'Bank Transfer', date: 'အောက်တိုဘာ 5', status: 'paid' },
    { id: 'PAY-016', name: 'Nilar Win', amount: 1580000, method: 'WavePay', date: 'အောက်တိုဘာ 5', status: 'paid' },
];

export type SampleCoupon = { code: string; pct: number; used: number; limit: number; expiry: string; active: boolean };

export const SAMPLE_COUPONS: SampleCoupon[] = [
    { code: 'CODEXA10', pct: 10, used: 486, limit: 1000, expiry: '2026 ဒီဇင်ဘာ 31', active: true },
    { code: 'STUDENT20', pct: 20, used: 132, limit: 300, expiry: '2026 နိုဝင်ဘာ 30', active: true },
    { code: 'WELCOME15', pct: 15, used: 58, limit: 200, expiry: '2027 ဇန်နဝါရီ 31', active: true },
    { code: 'FLASH50', pct: 50, used: 200, limit: 200, expiry: '2026 နိုဝင်ဘာ 15', active: false },
];

export type SampleInstructor = {
    name: string;
    init: string;
    col: string;
    field: string;
    courses: number;
    students: number;
    rating: number;
    share: number;
    payout: 'paid' | 'pending';
};

export const SAMPLE_INSTRUCTORS: SampleInstructor[] = [
    { name: 'Thura Aung', init: 'TA', col: '#0ea892', field: 'Web Development · React', courses: 3, students: 3980, rating: 4.9, share: 3420000, payout: 'paid' },
    { name: 'May Thazin', init: 'MT', col: '#ec4899', field: 'JavaScript · Frontend', courses: 2, students: 2875, rating: 4.8, share: 3110000, payout: 'paid' },
    { name: 'Kaung Htet Oo', init: 'KO', col: '#f59e0b', field: 'Python · Backend', courses: 3, students: 5220, rating: 4.9, share: 2950000, payout: 'pending' },
    { name: 'Aung Khant', init: 'AK', col: '#38bdf8', field: 'PHP · Laravel', courses: 2, students: 2260, rating: 4.8, share: 2140000, payout: 'paid' },
    { name: 'Su Myat Noe', init: 'SM', col: '#22c55e', field: 'Mobile · Flutter', courses: 1, students: 1120, rating: 4.8, share: 1760000, payout: 'pending' },
    { name: 'Nilar Win', init: 'NW', col: '#8b5cf6', field: 'UI/UX · Figma', courses: 1, students: 1540, rating: 4.9, share: 1580000, payout: 'paid' },
];

export const SAMPLE_INST_APPS = [
    { name: 'Aye Chan Moe', init: 'AC', col: '#f59e0b', field: 'Data Science & Python', exp: 'အတွေ့အကြုံ 5 နှစ်', note: 'Python နဲ့ data analysis အတွေ့အကြုံ ၅ နှစ် ရှိပြီး Kaggle project များစွာ လုပ်ဖူးပါတယ်။ Data Science with Python သင်တန်းကို သင်ကြားချင်ပါတယ်။', when: 'လွန်ခဲ့သော 1 ရက်' },
    { name: 'May Myat Noe', init: 'MM', col: '#38bdf8', field: 'TypeScript & React', exp: 'အတွေ့အကြုံ 4 နှစ်', note: 'Singapore startup တစ်ခုမှာ frontend engineer အဖြစ် ၄ နှစ် လုပ်ကိုင်ခဲ့ပါတယ်။ Advanced React Patterns သင်တန်း အတွက် လျှောက်ထားပါတယ်။', when: 'လွန်ခဲ့သော 3 ရက်' },
];

export const SAMPLE_CATEGORIES = [
    { name: 'Web Development', courses: 4, students: 5965 },
    { name: 'Programming', courses: 2, students: 3120 },
    { name: 'Backend', courses: 3, students: 3120 },
    { name: 'Mobile', courses: 1, students: 1120 },
    { name: 'Design', courses: 1, students: 1540 },
    { name: 'Tools', courses: 1, students: 1240 },
];

export const fmtNum = (n: number) => n.toLocaleString('en-US');

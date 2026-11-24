// Sample data copied from the Codexa MM LMS UI prototype
// (~/workspace/your_files/codexa-mm-lms/codexa-mm-lms.html).
// Used ONLY as a fallback when the backend passes no data, so public pages
// render with visual parity. Real Inertia props always take precedence.

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

export type SampleCourseDetail = LmsCourse & {
    desc: string;
    topics: string[];
    learn: string[];
    lessons: number;
    hours: number;
    reviews: number;
};

export const SAMPLE_COURSES: SampleCourseDetail[] = [
    { id: 1, slug: 'html-css-foundations', title: 'HTML & CSS Foundations', category: 'Web Development', level: 'Beginner', lessons: 48, hours: 12, rating: 4.9, reviews: 812, students: 2340, price: 45000, oldPrice: 90000, instructor: 'Thura Aung', desc: 'Web development ရဲ့ အခြေခံအကျဆုံး HTML နဲ့ CSS ကို သုညကနေ စပြီး လက်တွေ့ project တွေနဲ့ သင်ယူရမယ့် သင်တန်းဖြစ်ပါတယ်။', topics: ['HTML Basics & Semantic Tags', 'CSS Styling & Box Model', 'Flexbox & Grid Layout', 'Responsive Design', 'Portfolio Project'], learn: ['Semantic HTML ကို မှန်မှန်ကန်ကန် ရေးနည်း', 'CSS Flexbox နဲ့ Grid layout တည်ဆောက်နည်း', 'Mobile-first responsive design', 'CSS animation အခြေခံများ', 'Portfolio website တစ်ခုလုံး ကိုယ်တိုင် တည်ဆောက်နည်း', 'Git ဖြင့် code တင်နည်း အခြေခံ'] },
    { id: 2, slug: 'javascript-deep-dive', title: 'JavaScript Deep Dive', category: 'Web Development', level: 'Intermediate', lessons: 86, hours: 24, rating: 4.8, reviews: 654, students: 1985, price: 75000, oldPrice: 150000, instructor: 'May Thazin', desc: 'JavaScript ကို အခြေခံကနေ advanced concept တွေအထိ နက်နက်နဲနဲ လေ့လာရမယ့် သင်တန်းပါ။ DOM, ES6+, Async နဲ့ real project တွေ ပါဝင်ပါတယ်။', topics: ['Variables, Types & Functions', 'DOM Manipulation', 'ES6+ Features', 'Async JS & Fetch API', 'Final Project — Task App'], learn: ['JavaScript core concept များ နက်ရှိုင်းစွာ', 'DOM ကို လက်တွေ့ ထိန်းချုပ်နည်း', 'Promise, async/await အသုံးချနည်း', 'API မှ data ခေါ်ယူ ပြသနည်း', 'Clean code ရေးနည်း', 'Debug လုပ်နည်း အဆင့်ဆင့်'] },
    { id: 3, slug: 'python-for-beginners', title: 'Python for Beginners', category: 'Programming', level: 'Beginner', lessons: 64, hours: 18, rating: 4.9, reviews: 903, students: 3120, price: 50000, oldPrice: 100000, instructor: 'Kaung Htet Oo', desc: 'Programming ကို လုံးဝ မသိသေးသူတွေအတွက် Python ကို လွယ်ကူရှင်းလင်းစွာ စတင်သင်ယူနိုင်မယ့် သင်တန်းဖြစ်ပါတယ်။', topics: ['Python Setup & Syntax', 'Data Types & Loops', 'Functions & Modules', 'OOP Basics', 'Mini Projects'], learn: ['Python syntax အခြေခံ အပြည့်အစုံ', 'List, Dict စတဲ့ data structure များ', 'Function ရေးနည်း နဲ့ module အသုံးချနည်း', 'OOP အခြေခံ concept', 'File ဖတ်/ရေး လုပ်နည်း', 'Mini project 5 ခု လက်တွေ့ လုပ်နည်း'] },
    { id: 4, slug: 'react-complete-course', title: 'React.js Complete Course', category: 'Web Development', level: 'Intermediate', lessons: 92, hours: 28, rating: 4.8, reviews: 521, students: 1640, price: 95000, oldPrice: 180000, instructor: 'Thura Aung', desc: 'Modern web app တွေ တည်ဆောက်ဖို့ React ကို component, hooks, routing, state management ကနေ deployment အထိ အပြည့်အစုံ သင်ယူရပါမယ်။', topics: ['Components & JSX', 'Hooks in Depth', 'Routing & Forms', 'State Management', 'Deploy & Best Practices'], learn: ['Component-based thinking', 'useState, useEffect, custom hooks', 'React Router ဖြင့် SPA တည်ဆောက်နည်း', 'API integration pattern များ', 'Performance optimization', 'Production deploy လုပ်နည်း'] },
    { id: 5, slug: 'php-laravel-framework', title: 'PHP & Laravel Framework', category: 'Backend', level: 'Intermediate', lessons: 78, hours: 26, rating: 4.7, reviews: 388, students: 1210, price: 85000, oldPrice: 160000, instructor: 'Aung Khant', desc: 'PHP အခြေခံကနေ Laravel framework ဖြင့် ပြည့်စုံတဲ့ web application တည်ဆောက်နိုင်တဲ့အထိ သင်ကြားပေးမယ့် သင်တန်းပါ။', topics: ['PHP Fundamentals', 'OOP in PHP', 'Laravel Routing & Blade', 'Eloquent & Database', 'Auth & REST API'], learn: ['PHP syntax နဲ့ OOP', 'Laravel MVC architecture', 'Eloquent ORM အသုံးချနည်း', 'Authentication တည်ဆောက်နည်း', 'REST API ဖန်တီးနည်း', 'Project တစ်ခု အစအဆုံး'] },
    { id: 6, slug: 'flutter-mobile-development', title: 'Flutter Mobile Development', category: 'Mobile', level: 'Intermediate', lessons: 70, hours: 22, rating: 4.8, reviews: 342, students: 980, price: 90000, oldPrice: 170000, instructor: 'Su Myat Noe', desc: 'Dart နဲ့ Flutter သုံးပြီး Android နဲ့ iOS app နှစ်မျိုးလုံးအတွက် code တစ်ခါတည်း ရေးနိုင်မယ့် cross-platform development သင်တန်းပါ။', topics: ['Dart Language Basics', 'Widgets & Layouts', 'State Management', 'API & Local Storage', 'Publish to Stores'], learn: ['Dart programming အခြေခံ', 'Widget tree နားလည်နည်း', 'State management pattern များ', 'REST API ချိတ်ဆက်နည်း', 'Firebase အခြေခံ', 'Play Store တင်နည်း'] },
    { id: 7, slug: 'ui-ux-design-figma', title: 'UI/UX Design with Figma', category: 'Design', level: 'Beginner', lessons: 42, hours: 10, rating: 4.9, reviews: 467, students: 1750, price: 40000, oldPrice: 80000, instructor: 'Nilar Win', desc: 'Design အခြေခံကနေ Figma tool ကို ကျွမ်းကျင်စွာ အသုံးပြုပြီး mobile app နဲ့ website UI တွေ ဒီဇိုင်းဆွဲနိုင်တဲ့အထိ သင်ယူရပါမယ်။', topics: ['Design Principles', 'Figma Tools & Frames', 'Components & Auto Layout', 'Prototyping', 'Design Handoff'], learn: ['Color, typography အခြေခံ သဘောတရား', 'Figma interface ကျွမ်းကျင်စွာ သုံးနည်း', 'Component system တည်ဆောက်နည်း', 'Interactive prototype ဖန်တီးနည်း', 'Developer ထံ handoff လုပ်နည်း', 'Portfolio အတွက် case study'] },
    { id: 8, slug: 'mysql-database-design', title: 'MySQL & Database Design', category: 'Backend', level: 'Beginner', lessons: 38, hours: 9, rating: 4.7, reviews: 254, students: 890, price: 35000, oldPrice: 70000, instructor: 'Aung Khant', desc: 'Database concept, table design, SQL query ရေးနည်းတွေကို လက်တွေ့ ဥပမာတွေနဲ့ ရှင်းရှင်းလင်းလင်း သင်ကြားပေးမယ့် သင်တန်းပါ။', topics: ['Database Concepts', 'SQL CRUD & Joins', 'Table Design & Normalization', 'Indexing & Performance', 'Real-world Schema Practice'], learn: ['Relational database concept', 'SQL query အမျိုးမျိုး ရေးနည်း', 'Join နဲ့ subquery အသုံးချနည်း', 'Normalization သဘောတရား', 'Index ဖြင့် မြန်ဆန်အောင် လုပ်နည်း', 'Schema design လက်တွေ့'] },
    { id: 9, slug: 'nodejs-api-development', title: 'Node.js API Development', category: 'Backend', level: 'Advanced', lessons: 66, hours: 20, rating: 4.8, reviews: 298, students: 760, price: 80000, oldPrice: 150000, instructor: 'May Thazin', desc: 'Express နဲ့ Node.js သုံးပြီး scalable ဖြစ်တဲ့ REST API တွေ တည်ဆောက်နည်း၊ authentication နဲ့ testing အထိ သင်ယူရပါမယ်။', topics: ['Node & Express Setup', 'Routing & Middleware', 'MongoDB & Mongoose', 'JWT Authentication', 'Testing & Deployment'], learn: ['Express server တည်ဆောက်နည်း', 'Middleware pattern နားလည်နည်း', 'MongoDB ချိတ်ဆက်နည်း', 'JWT auth လုံခြုံအောင် လုပ်နည်း', 'API testing လုပ်နည်း', 'Server ပေါ် deploy လုပ်နည်း'] },
    { id: 10, slug: 'git-github-team-workflow', title: 'Git, GitHub & Team Workflow', category: 'Tools', level: 'Beginner', lessons: 24, hours: 6, rating: 4.8, reviews: 187, students: 1430, price: 25000, oldPrice: 50000, instructor: 'Kaung Htet Oo', desc: 'Developer တိုင်း သိထားရမယ့် version control — Git နဲ့ GitHub ကို team နဲ့ အလုပ်လုပ်တဲ့ workflow အပါအဝင် သင်ယူရပါမယ်။', topics: ['Git Basics', 'Branching & Merging', 'GitHub & Pull Requests', 'Team Workflow', 'Conflict Resolution'], learn: ['Commit, branch အခြေခံများ', 'Merge conflict ဖြေရှင်းနည်း', 'Pull request workflow', 'Team နဲ့ collaborate လုပ်နည်း', 'GitHub profile ပြင်ဆင်နည်း', 'အလုပ်မှာ သုံးတဲ့ workflow'] },
];

export const SAMPLE_CATEGORIES = [
    { name: 'Web Development', glyph: '</>', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)' },
    { name: 'Programming', glyph: 'Py', grad: 'linear-gradient(130deg,#14532d,#22c55e)' },
    { name: 'Backend', glyph: '{;}', grad: 'linear-gradient(130deg,#312e81,#6366f1)' },
    { name: 'Mobile', glyph: 'Fl', grad: 'linear-gradient(130deg,#123a6d,#38bdf8)' },
    { name: 'Design', glyph: 'UX', grad: 'linear-gradient(130deg,#831843,#ec4899)' },
    { name: 'Tools', glyph: 'Git', grad: 'linear-gradient(130deg,#3f3f46,#a1a1aa)' },
];

export const CATEGORY_GRADIENTS: Record<string, { glyph: string; grad: string }> = Object.fromEntries(
    SAMPLE_CATEGORIES.map((c) => [c.name, { glyph: c.glyph, grad: c.grad }]),
);

export function categoryMeta(name?: string | null): { glyph: string; grad: string } {
    return (name && CATEGORY_GRADIENTS[name]) || { glyph: '</>', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)' };
}

export type SampleInstructor = {
    id: number;
    name: string;
    role: string;
    bio: string;
    grad: string;
    rating: number;
    students: number;
    courses: number;
};

export const SAMPLE_INSTRUCTORS: SampleInstructor[] = [
    { id: 1, name: 'Thura Aung', role: 'Web Development Instructor', bio: 'Frontend development အတွေ့အကြုံ 8 နှစ်ကျော်ရှိပြီး HTML/CSS ကနေ React အထိ လက်တွေ့ project-based သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#0b3b5e,#0ea892)', rating: 4.9, students: 3980, courses: 2 },
    { id: 2, name: 'May Thazin', role: 'JavaScript & Node.js Instructor', bio: 'Full-stack developer အဖြစ် startup တွေမှာ လုပ်ကိုင်ခဲ့ပြီး JavaScript ကို နက်နက်နဲနဲ ရှင်းပြရာမှာ အားသာပါတယ်။', grad: 'linear-gradient(135deg,#7c2d12,#f59e0b)', rating: 4.8, students: 2745, courses: 2 },
    { id: 3, name: 'Kaung Htet Oo', role: 'Programming Instructor', bio: 'Programming အခြေခံကို စတင်သူတွေ နားလည်လွယ်အောင် ဥပမာများများနဲ့ စိတ်ရှည်စွာ သင်ကြားပေးပါတယ်။', grad: 'linear-gradient(135deg,#14532d,#22c55e)', rating: 4.9, students: 4550, courses: 2 },
    { id: 4, name: 'Aung Khant', role: 'Backend Instructor', bio: 'PHP, Laravel နဲ့ database design ပိုင်းမှာ လက်တွေ့ စနစ်ကြီးတွေ တည်ဆောက်ခဲ့တဲ့ အတွေ့အကြုံကို မျှဝေပါတယ်။', grad: 'linear-gradient(135deg,#7f1d1d,#ef4444)', rating: 4.7, students: 2100, courses: 2 },
    { id: 5, name: 'Su Myat Noe', role: 'Mobile Development Instructor', bio: 'Flutter ဖြင့် app များစွာကို Play Store / App Store ပေါ် တင်ခဲ့ပြီး cross-platform development ကို သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#123a6d,#38bdf8)', rating: 4.8, students: 980, courses: 1 },
    { id: 6, name: 'Nilar Win', role: 'UI/UX Design Instructor', bio: 'Product designer အဖြစ် 6 နှစ်ကျော် လုပ်ကိုင်ခဲ့ပြီး Figma နဲ့ design system တည်ဆောက်နည်းကို သင်ကြားပါတယ်။', grad: 'linear-gradient(135deg,#831843,#ec4899)', rating: 4.9, students: 1750, courses: 1 },
];

export const INSTRUCTOR_INFO: Record<string, { role: string; bio: string; grad: string }> = Object.fromEntries(
    SAMPLE_INSTRUCTORS.map((i) => [i.name, { role: i.role, bio: i.bio, grad: i.grad }]),
);

export function instructorInfo(name?: string | null): { role: string; bio: string; grad: string } {
    return (name && INSTRUCTOR_INFO[name]) || { role: 'Instructor', bio: 'Codexa MM instructor တစ်ဦးဖြစ်ပါတယ်။', grad: 'linear-gradient(135deg,#0ea892,#2563eb)' };
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

export type SamplePost = {
    id: number;
    slug: string;
    title: string;
    cat: string;
    author: string;
    date: string;
    read: string;
    glyph: string;
    grad: string;
    excerpt: string;
    body: string[];
};

export const SAMPLE_POSTS: SamplePost[] = [
    { id: 1, slug: 'programming-90-day-guide', title: 'Programming ကို သုညကနေ စသူတွေ အတွက် 90 ရက် လေ့လာနည်း လမ်းညွှန်', cat: 'သင်ယူနည်း', author: 'Thura Aung', date: 'နိုဝင်ဘာ 20', read: '6 မိနစ်', glyph: '</>', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)', excerpt: 'ဘာမှ မသိသေးတဲ့ အခြေအနေကနေ ပထမဆုံး project ပြီးတဲ့ အထိ — နေ့စဉ် ၁ နာရီခွဲခန့်နဲ့ လိုက်လုပ်နိုင်တဲ့ လက်တွေ့ အစီအစဉ်။', body: ['အစမှာ အကြီးဆုံး အမှားက သင်တန်း များများ စုပြီး တစ်ခုမှ မပြီးတာပါ။ ပထမ ၃၀ ရက်မှာ ဘာသာ တစ်ခုတည်း (ဥပမာ HTML/CSS သို့မဟုတ် Python) ကိုပဲ အာရုံစိုက်ပါ။ နေ့တိုင်း ၁ နာရီခွဲ — ၄၅ မိနစ် သင်ခန်းစာ ကြည့်ပြီး ၄၅ မိနစ် ကိုယ်တိုင် လက်တွေ့ ရေးပါ။ ကြည့်ရုံနဲ့ မတတ်ပါဘူး၊ လက်နဲ့ ရေးမှ တတ်ပါတယ်။', 'ရက် ၃၁–၆၀ မှာ သင်ထားတာတွေကို project အသေး ၃ ခု ပြောင်းလုပ်ပါ။ ကိုယ်ပိုင် portfolio page၊ ရိုးရှင်းတဲ့ calculator၊ to-do app လိုမျိုးပါ။ Error ကြုံတိုင်း မကြောက်ပါနဲ့ — error message ကို ဖတ်တတ်လာတာကိုက developer ကျွမ်းကျင်မှုရဲ့ တစ်ဝက်ပါ။ Community မှာ မေးခွန်း မေးတာကို မရှက်ပါနဲ့၊ လူတိုင်း အဲဒီ လမ်းကို ဖြတ်ဖူးပါတယ်။', 'ရက် ၆၁–၉၀ မှာ GitHub ပေါ် project တွေ တင်ပြီး README သေချာ ရေးပါ။ ပြီးရင် Learning Path ထဲက နောက်တစ်ဆင့် သင်တန်းကို ဆက်သွားပါ။ ၉၀ ရက် အဆုံးမှာ သင် ပြီးထားတဲ့ project ၃–၄ ခုက CV ထဲ ထည့်နိုင်တဲ့ အဆင့် ဖြစ်နေပါလိမ့်မယ်။ အရေးအကြီးဆုံးက မြန်နှုန်း မဟုတ်ပါ — မရပ်တန့်ဖို့ပါ။'] },
    { id: 2, slug: 'junior-developer-hiring-5-things', title: 'Junior Developer အလုပ် လျှောက်တဲ့အခါ Company တွေ တကယ် ကြည့်တဲ့ အရာ ၅ ခု', cat: 'Career', author: 'May Thazin', date: 'နိုဝင်ဘာ 18', read: '5 မိနစ်', glyph: '{;}', grad: 'linear-gradient(130deg,#312e81,#6366f1)', excerpt: 'Certificate အရေအတွက်ထက် အရေးကြီးတာတွေ ရှိပါတယ်။ Hiring manager တွေ အမှန်တကယ် စစ်ဆေးတဲ့ အချက်တွေကို မျှဝေထားပါတယ်။', body: ['ပထမ အချက်က GitHub profile ပါ။ Project များများ ရှိဖို့ မလိုပါဘူး — ပြီးပြည့်စုံတဲ့ project ၂–၃ ခုမှာ README ရှင်းရှင်းလင်းလင်း၊ commit message သပ်သပ်ရပ်ရပ် ရှိရင် လုံလောက်ပါတယ်။ ဒုတိယက ပြဿနာ ဖြေရှင်းပုံကို ရှင်းပြနိုင်မှုပါ။ Interview မှာ code ရေးရင်း ဘာလို့ အဲလို ရေးတယ် ဆိုတာ ပြောနိုင်သူကို ရွေးကြပါတယ်။', 'တတိယက အခြေခံ ခိုင်မာမှုပါ။ Framework နာမည်တွေ ထက် HTML/CSS/JavaScript အခြေခံ concept တွေကို နက်နက်နဲနဲ နားလည်သူက အလုပ်ထဲမှာ ပိုမြန်မြန် လိုက်နိုင်ပါတယ်။ စတုတ္ထက ဆက်သွယ်ပြောဆိုပုံပါ — မြန်မာလိုရော အင်္ဂလိပ်လိုပါ အခြေခံ ရေးနိုင် ပြောနိုင်ရင် အခွင့်အလမ်း နှစ်ဆ များပါတယ်။', 'နောက်ဆုံး အချက်က ဆက်လက် သင်ယူနေမှု သက်သေပါ။ Blog ရေးတာ၊ community မှာ သူများကို ကူညီတာ၊ လက်မှတ်တွေ စုထားတာတွေက ဒီလူက ရပ်မနေဘူး ဆိုတာကို ပြပါတယ်။ Codexa MM ရဲ့ အလုပ်အခွင့်အလမ်း page မှာ မိတ်ဖက် ကုမ္ပဏီ ခေါ်စာတွေကို ပုံမှန် စစ်ကြည့်ပါ။'] },
    { id: 3, slug: 'react-useeffect-explained', title: 'React Hooks ကို နားလည်ဖို့ — useEffect ကို ရိုးရိုးရှင်းရှင်း ရှင်းပြချက်', cat: 'နည်းပညာ', author: 'Thura Aung', date: 'နိုဝင်ဘာ 15', read: '8 မိနစ်', glyph: 'Re', grad: 'linear-gradient(130deg,#123a6d,#38bdf8)', excerpt: "useEffect ကို 'render ပြီးရင် လုပ်ရမယ့် အလုပ်' လို့ မြင်လိုက်ရင် အရာရာ ရှင်းသွားပါလိမ့်မယ်။ Dependency array ရဲ့ လျှို့ဝှက်ချက်နဲ့အတူ။", body: ['useEffect ကို အများစု ခက်တယ် ထင်ကြတာ lifecycle method တွေနဲ့ ယှဉ် စဉ်းစားလို့ပါ။ အမှန်တော့ useEffect ဆိုတာ ဒီ component render ဖြစ်ပြီးတဲ့ နောက် ဒီ အလုပ်ကို လုပ်ပါ ဆိုတဲ့ အမိန့် တစ်ခုပါပဲ။ API ခေါ်တာ၊ title ပြောင်းတာ၊ event listener တပ်တာတွေက render ရဲ့ အစိတ်အပိုင်း မဟုတ်တဲ့ ဘေး အလုပ် (side effect) တွေ ဖြစ်ပါတယ်။', 'Dependency array က ဘယ် တန်ဖိုးတွေ ပြောင်းမှ effect ကို ပြန် run မလဲ ဆိုတာပါ။ Array ချန်ထားရင် render တိုင်း run ပါတယ်။ [] အလွတ် ပေးရင် ပထမ render တစ်ခါပဲ run ပါတယ်။ [count] ပေးရင် count ပြောင်းတိုင်းပါ။ Infinite loop အများစုက effect ထဲမှာ ကိုယ် depend လုပ်ထားတဲ့ state ကိုပဲ ပြန် set လုပ်မိလို့ ဖြစ်တာပါ။', 'အကောင်းဆုံး အလေ့အကျင့်က effect တစ်ခုကို ရည်ရွယ်ချက် တစ်ခုပဲ ထားပါ။ Data ခေါ်တာ သပ်သပ်၊ listener သပ်သပ် ခွဲရေးရင် debug လုပ်ရ အများကြီး လွယ်သွားပါတယ်။ အသေးစိတ်ကို React.js Complete Course ရဲ့ Hooks in Depth အခန်းမှာ live coding နဲ့ ရှင်းပြထားပါတယ်။'] },
    { id: 4, slug: 'student-to-developer-su-myat-noe', title: 'ကျောင်းသားမှ Developer သို့ — Su Myat Noe ရဲ့ အလုပ်ဝင် ခရီးစဉ်', cat: 'အတွေ့အကြုံ', author: 'Codexa MM အဖွဲ့', date: 'နိုဝင်ဘာ 12', read: '4 မိနစ်', glyph: 'UX', grad: 'linear-gradient(130deg,#831843,#ec4899)', excerpt: 'စာရင်းကိုင် အလုပ်ကနေ Flutter developer ဖြစ်လာတဲ့ ၁၀ လ အတွင်း ခရီးစဉ် — ခက်ခဲခဲ့တဲ့ အပိုင်းတွေနဲ့ အလုပ်ရစေခဲ့တဲ့ အရာတွေ။', body: ["Su Myat Noe က အသက် ၂၄ နှစ်မှာ စာရင်းကိုင် အလုပ်ကို ထွက်ပြီး programming စသင်ခဲ့ပါတယ်။ ပထမ ၃ လမှာ Python၊ နောက် ၄ လမှာ Flutter ကို Learning Path အတိုင်း သွားခဲ့ပါတယ်။ 'အခက်ဆုံးက ကိုယ့်ကိုယ်ကို သူများနဲ့ နှိုင်းယှဉ်မိတာပါ' လို့ သူမ ပြောပါတယ်။ 'ရပ်မသွားဘဲ နေ့တိုင်း နည်းနည်းချင်း ဆက်လုပ်တာက နောက်ဆုံးတော့ အနိုင်ရခဲ့တာပါ။'", 'သင်တန်း ပြီးတဲ့ နောက်ပိုင်း capstone project အဖြစ် ဆိုင်ငယ်တွေအတွက် စာရင်းမှတ် app တစ်ခု ဆောက်ခဲ့ပါတယ်။ အဲဒီ project ကို demo နဲ့တကွ အလုပ်လျှောက်တော့ interview ၃ ခုမှာ ၂ ခုက offer ရခဲ့ပါတယ်။ အခု သူမ ရန်ကုန် software company တစ်ခုမှာ junior Flutter developer အဖြစ် အလုပ်ဝင် နေပါပြီ။', "သူမရဲ့ အကြံပြုချက်က 'လက်မှတ်ထက် project ကို ပို အလေးပေးပါ။ ပြီးတော့ Community မှာ ကိုယ် သိတာကို ပြန် မျှဝေပါ — သင်ပေးရင်း ကိုယ်တိုင် ပို နက်နက်နဲနဲ နားလည်လာပါတယ်' ဆိုတာပါ။"] },
    { id: 5, slug: 'freelance-pricing-basics', title: 'Freelance စလုပ်မယ့်သူတွေ အတွက် ဈေးနှုန်း သတ်မှတ်နည်း အခြေခံ', cat: 'Career', author: 'Aung Khant', date: 'နိုဝင်ဘာ 08', read: '5 မိနစ်', glyph: '$', grad: 'linear-gradient(130deg,#14532d,#22c55e)', excerpt: 'ပထမဆုံး client ရတဲ့အခါ ဘယ်လောက် တောင်းရမလဲ မသိတာ ထုံးစံပါ။ အချိန်နဲ့ တန်ဖိုးကို ခွဲမြင်နည်း၊ စာချုပ် အခြေခံနဲ့အတူ။', body: ['အစမှာ အမှားအများဆုံးက ဈေး အရမ်း ချိုချို သတ်မှတ်တာပါ။ သင့် အချိန်ကို နာရီနဲ့ အရင် တွက်ပါ — လစာ အလုပ် ဆိုရင် တစ်လ ဘယ်လောက် ရချင်လဲ ဆိုတာကနေ တစ်နာရီ နှုန်းကို နောက်ပြန် တွက်ထုတ်ပါ။ Project အလိုက် တောင်းရင်လည်း အတွင်းထဲမှာ နာရီ ခန့်မှန်း ရှိရပါမယ်၊ မဟုတ်ရင် ပြင်ဆင်ချက်တွေ များလာတာနဲ့ အရှုံး ပေါ်ပါမယ်။', "ဒုတိယ အချက်က စရံ (deposit) ပါ။ Project တိုင်းမှာ ၃၀–၅၀% ကို အရင် ယူပါ။ Scope ကို စာဖြင့် ရှင်းရှင်း သတ်မှတ်ပါ — 'website တစ်ခု' ဆိုတာထက် 'page ၅ ခု၊ contact form ပါမည်၊ ပြင်ဆင်ခွင့် ၂ ကြိမ်' လို အတိအကျ ရေးပါ။ ဒါတွေက client နဲ့ သင် နှစ်ဖက်လုံးကို ကာကွယ်ပေးပါတယ်။", 'နောက်ဆုံးမှာ ဈေးကို တဖြည်းဖြည်း တင်ပါ။ Project ၃–၄ ခု ပြီးတိုင်း portfolio ကို update လုပ်ပြီး နှုန်းကို ၁၀–၂၀% တင်ကြည့်ပါ။ Client ကောင်းတွေက ဈေးထက် ယုံကြည်မှုနဲ့ ဆက်သွယ်မှု ကောင်းတာကို ပို တန်ဖိုးထားကြပါတယ်။'] },
    { id: 6, slug: 'junior-developers-ai-era', title: 'AI ခေတ်မှာ Junior Developer တွေ ဘယ်လို ပြိုင်ဆိုင်နိုင်မလဲ', cat: 'နည်းပညာ', author: 'May Thazin', date: 'နိုဝင်ဘာ 03', read: '7 မိနစ်', glyph: 'AI', grad: 'linear-gradient(130deg,#7c2d12,#f59e0b)', excerpt: 'AI tool တွေက code ရေးပေးနိုင်ပေမယ့် အစားထိုး မရသေးတဲ့ ကျွမ်းကျင်မှုတွေ ရှိပါတယ်။ ဘယ်အရာတွေကို အာရုံစိုက်ရမလဲ ဆိုတာ။', body: ["AI က ပုံမှန် code တွေ ရေးပေးနိုင်တာ မှန်ပါတယ်။ ဒါပေမယ့် 'ဘာ ဆောက်ရမလဲ' ဆုံးဖြတ်တာ၊ ပြဿနာကို အပိုင်းပိုင်း ခွဲတာ၊ ရေးထားတဲ့ code မှန်မမှန် စစ်တာတွေက လူရဲ့ အလုပ် ဆက်ဖြစ်နေပါသေးတယ်။ Junior တစ်ယောက် အနေနဲ့ AI ထုတ်ပေးတဲ့ code ကို မဖတ်ဘဲ copy ကူးထည့်တဲ့ အလေ့အကျင့် ရှိရင် အခြေခံ မခိုင်ဘဲ အလယ်မှာ ရပ်သွားပါလိမ့်မယ်။", 'ပြိုင်ဆိုင်နိုင်တဲ့ နည်းက AI ကို ဆရာ အဖြစ် သုံးတာပါ။ Code တစ်ပိုင်းကို ထုတ်ခိုင်းပြီး ဘာလို့ ဒီလို ရေးတာလဲ ပြန် မေးပါ။ Error ကို အရင် ကိုယ်တိုင် စဉ်းစားပြီးမှ AI အကူအညီ ယူပါ။ အခြေခံ concept တွေ (data structure, HTTP, database) ကို နက်နက်နဲနဲ နားလည်သူက AI ကို ပိုပြီး ထိထိရောက်ရောက် မောင်းနှင်နိုင်ပါတယ်။', 'နောက်ဆုံးအနေနဲ့ ဆက်သွယ်ပြောဆိုမှုနဲ့ စီးပွားရေး နားလည်မှုကို တည်ဆောက်ပါ။ Client ရဲ့ ပြဿနာကို နားလည်ပြီး သင့်တော်တဲ့ ဖြေရှင်းချက် အကြံပြုနိုင်တဲ့ developer က AI ခေတ်မှာ တန်ဖိုး ပိုတက်လာပါတယ်။'] },
];

export const BLOG_CATS = ['All', 'သင်ယူနည်း', 'Career', 'နည်းပညာ', 'အတွေ့အကြုံ'];

export const SAMPLE_FAQS = [
    { q: 'သင်တန်းကြေးကို ဘယ်လို ပေးချေရမလဲ?', a: "KBZPay, WavePay, CB Pay နဲ့ bank transfer တို့နဲ့ ပေးချေနိုင်ပါတယ်။ သင်တန်း detail page မှာ 'စာရင်းသွင်းရန်' ကို နှိပ်ရင် checkout page ရောက်ပြီး နည်းလမ်း ရွေးလို့ ရပါတယ်။ ပေးချေမှု အတည်ပြုပြီးတာနဲ့ သင်ခန်းစာတွေ ချက်ချင်း ပွင့်သွားပါမယ်။" },
    { q: 'သင်တန်းကို ဘယ်လောက်ကြာကြာ ကြည့်လို့ရမလဲ?', a: 'တစ်ခါ ဝယ်ထားတဲ့ သင်တန်းတိုင်းကို lifetime access ဖြင့် အမြဲတမ်း ကြည့်နိုင်ပါတယ်။ Update ဖြစ်တဲ့ သင်ခန်းစာ အသစ်တွေကိုလည်း အခမဲ့ ဆက်ကြည့်နိုင်ပါတယ်။' },
    { q: 'Live class လွတ်သွားရင် ဘယ်လို ပြန်ကြည့်ရမလဲ?', a: "Live session တိုင်းရဲ့ မှတ်တမ်းကို 24 နာရီအတွင်း Live Classes page ရဲ့ 'မှတ်တမ်းများ' အပိုင်းနဲ့ သက်ဆိုင်ရာ သင်တန်းထဲမှာ တင်ပေးပါတယ်။ စာရင်းပေးထားသူတွေကို notification ဖြင့်လည်း အကြောင်းကြားပေးပါတယ်။" },
    { q: 'လက်မှတ်ကို အလုပ်ရှင်က ဘယ်လို အတည်ပြုနိုင်မလဲ?', a: "လက်မှတ်တိုင်းမှာ Certificate ID ပါပါတယ်။ Certificates page ကနေ 'စစ်ဆေးရန် Link' ကို ကူးပြီး CV သို့မဟုတ် LinkedIn မှာ ထည့်ထားရင် အလုပ်ရှင်က အဲဒီ link ကနေ တိုက်ရိုက် အတည်ပြုနိုင်ပါတယ်။" },
    { q: 'ငွေပြန်အမ်း (Refund) မူဝါဒက ဘယ်လိုလဲ?', a: 'သင်တန်း ဝယ်ပြီး 7 ရက်အတွင်း၊ သင်ခန်းစာ 20% ထက် ပိုမကြည့်ရသေးရင် အကြောင်းပြချက် မလိုဘဲ ငွေအပြည့် ပြန်အမ်းပေးပါတယ်။ Support ထံ message ပို့ပြီး တောင်းဆိုနိုင်ပါတယ်။' },
    { q: 'Assignment နောက်ဆုံးရက် ကျော်သွားရင် ဘာဖြစ်မလဲ?', a: "နောက်ကျမှ တင်ရင် rubric ထဲက 'အချိန်မီ တင်သွင်းမှု' 10 မှတ်ကို လျှော့ပါမယ်။ အကြောင်းခိုင်လုံရင် ဆရာထံ message ပို့ပြီး သက်တမ်းတိုးခွင့် တောင်းနိုင်ပါတယ်။" },
    { q: 'ဖုန်းနဲ့ ကြည့်လို့ရလား? Offline ရလား?', a: 'ဖုန်း၊ တက်ဘလက်၊ ကွန်ပျူတာ အားလုံးမှာ browser ကနေ ကြည့်နိုင်ပါတယ်။ သင်ခန်းစာ ဖိုင်တွေ (slides, starter code) ကို download လုပ်ပြီး offline လေ့ကျင့်နိုင်ပါတယ်။' },
];

export type SampleTestimonial = { name: string; init: string; color: string; city: string; course: string; text: string };

export const SAMPLE_TESTIMONIALS: SampleTestimonial[] = [
    { name: 'May Thandar', init: 'MT', color: '#ec4899', city: 'Yangon', course: 'JavaScript Deep Dive', text: 'အရင်က tutorial တွေ လိုက်ကြည့်ရင်း လမ်းပျောက်နေခဲ့တာ။ Codexa MM မှာ အခန်းလိုက် လေ့ကျင့်ခန်းတွေနဲ့ ဆရာ့ feedback ပါလာတော့ ၃ လအတွင်း ကိုယ်ပိုင် project ၂ ခု ပြီးအောင် လုပ်နိုင်ခဲ့ပါတယ်။' },
    { name: 'Zaw Lin Htet', init: 'ZL', color: '#f59e0b', city: 'Yangon', course: 'Python for Beginners', text: 'Programming ကို သုညကနေ စတာပါ။ မြန်မာလို ရှင်းပြထားတာမို့ concept တွေ မြန်မြန် နားလည်ပြီး quiz တွေက ကိုယ် ဘယ်နေရာ အားနည်းလဲဆိုတာ တန်းသိရပါတယ်။' },
    { name: 'Thiri Nanda', init: 'TN', color: '#6366f1', city: 'Mandalay', course: 'UI/UX Design with Figma', text: 'Figma ကို အခြေခံကနေ component, prototype အထိ စနစ်တကျ သင်ခဲ့ရတယ်။ ရလာတဲ့ လက်မှတ်ကို portfolio မှာ ထည့်ထားတာ အလုပ်လျှောက်တဲ့အခါ အထောက်အကူ အများကြီး ဖြစ်ပါတယ်။' },
    { name: 'Aung Khant Min', init: 'AK', color: '#38bdf8', city: 'Naypyidaw', course: 'Flutter Mobile Development', text: 'Live class မှာ ဆရာကို တိုက်ရိုက် မေးလို့ရတာနဲ့ မှတ်တမ်း ပြန်ကြည့်လို့ရတာ အဆင်အပြေဆုံးပါပဲ။ အလုပ်တစ်ဖက်နဲ့ သင်ရတာမို့ ကိုယ့်အချိန်နဲ့ကိုယ် စီမံရတာ လွယ်ပါတယ်။' },
];

export type SampleJob = {
    id: number;
    title: string;
    company: string;
    loc: string;
    type: string;
    salary: string;
    skills: string[];
    posted: string;
    path: string;
    desc: string;
    reqs: string[];
};

export const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Internship'];

export const SAMPLE_JOBS: SampleJob[] = [
    { id: 1, title: 'Junior Frontend Developer (React)', company: 'Thura Tech Solutions', loc: 'ရန်ကုန် · Hybrid', type: 'Full-time', salary: '800,000 – 1,200,000 ကျပ်', skills: ['React', 'JavaScript', 'CSS'], posted: 'နိုဝင်ဘာ 21', path: 'Frontend Developer လမ်းကြောင်း', desc: 'E-commerce product တွေအတွက် React UI တည်ဆောက်ရမယ့် အဖွဲ့မှာ ပါဝင်ရပါမယ်။ Senior developer တွေရဲ့ mentor စနစ်နဲ့ code review ပုံမှန် ရှိပါတယ်။', reqs: ['React.js Complete Course (သို့) Frontend လမ်းကြောင်း ပြီးထားသူ', 'Git/GitHub workflow နားလည်သူ', 'Portfolio project အနည်းဆုံး ၂ ခု ရှိသူ'] },
    { id: 2, title: 'Flutter Developer Intern', company: 'Wave Digital Labs', loc: 'Remote', type: 'Internship', salary: '300,000 ကျပ် + ထောက်ပံ့ကြေး', skills: ['Flutter', 'Dart', 'Firebase'], posted: 'နိုဝင်ဘာ 20', path: 'Mobile Developer လမ်းကြောင်း', desc: '၃ လ internship အတွင်း တကယ့် client app project မှာ ပါဝင် လုပ်ကိုင်ရပါမယ်။ ပြီးဆုံးရင် full-time အဖြစ် ဆက်လက် ခန့်အပ်နိုင်ချေ ရှိပါတယ်။', reqs: ['Flutter Mobile Development သင်တန်း ပြီးထားသူ', 'ကိုယ်ပိုင် app project ၁ ခု တည်ဆောက်ဖူးသူ', 'အပတ် ၅ ရက် အချိန်ပေးနိုင်သူ'] },
    { id: 3, title: 'Backend Developer (Laravel)', company: 'Mandalay Softworks', loc: 'မန္တလေး · On-site', type: 'Full-time', salary: '1,000,000 – 1,500,000 ကျပ်', skills: ['PHP', 'Laravel', 'MySQL'], posted: 'နိုဝင်ဘာ 19', path: 'Backend Developer လမ်းကြောင်း', desc: 'POS နဲ့ inventory system တွေအတွက် Laravel API တွေ တည်ဆောက် ထိန်းသိမ်းရပါမယ်။ Database design အတွေ့အကြုံကို ဦးစားပေးပါတယ်။', reqs: ['PHP & Laravel Framework သင်တန်း ပြီးထားသူ', 'MySQL query optimization အခြေခံ သိသူ', 'REST API project လုပ်ဖူးသူ'] },
    { id: 4, title: 'UI/UX Designer (Part-time)', company: 'Pixel Nest Studio', loc: 'Remote', type: 'Part-time', salary: 'Project အလိုက် ညှိနှိုင်း', skills: ['Figma', 'UI Design', 'Prototyping'], posted: 'နိုဝင်ဘာ 18', path: 'UI/UX Design လမ်းကြောင်း', desc: 'Startup client တွေအတွက် mobile app UI design project တွေကို အချိန်ပိုင်း လုပ်ကိုင်ရပါမယ်။ Portfolio ကို အဓိက ကြည့်ပြီး ရွေးချယ်ပါတယ်။', reqs: ['UI/UX Design with Figma သင်တန်း ပြီးထားသူ', 'Figma case study အနည်းဆုံး ၂ ခု ရှိသူ', 'Component system နားလည်သူ'] },
    { id: 5, title: 'Python Developer (Data)', company: 'DataBridge Myanmar', loc: 'ရန်ကုန် · Hybrid', type: 'Full-time', salary: '900,000 – 1,400,000 ကျပ်', skills: ['Python', 'SQL', 'Excel Automation'], posted: 'နိုဝင်ဘာ 16', path: 'Python လမ်းကြောင်း', desc: 'လုပ်ငန်းတွေရဲ့ data သန့်ရှင်းရေး၊ report automation script တွေ ရေးရပါမယ်။ Pandas အတွေ့အကြုံ ရှိရင် ပို ဦးစားပေးပါတယ်။', reqs: ['Python for Beginners + MySQL သင်တန်း ပြီးထားသူ', 'File/data processing project လုပ်ဖူးသူ', 'အင်္ဂလိပ် documentation ဖတ်နိုင်သူ'] },
    { id: 6, title: 'Remote Web Developer (Freelance Pool)', company: 'Codexa MM Partners', loc: 'Remote', type: 'Remote', salary: 'Project အလိုက် 400,000 ကျပ်မှ စတင်', skills: ['HTML/CSS', 'JavaScript', 'WordPress'], posted: 'နိုဝင်ဘာ 14', path: 'Frontend Developer လမ်းကြောင်း', desc: 'မိတ်ဖက် အေဂျင်စီတွေရဲ့ website project တွေကို freelance အဖြစ် တာဝန်ယူ လုပ်ကိုင်ရမယ့် pool ဖြစ်ပါတယ်။ Project အလိုက် ရွေးချယ် လက်ခံနိုင်ပါတယ်။', reqs: ['HTML & CSS Foundations ပြီးထားသူ', 'Responsive website ၃ ခုခန့် တည်ဆောက်ဖူးသူ', 'Deadline တိကျစွာ လုပ်နိုင်သူ'] },
];

export type SamplePath = {
    id: number;
    title: string;
    goal: string;
    grad: string;
    glyph: string;
    months: string;
    level: string;
    steps: string[];
    outcomes: string[];
};

export const SAMPLE_PATHS: SamplePath[] = [
    { id: 1, title: 'Web Developer လမ်းကြောင်း', goal: 'Frontend ကနေ Backend အထိ ပြည့်စုံတဲ့ web developer တစ်ဦး ဖြစ်ရန်', grad: 'linear-gradient(130deg,#0b3b5e,#0ea892)', glyph: '</>', months: '၅–၇ လ', level: 'Beginner → Advanced', steps: ['HTML & CSS Foundations', 'JavaScript Deep Dive', 'React.js Complete Course', 'Node.js API Development', 'PHP & Laravel Framework'], outcomes: ['Portfolio website နဲ့ web app ၃ ခု တည်ဆောက်ပြီး', 'React ဖြင့် modern frontend တည်ဆောက်နိုင်ခြင်း', 'Node.js / Laravel ဖြင့် API တည်ဆောက်နိုင်ခြင်း', 'Junior Web Developer အလုပ်များ လျှောက်ရန် အဆင်သင့်'] },
    { id: 2, title: 'Python & Data လမ်းကြောင်း', goal: 'Python ကို ကျွမ်းကျင်ပြီး data analysis လမ်းကြောင်းသို့ ဝင်ရောက်ရန်', grad: 'linear-gradient(130deg,#14532d,#22c55e)', glyph: 'Py', months: '၄–၆ လ', level: 'Beginner → Intermediate', steps: ['Python for Beginners', 'MySQL & Database Design'], outcomes: ['Python program များကို ကိုယ်တိုင် ရေးနိုင်ခြင်း', 'Database design နဲ့ SQL ကျွမ်းကျင်ခြင်း', 'Data project ၂ ခု portfolio တွင် ထည့်နိုင်ခြင်း'] },
    { id: 3, title: 'Mobile Developer လမ်းကြောင်း', goal: 'Flutter ဖြင့် Android / iOS app များ တည်ဆောက်ပြီး store ပေါ် တင်နိုင်ရန်', grad: 'linear-gradient(130deg,#123a6d,#38bdf8)', glyph: 'Fl', months: '၄–၅ လ', level: 'Beginner → Intermediate', steps: ['Python for Beginners', 'Flutter Mobile Development', 'Git, GitHub & Team Workflow'], outcomes: ['Dart နဲ့ Flutter အခြေခံ ခိုင်မာခြင်း', 'App ၂ ခု ကိုယ်တိုင် တည်ဆောက်ပြီး', 'Play Store / App Store တင်နည်း နားလည်ခြင်း'] },
    { id: 4, title: 'UI/UX Designer လမ်းကြောင်း', goal: 'Design အခြေခံကနေ professional UI/UX designer တစ်ဦး ဖြစ်ရန်', grad: 'linear-gradient(130deg,#831843,#ec4899)', glyph: 'UX', months: '၃–၄ လ', level: 'Beginner → Intermediate', steps: ['UI/UX Design with Figma', 'HTML & CSS Foundations', 'Git, GitHub & Team Workflow'], outcomes: ['Figma ကို ကျွမ်းကျင်စွာ အသုံးပြုနိုင်ခြင်း', 'Design system နဲ့ component library တည်ဆောက်နိုင်ခြင်း', 'Case study ၂ ခုပါ portfolio ပြင်ဆင်ပြီး'] },
];

// Map a backend Course model (as serialized by Inertia) to the shared
// CourseCard shape. Rating / students are not stored on the model yet, so
// they stay undefined and CourseCard omits them.
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

export function formatCount(n: number): string {
    return n.toLocaleString('en-US');
}

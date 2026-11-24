# Codexa MM

**Learn. Build. Innovate.** Codexa MM သည် မြန်မာနိုင်ငံအတွက် online learning နှင့် digital solutions platform တစ်ခုဖြစ်ပြီး Laravel backend နှင့် Inertia.js, React, TypeScript frontend ကို အသုံးပြုထားပါသည်။

> **လက်ရှိအခြေအနေ:** Public website, LMS, admin, client portal နှင့် finance ဆိုင်ရာ code များ ပါဝင်ပြီးဖြစ်သည်။ သို့သော် production deployment လမ်းညွှန်နှင့် CI workflow မရှိသေးပါ။ Seed data နှင့် test credentials များကို development မှာသာ သုံးပါ။ Production သို့မတင်မီ [implementation roadmap](todo.md) နှင့် စမ်းသပ်ချက်များကို စစ်ဆေးပါ။

## ပါဝင်သည့်အပိုင်းများ

- **Public website:** သင်တန်းနှင့် ဝန်ဆောင်မှုစာရင်း၊ portfolio၊ instructor၊ blog၊ FAQ၊ contact form၊ SEO၊ sitemap နှင့် certificate verification။
- **Codexa Academy:** Student နှင့် instructor portal၊ course curriculum၊ enrollment နှင့် learning progress၊ assignment၊ quiz၊ review၊ announcement၊ certificate၊ admin နှင့် moderation။
- **Codexa Solutions:** Service နှင့် lead စီမံခန့်ခွဲမှု၊ project၊ milestone၊ task၊ client document၊ support၊ feedback၊ quotation၊ invoice နှင့် payment record။
- **Admin/Operations:** User နှင့် role စီမံခန့်ခွဲမှု၊ content၊ settings၊ report၊ activity log၊ import၊ integration၊ scheduled campaign နှင့် live-class ဆိုင်ရာ code များ။

Screen သို့မဟုတ် route ရှိနေခြင်းတစ်ခုတည်းဖြင့် production မှာ workflow အပြည့်အဝ အောင်မြင်ကြောင်း မဆိုလိုပါ။ Payment provider နှင့် production ဝန်ဆောင်မှုအချို့အတွက် ထပ်မံပြင်ဆင်ရန် လိုနိုင်ပါသည်။

## နည်းပညာ

- PHP 8.3+ နှင့် Laravel 13
- Inertia.js, React 18, TypeScript
- Vite 8 နှင့် Tailwind CSS 4
- Local development အတွက် SQLite ကို default သုံးထားသည်
- Backend tests အတွက် Pest

## လိုအပ်ချက်များ

PHP 8.3+, Composer, Vite 8 နှင့်ကိုက်ညီသော Node.js (20.19+ သို့မဟုတ် 22.12+) နှင့် npm တို့ကို install လုပ်ပါ။ SQLite သုံးမည်ဆိုလျှင် PHP PDO/SQLite extension အပါအဝင် Laravel နှင့် Composer package များလိုအပ်သည့် PHP extensions များကို ဖွင့်ထားပါ။

## Local development စတင်ခြင်း

Repository root မှ အောက်ပါ command များကို run ပါ။

```bash
composer install
cp .env.example .env
```

Default database သည် SQLite ဖြစ်သည်။ Migration မလုပ်မီ database file ကို ဖန်တီးပါ။

```bash
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
```

Frontend package များ install လုပ်ပြီး production assets build လုပ်ပါ။

```bash
npm ci
npm run build
```

Laravel server ကို စတင်ပါ။

```bash
php artisan serve
```

ပြီးလျှင် `http://127.0.0.1:8000` ကို ဖွင့်ပါ။ Frontend hot reload အတွက် development လုပ်နေစဉ် terminal အသစ်တစ်ခုမှာ `npm run dev` ကို run ပါ။

### Seed လုပ်ထားသော development account များ

`php artisan db:seed` သည် admin, instructor, client နှင့် student development account များ ဖန်တီးပေးပါသည်။ Seeder ထဲက account များ၏ password သည် `password` ဖြစ်ပြီး ဥပမာ email များမှာ `admin@codexamm.test`, `instructor@codexamm.test`, `client@codexamm.test` နှင့် `student@codexamm.test` ဖြစ်သည်။

**ဤ credentials များကို source code မှတစ်ဆင့် အများမြင်နိုင်သဖြင့် production တွင် လုံးဝအသုံးမပြုပါနှင့်။** Public deployment တွင် အဆိုပါ account များကို seed မလုပ်ပါနှင့်။ Production account များကို လုံခြုံသည့် လုပ်ငန်းစဉ်ဖြင့် သီးခြားဖန်တီးပြီး unique password များ သတ်မှတ်ပါ။

## စမ်းသပ်ရန်

Backend test suite ကို run ပါ။

```bash
php artisan test
```

Frontend production build ကို စမ်းရန်။

```bash
npm run build
```

TypeScript configuration ကို `tsconfig.json` တွင် ထားရှိထားသည်။ `package.json` တွင် သီးခြား `typecheck` script မရှိသေးပါ။ CI ထဲတွင် အသုံးပြုမည့် TypeScript command ကို သတ်မှတ်ခြင်း သို့မဟုတ် script ထည့်ခြင်း လိုအပ်ပါသည်။ အခြား checklist များကို [`todo.md`](todo.md) တွင် ကြည့်ပါ။

## Configuration သတိပြုရန်

- `.env.example` တွင် local SQLite၊ database session/cache/queue နှင့် log mail ကို သတ်မှတ်ထားသည်။ Production အတွက် mail၊ database၊ file storage၊ queue worker၊ cache နှင့် scheduler တို့ကို သီးခြား configure လုပ်ပါ။
- `.env`, production key, API token သို့မဟုတ် အသုံးပြုသူ၏ data များကို Git ထဲသို့ မတင်ပါနှင့်။
- Scheduled email campaign များအတွက် scheduler က တစ်မိနစ်လျှင် တစ်ကြိမ် command dispatch လုပ်မည်ဟု သတ်မှတ်ထားသည်။ Production မှာ scheduler/worker ကို ပြင်ဆင်ပြီး စောင့်ကြည့်ရန် လိုသည်။
- User upload နှင့် document များကို မဖွင့်မီ private file authorization နှင့် storage configuration ကို စစ်ပါ။

## စာရွက်စာတမ်း

- [Master implementation plan နှင့် launch checklist](todo.md)
- [English README](README.md)

Contribution မလုပ်မီ [`AGENTS.md`](AGENTS.md) နှင့် [`CLAUDE.md`](CLAUDE.md) ကို ဖတ်ပါ။ ပြောင်းလဲမှုအလိုက် test များ ထည့်/ပြင်ပြီး သက်ဆိုင်ရာ check များကို run ပါ။ Feature အခြေအနေပြောင်းလဲလျှင် roadmap ကိုလည်း update လုပ်ပါ။

## လုံခြုံရေးနှင့် လိုင်စင်

Security အားနည်းချက် အသေးစိတ်ကို public issue တွင် မတင်ပါနှင့်။ Repository maintainer ထံ private channel မှ ဆက်သွယ်ပါ။ လက်ရှိ repository တွင် သီးခြား `LICENSE` file မတွေ့ရပါ။ Code ကို ပြန်လည်ဖြန့်ဝေခြင်း သို့မဟုတ် ပြန်လည်အသုံးပြုခြင်းမပြုမီ maintainer ထံ လိုင်စင်အခြေအနေ မေးမြန်းပါ။

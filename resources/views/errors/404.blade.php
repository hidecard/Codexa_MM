<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>စာမျက်နှာ မတွေ့ပါ · Codexa MM</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+Myanmar:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #070d1f; color: #e9eefb; font-family: 'Inter', 'Noto Sans Myanmar', system-ui, sans-serif; }
        .card { width: 100%; max-width: 560px; text-align: center; background: #0d1730; border: 1px solid #1e2c52; border-radius: 24px; padding: 40px 32px; }
        .code { font-family: ui-monospace, monospace; font-weight: 800; font-size: 4.2rem; line-height: 1; color: #2dd4bf; }
        h1 { font-size: 1.45rem; font-weight: 800; letter-spacing: -0.01em; margin-top: 16px; }
        p { color: #97a6c6; font-size: .92rem; line-height: 1.7; margin-top: 8px; }
        form { position: relative; max-width: 420px; margin: 24px auto 0; }
        form svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #67779c; }
        input[type="search"] { width: 100%; padding: 12px 16px 12px 44px; font-size: .92rem; color: #e9eefb; background: #070d1f; border: 1px solid #1e2c52; border-radius: 12px; outline: none; font-family: inherit; }
        input[type="search"]:focus { border-color: #2dd4bf; }
        .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px; }
        .btn { display: inline-flex; align-items: center; padding: 10px 20px; border-radius: 12px; font-size: .9rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; font-family: inherit; }
        .btn-accent { background: #2dd4bf; color: #04241f; }
        .btn-ghost { background: transparent; color: #e9eefb; border: 1px solid #1e2c52; }
        .chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 24px; }
        .chip { padding: 6px 14px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: #97a6c6; background: #12234a; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <p class="code">404</p>
        <h1>စာမျက်နှာ မတွေ့ပါ</h1>
        <p>သင် ရှာနေတဲ့ စာမျက်နှာက ရွှေ့ပြောင်းသွားတာ ဒါမှမဟုတ် မရှိတော့တာ ဖြစ်နိုင်ပါတယ်။ အောက်ကနေ ဆက်သွားနိုင်ပါတယ်။</p>
        <form id="nf-search" action="{{ url('/courses') }}" method="get">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="search" name="q" placeholder="သင်တန်း ရှာကြည့်ပါ…" aria-label="သင်တန်း ရှာရန်">
        </form>
        <div class="row">
            <button class="btn btn-accent" type="submit" form="nf-search">ရှာဖွေရန်</button>
            <a class="btn btn-ghost" href="{{ url('/') }}">ပင်မစာမျက်နှာ</a>
            <a class="btn btn-ghost" href="{{ url('/courses') }}">သင်တန်းများ</a>
        </div>
        <div class="chips">
            <a class="chip" href="{{ url('/faq') }}">အကူအညီ &amp; FAQ</a>
            <a class="chip" href="{{ url('/contact') }}">ဆက်သွယ်ရန်</a>
            <a class="chip" href="{{ url('/') }}">Landing Page</a>
        </div>
    </div>
</body>
</html>

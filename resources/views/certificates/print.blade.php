<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>လက်မှတ် · {{ $certificate->enrollment?->course?->title ?? $certificate->certificate_number }} — Codexa MM</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background: #f1f5f9; color: #0f172a; }
        .toolbar { display: flex; gap: 12px; justify-content: center; padding: 20px; }
        .toolbar button, .toolbar a { border: 0; border-radius: 10px; padding: 12px 22px; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
        .toolbar .print-btn { background: #0f766e; color: #fff; }
        .toolbar .back-link { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
        .sheet { max-width: 960px; margin: 0 auto 32px; background: #fff; border: 4px double #d9a441; border-radius: 18px; padding: 56px 48px; text-align: center; }
        .brand { font-size: 12px; font-weight: 800; letter-spacing: .35em; text-transform: uppercase; color: #0f766e; }
        .award { font-size: 48px; margin: 16px 0 0; }
        h1 { margin: 12px 0 0; font-size: 32px; }
        .sub { margin: 6px 0 0; font-size: 14px; color: #64748b; }
        .label { margin: 32px 0 0; font-size: 13px; color: #64748b; }
        .name { margin: 8px 0 0; font-size: 28px; font-weight: 800; }
        .course { margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #0f766e; }
        .meta { display: flex; flex-wrap: wrap; gap: 16px 48px; justify-content: center; max-width: 640px; margin: 36px auto 0; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 14px; }
        .meta .k { font-size: 11px; color: #94a3b8; }
        .meta .v { font-weight: 700; font-family: ui-monospace, monospace; }
        .verify { margin-top: 28px; font-size: 12px; color: #94a3b8; }
        @media print {
            body { background: #fff; }
            .toolbar { display: none !important; }
            .sheet { margin: 0; max-width: none; border-width: 3px; border-radius: 0; padding: 40px 32px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button type="button" class="print-btn" onclick="window.print()">လက်မှတ် ပုံနှိပ်ရန် / PDF အဖြစ် သိမ်းရန်</button>
        <a class="back-link" href="{{ route('student.certificates.show', $certificate) }}">လက်မှတ်စာမျက်နှာ သို့ ပြန်သွားရန်</a>
    </div>

    <div class="sheet">
        <p class="brand">Codexa MM</p>
        <p class="award">&#127942;</p>
        <h1>သင်တန်း ပြီးစီးကြောင်း လက်မှတ်</h1>
        <p class="sub">Certificate of Completion</p>

        <p class="label">ဤလက်မှတ်ကို အောက်ပါ ကျောင်းသားအား ချီးမြှင့်ပါသည်</p>
        <p class="name">{{ $studentName }}</p>

        <p class="label">အောက်ပါ သင်တန်းကို အောင်မြင်စွာ ပြီးစီးခဲ့ပါသည်</p>
        <p class="course">{{ $certificate->enrollment?->course?->title ?? '—' }}</p>

        <div class="meta">
            <div><p class="k">လက်မှတ် နံပါတ်</p><p class="v">{{ $certificate->certificate_number }}</p></div>
            @if ($certificate->issued_at)
                <div><p class="k">ထုတ်ပေးသည့် ရက်စွဲ</p><p class="v">{{ $certificate->issued_at->format('Y-m-d') }}</p></div>
            @endif
            @if ($certificate->verification?->verification_code)
                <div><p class="k">အတည်ပြု ကုဒ်</p><p class="v">{{ $certificate->verification->verification_code }}</p></div>
            @endif
        </div>

        @if ($certificate->verification?->verification_code)
            <p class="verify">အတည်ပြုရန် — {{ url('/verify/'.$certificate->verification->verification_code) }}</p>
        @endif
    </div>
</body>
</html>

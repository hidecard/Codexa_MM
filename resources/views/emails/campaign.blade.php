<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 20px; font-weight: 800; color: #2563eb; margin: 0 0 16px;">Codexa MM</p>

    <p>Hi {{ $recipient->name }},</p>

    <div style="white-space: pre-wrap;">{{ $campaign->body }}</div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    <p style="font-size: 13px; color: #64748b;">
        You received this email because you have a Codexa MM account.
        If you no longer want these emails, contact support@codexamm.com.
    </p>
    @isset($tracking)
        {!! $tracking->pixelImgTag() !!}
    @endisset
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 20px; font-weight: 800; color: #2563eb; margin: 0 0 16px;">Codexa MM</p>

    <p>Hi {{ $user->name }},</p>

    <p>You have been invited to join <strong>Codexa MM</strong> as a staff member. A staff account has been created for you — set your password using the link below to get started.</p>

    <p style="margin: 24px 0;">
        <a href="{{ $setupUrl }}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 8px;">Set your password</a>
    </p>

    <p style="font-size: 13px; color: #64748b;">This link expires in 7 days. If the button does not work, copy and paste this URL into your browser:</p>
    <p style="font-size: 13px; color: #64748b; word-break: break-all;">{{ $setupUrl }}</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    <p style="font-size: 13px; color: #64748b;">If you were not expecting this invitation, you can safely ignore this email.</p>
</body>
</html>

# Supabase Auth Email Branding

Use this to replace the default "Supabase Auth" magic-link email, which looks untrusted to new veterans.

## Dashboard Changes

1. Open Supabase Dashboard.
2. Go to **Authentication > Email Templates**.
3. Edit the **Magic Link / OTP** template.
4. Set the subject to:

```text
Veteran Journey Navigator secure sign-in link
```

5. Paste the HTML from `magic-link.html` into the template body.
6. Save.

Supabase's template variables include `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`, `{{ .Data }}`, and `{{ .Email }}`. This template uses `{{ .ConfirmationURL }}` for the one-click sign-in link.

## Sender Name

The template changes the email content and subject. To remove "Supabase Auth" as the sender, configure **Authentication > SMTP Settings / Custom SMTP** with a real sender, for example:

```text
Veteran Journey Navigator <no-reply@yourdomain.com>
```

Supabase recommends custom SMTP for production and mission-critical apps. Providers that work include Resend, AWS SES, Postmark, SendGrid, ZeptoMail, and Brevo.

## Suggested Test

Send a sign-in link to a test Yahoo/Gmail address and verify:

- Sender shows `Veteran Journey Navigator`, not `Supabase Auth`.
- Subject says `Veteran Journey Navigator secure sign-in link`.
- Body clearly says why the email was sent.
- The sign-in button completes login and redirects to `/auth/callback`.

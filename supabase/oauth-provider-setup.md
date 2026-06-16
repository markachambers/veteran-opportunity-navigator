# Supabase OAuth Provider Setup

The app UI supports:

- Continue with Google
- Continue with Apple
- Email magic-link registration/sign-in

The buttons are in app code, but Google and Apple must also be enabled in the Supabase dashboard.

## Supabase Dashboard

1. Open Supabase Dashboard.
2. Go to **Authentication > Providers**.
3. Enable **Google**.
4. Add the Google OAuth client ID and client secret.
5. Enable **Apple**.
6. Add the Apple service ID / client ID, team ID, key ID, and private key.
7. Confirm your **Site URL** is:

```text
https://veteran-opportunity-navigator.vercel.app
```

8. Confirm redirect URLs include:

```text
https://veteran-opportunity-navigator.vercel.app/auth/callback
```

For local testing, also allow:

```text
http://localhost:3000/auth/callback
```

## Provider Consoles

In Google Cloud Console and Apple Developer, make sure the allowed callback/redirect URL matches the Supabase callback URL shown in the Supabase provider setup screen. Supabase routes the provider callback first, then redirects back to `/auth/callback`.

## Notes

Email magic-link sign-in still works as a fallback. For production trust, also configure custom SMTP and branded auth email templates.

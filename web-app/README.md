# Veteran Journey Navigator Web App

This folder is the migration target for the static prototype. It uses:

- Next.js App Router
- Supabase Auth for Google / Apple login
- Supabase Postgres for per-veteran profile data, notes, conditions, and document metadata
- Supabase Storage for private evidence document uploads

The original static prototype remains in the repository root as the visual/product blueprint.

## 1. Create / Configure Supabase

1. Create a Supabase project.
2. In the SQL Editor, run:

   `../supabase/migrations/0001_initial_veteran_journey.sql`

3. Confirm the private Storage bucket exists:

   `evidence-documents`

4. In **Authentication > Providers**, enable:

   - Google
   - Apple

5. Add redirect URLs in Supabase Auth:

   - `http://localhost:3000/auth/callback`
   - your deployed URL later, for example `https://your-domain.com/auth/callback`

## 2. Configure Google Login

In Google Cloud:

1. Create an OAuth Web Client.
2. Add JavaScript origin:

   `http://localhost:3000`

3. Add redirect URI from the Supabase Google provider page.
4. Copy Client ID / Secret into Supabase Auth > Google provider.

## 3. Configure Apple Login

In Apple Developer:

1. Create/configure Sign in with Apple.
2. Add the Supabase Apple callback URL from the Supabase provider page.
3. Add Service ID, Team ID, Key ID, and private key in Supabase.
4. Calendar a 6-month secret/key rotation review if using Apple's web OAuth flow.

## 4. Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the Supabase **publishable** key for the browser. Never put the secret/service-role key in `NEXT_PUBLIC_*`.

## 5. Run

```bash
npm install
npm run dev
```

Then open:

`http://localhost:3000`

## Security Notes

- Every public table has RLS enabled.
- Every user-owned table scopes rows to `auth.uid()`.
- Evidence files are stored under `user_id/...` paths in a private bucket.
- Storage policies only allow authenticated users to access their own folder.
- This is ready for a controlled tester MVP, not production compliance.

Before broad release, add:

- Privacy policy and consent screens
- delete/export-my-data flows
- malware scanning for uploads
- audit logs
- document parsing queue
- signed URLs or server-mediated document retrieval
- review by an attorney/privacy specialist familiar with medical and veteran-benefit records

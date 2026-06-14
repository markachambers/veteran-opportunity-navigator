# Migration To Supabase

We are moving from a local static prototype to a real multi-user web app.

## Current Prototype

The root `index.html`, `src/main.js`, and `src/styles.css` are still the product blueprint. They prove the desired user experience:

- veteran journey dashboard
- knowledge vault
- evidence matrix
- upload intake
- voice/typed notes
- simulated Apple/Google sign-in
- per-user local prototype state

## New Web App

The `web-app/` folder starts the real implementation:

- Next.js app
- Supabase OAuth login
- Supabase database rows scoped by signed-in user
- private document uploads
- saved voice/typed notes

## Recommended Build Order

1. Create Supabase project.
2. Run the SQL migration.
3. Configure Google OAuth first.
4. Configure Apple OAuth after Google works.
5. Copy env vars into `web-app/.env.local`.
6. Run the Next.js app locally.
7. Test with Mark plus two trusted veterans.
8. Port the richer static dashboard components into React one module at a time.

## What Not To Do Yet

Do not upload real sensitive records until:

- the Supabase project uses real OAuth
- RLS has been verified with two separate accounts
- private storage access is tested
- delete/export controls are present
- consent language is visible

## Lovable

Lovable is optional. It can help prototype screens, but this repo now has the more durable foundation: Next.js + Supabase.

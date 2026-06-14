# Supabase Migration Notes

Run `migrations/0001_initial_veteran_journey.sql` in your Supabase SQL editor.

The migration creates:

- `profiles`
- `documents`
- `voice_notes`
- `veteran_conditions`
- `evidence_items`
- `life_events`
- `opportunity_reviews`
- private Storage bucket `evidence-documents`
- RLS policies for user-owned data
- Storage policies for per-user private evidence folders

The schema follows the current Supabase guidance that newly created tables may need explicit grants for the `authenticated` role, with RLS enabled for row isolation.

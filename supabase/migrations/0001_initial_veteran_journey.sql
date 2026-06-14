-- Veteran Journey Navigator initial Supabase schema.
-- Run in the Supabase SQL editor or through the Supabase CLI after creating a project.

create schema if not exists app_private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  branch text,
  state text,
  current_rating text,
  service_status text,
  work_status text,
  dependent_status text,
  permanent_total_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  file_name text not null,
  file_path text not null,
  status text not null default 'uploaded',
  tags text[] not null default '{}',
  linked_conditions text[] not null default '{}',
  linked_events text[] not null default '{}',
  extracted_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  transcript text not null,
  source text not null default 'typed_or_browser_voice',
  created_at timestamptz not null default now()
);

create table if not exists public.veteran_conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  va_service_connected boolean not null default false,
  ssdi_recognized boolean not null default false,
  current_rating text,
  evidence_readiness text not null default 'missing',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  condition_id uuid references public.veteran_conditions(id) on delete cascade,
  label text not null,
  status text not null default 'missing',
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date text,
  title text not null,
  detail text,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  opportunity_level text not null default 'investigate',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function app_private.set_updated_at();

create trigger veteran_conditions_set_updated_at
before update on public.veteran_conditions
for each row execute function app_private.set_updated_at();

create trigger evidence_items_set_updated_at
before update on public.evidence_items
for each row execute function app_private.set_updated_at();

create trigger life_events_set_updated_at
before update on public.life_events
for each row execute function app_private.set_updated_at();

create trigger opportunity_reviews_set_updated_at
before update on public.opportunity_reviews
for each row execute function app_private.set_updated_at();

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.voice_notes enable row level security;
alter table public.veteran_conditions enable row level security;
alter table public.evidence_items enable row level security;
alter table public.life_events enable row level security;
alter table public.opportunity_reviews enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.voice_notes to authenticated;
grant select, insert, update, delete on public.veteran_conditions to authenticated;
grant select, insert, update, delete on public.evidence_items to authenticated;
grant select, insert, update, delete on public.life_events to authenticated;
grant select, insert, update, delete on public.opportunity_reviews to authenticated;

create policy "profiles are owned by the signed-in user"
on public.profiles
for all to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "documents are owned by the signed-in user"
on public.documents
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "voice notes are owned by the signed-in user"
on public.voice_notes
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "conditions are owned by the signed-in user"
on public.veteran_conditions
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "evidence items are owned by the signed-in user"
on public.evidence_items
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "life events are owned by the signed-in user"
on public.life_events
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "opportunity reviews are owned by the signed-in user"
on public.opportunity_reviews
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('evidence-documents', 'evidence-documents', false)
on conflict (id) do nothing;

create policy "users can upload their own evidence files"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'evidence-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users can read their own evidence files"
on storage.objects
for select to authenticated
using (
  bucket_id = 'evidence-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users can update their own evidence files"
on storage.objects
for update to authenticated
using (
  bucket_id = 'evidence-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'evidence-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users can delete their own evidence files"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'evidence-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

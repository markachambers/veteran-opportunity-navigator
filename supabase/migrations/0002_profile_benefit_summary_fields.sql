-- Adds structured profile fields that keep VA rating, rank, and benefit status separate.
-- Run this in the Supabase SQL editor after 0001_initial_veteran_journey.sql.

alter table public.profiles
  add column if not exists rank_pay_grade text,
  add column if not exists monthly_award text,
  add column if not exists va_loan_status text,
  add column if not exists federal_preference_status text,
  add column if not exists fmp_status text;

update public.profiles
set
  rank_pay_grade = coalesce(rank_pay_grade, current_rating),
  current_rating = null
where current_rating ~ '^(E|O|W)-?[0-9]$';

update public.profiles
set state = 'Florida'
where upper(state) = 'FL';

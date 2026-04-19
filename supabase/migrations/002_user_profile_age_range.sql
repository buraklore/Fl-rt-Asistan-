-- Migration 002 — user_profiles.age_range
-- Run in Supabase Dashboard → SQL Editor
--
-- Why: user_profiles originally stored dob (date of birth) but UX-wise
-- users almost always prefer giving an age *range*. We add a text column
-- for the range and keep dob around for future precise-age needs.

alter table public.user_profiles
  add column if not exists age_range text;

-- Optional: index if you start filtering by age_range later. Not needed now.

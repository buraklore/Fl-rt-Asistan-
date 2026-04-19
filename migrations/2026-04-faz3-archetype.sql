-- Flört Asistanı — Faz 3 Migration
-- Çalıştırma: Supabase Studio → SQL Editor → yapıştır + Run
-- Bu migration'ı çalıştırmadan deploy edersen AI çağrıları fail olur.

-- USER PROFILES: archetype (own + attracted-to)
alter table public.user_profiles
  add column if not exists own_dynamic_style text,
  add column if not exists own_expression_style text,
  add column if not exists own_relationship_energy text,
  add column if not exists attracted_to_dynamic_styles text[],
  add column if not exists attracted_to_expression_styles text[],
  add column if not exists attracted_to_energies text[];

-- TARGET PROFILES: archetype (observed) + coaching advice
alter table public.target_profiles
  add column if not exists dynamic_style text,
  add column if not exists expression_style text,
  add column if not exists relationship_energy text,
  add column if not exists confidence_detail jsonb,
  add column if not exists coaching_advice jsonb;

-- RELATIONSHIP SCORES: confidence
alter table public.relationship_scores
  add column if not exists confidence jsonb;

-- CONFLICT ANALYSES: context_note + confidence
alter table public.conflict_analyses
  add column if not exists context_note text,
  add column if not exists confidence jsonb;

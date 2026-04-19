-- RizzAI — Faz 3 Migration
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

-- TARGET PROFILES: archetype (observed)
alter table public.target_profiles
  add column if not exists dynamic_style text,
  add column if not exists expression_style text,
  add column if not exists relationship_energy text,
  add column if not exists confidence_detail jsonb;

-- RELATIONSHIP SCORES: confidence
alter table public.relationship_scores
  add column if not exists confidence jsonb;

-- CONFLICT ANALYSES: context_note + confidence
alter table public.conflict_analyses
  add column if not exists context_note text,
  add column if not exists confidence jsonb;

-- Optional: add check constraints for enum consistency
-- (skipped because Supabase JS client tolerates free strings and enforcement
-- is handled at the Zod layer in the API routes — simpler migration path.)

-- ============================================================================
-- RizzAI — Initial Schema
-- Run via Supabase SQL Editor or `supabase db push` CLI
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================================================
-- Enums
-- ============================================================================

create type gender as enum ('male', 'female', 'nonbinary', 'unspecified');
create type chat_role as enum ('user', 'assistant', 'system');

-- ============================================================================
-- User profile (extends auth.users with our app-specific fields)
-- ============================================================================

create table public.user_profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  locale             text default 'tr',
  dob                date,
  gender             gender,
  interests          text[] default '{}',
  communication_style text,
  attachment_style   text,
  relationship_goal  text,
  raw_bio            text,
  embedding          vector(1536),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Auto-create profile row when a new auth.users row is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Target profiles (the person the user cares about)
-- ============================================================================

create table public.target_profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text,
  relation              text not null,
  gender                gender,
  age_range             text,
  interests             text[] default '{}',
  behaviors             text[] default '{}',
  context_notes         text,

  personality_type      text,
  big5                  jsonb,
  attachment_style      text,
  communication_style   text,
  attraction_triggers   text[] default '{}',
  analysis_version      int default 0,
  analysis_confidence   real,

  embedding             vector(1536),

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  deleted_at            timestamptz
);

create index target_profiles_user_id_idx on public.target_profiles (user_id) where deleted_at is null;
create index target_profiles_updated_at_idx on public.target_profiles (updated_at desc);

-- ============================================================================
-- Chat Coach sessions
-- ============================================================================

create table public.chat_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  target_id  uuid not null references public.target_profiles(id) on delete cascade,
  title      text,
  created_at timestamptz default now()
);

create index chat_sessions_user_target_idx on public.chat_sessions (user_id, target_id);

create table public.chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        chat_role not null,
  content     text not null,
  tokens_in   int,
  tokens_out  int,
  model       text,
  embedding   vector(1536),
  created_at  timestamptz default now()
);

create index chat_messages_session_created_idx on public.chat_messages (session_id, created_at);

-- ============================================================================
-- Message Generator history
-- ============================================================================

create table public.message_generations (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  target_id         uuid references public.target_profiles(id) on delete set null,
  incoming_message  text not null,
  context_note      text,
  tones_requested   text[] not null,
  replies           jsonb not null,
  model             text not null,
  prompt_version    text not null,
  latency_ms        int,
  input_tokens      int,
  output_tokens     int,
  selected_tone     text,
  created_at        timestamptz default now()
);

create index message_generations_user_created_idx on public.message_generations (user_id, created_at desc);

-- ============================================================================
-- Conflict Analyzer
-- ============================================================================

create table public.conflict_analyses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  target_id      uuid references public.target_profiles(id) on delete set null,
  chat_log       text not null,
  who_escalated  text,
  emotions       jsonb,
  root_cause     text,
  fix_message    text,
  severity       int,
  created_at     timestamptz default now()
);

-- ============================================================================
-- Relationship Score (historical; latest per target is the one that matters)
-- ============================================================================

create table public.relationship_scores (
  id             uuid primary key default uuid_generate_v4(),
  target_id      uuid not null references public.target_profiles(id) on delete cascade,
  compatibility  int not null check (compatibility between 0 and 100),
  risks          jsonb default '[]'::jsonb,
  strengths      jsonb default '[]'::jsonb,
  summary        text,
  computed_at    timestamptz default now()
);

create index relationship_scores_target_computed_idx on public.relationship_scores (target_id, computed_at desc);

-- ============================================================================
-- Daily Hook Deliveries
-- ============================================================================

create table public.hook_deliveries (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  target_id      uuid references public.target_profiles(id) on delete set null,
  category       text,
  rendered_text  text not null,
  delivered_at   timestamptz default now(),
  acked_at       timestamptz,
  action         text
);

create index hook_deliveries_user_delivered_idx on public.hook_deliveries (user_id, delivered_at desc);

-- ============================================================================
-- Subscription (Stripe, etc.) — opsiyonel MVP'de
-- ============================================================================

create table public.subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  provider           text not null,
  external_id        text not null,
  plan               text not null,
  status             text not null,
  current_period_end timestamptz,
  cancel_at          timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ============================================================================
-- Usage counters (free tier metering)
-- ============================================================================

create table public.usage_counters (
  user_id      uuid not null references auth.users(id) on delete cascade,
  feature      text not null,
  window_start date not null,
  count        int not null default 0,
  primary key (user_id, feature, window_start)
);

-- Atomic increment RPC — avoids race conditions in quota enforcement.
-- Returns the new count after increment.
create or replace function public.increment_usage(
  p_user_id uuid,
  p_feature text
) returns int as $$
declare
  v_count int;
begin
  insert into public.usage_counters (user_id, feature, window_start, count)
  values (p_user_id, p_feature, current_date, 1)
  on conflict (user_id, feature, window_start)
    do update set count = usage_counters.count + 1
  returning count into v_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- Moderation audit
-- ============================================================================

create table public.moderation_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete set null,
  input      text,
  verdict    text not null,
  reasons    text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.set_updated_at();
create trigger target_profiles_updated_at before update on public.target_profiles
  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

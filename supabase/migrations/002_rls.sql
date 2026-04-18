-- ============================================================================
-- Row-Level Security — users can ONLY access their own rows.
-- Without RLS enabled + these policies, anyone with the anon key could read
-- everyone's data. This is the #1 Supabase prod misconfig — don't skip.
-- ============================================================================

-- Enable RLS on every user-owned table
alter table public.user_profiles        enable row level security;
alter table public.target_profiles      enable row level security;
alter table public.chat_sessions        enable row level security;
alter table public.chat_messages        enable row level security;
alter table public.message_generations  enable row level security;
alter table public.conflict_analyses    enable row level security;
alter table public.relationship_scores  enable row level security;
alter table public.hook_deliveries      enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.usage_counters       enable row level security;
alter table public.moderation_logs      enable row level security;

-- ============================================================================
-- user_profiles — user sees only their own
-- ============================================================================

create policy "users read own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "users update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- insert is done by trigger (security definer), no policy needed

-- ============================================================================
-- target_profiles
-- ============================================================================

create policy "users read own targets" on public.target_profiles
  for select using (auth.uid() = user_id);

create policy "users insert own targets" on public.target_profiles
  for insert with check (auth.uid() = user_id);

create policy "users update own targets" on public.target_profiles
  for update using (auth.uid() = user_id);

create policy "users delete own targets" on public.target_profiles
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- chat_sessions
-- ============================================================================

create policy "users read own chat sessions" on public.chat_sessions
  for select using (auth.uid() = user_id);

create policy "users insert own chat sessions" on public.chat_sessions
  for insert with check (auth.uid() = user_id);

create policy "users delete own chat sessions" on public.chat_sessions
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- chat_messages — join through session to check ownership
-- ============================================================================

create policy "users read messages in own sessions" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "users insert messages in own sessions" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- message_generations
-- ============================================================================

create policy "users read own generations" on public.message_generations
  for select using (auth.uid() = user_id);

create policy "users insert own generations" on public.message_generations
  for insert with check (auth.uid() = user_id);

create policy "users update own generations" on public.message_generations
  for update using (auth.uid() = user_id);

-- ============================================================================
-- conflict_analyses
-- ============================================================================

create policy "users read own conflicts" on public.conflict_analyses
  for select using (auth.uid() = user_id);

create policy "users insert own conflicts" on public.conflict_analyses
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- relationship_scores — join through target
-- ============================================================================

create policy "users read scores for own targets" on public.relationship_scores
  for select using (
    exists (
      select 1 from public.target_profiles
      where target_profiles.id = relationship_scores.target_id
        and target_profiles.user_id = auth.uid()
    )
  );

create policy "users insert scores for own targets" on public.relationship_scores
  for insert with check (
    exists (
      select 1 from public.target_profiles
      where target_profiles.id = relationship_scores.target_id
        and target_profiles.user_id = auth.uid()
    )
  );

-- ============================================================================
-- hook_deliveries
-- ============================================================================

create policy "users read own hooks" on public.hook_deliveries
  for select using (auth.uid() = user_id);

create policy "users update own hooks" on public.hook_deliveries
  for update using (auth.uid() = user_id);

-- inserts are done by server (service role), bypasses RLS

-- ============================================================================
-- subscriptions — read-only for users; writes come from webhooks (service role)
-- ============================================================================

create policy "users read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================================
-- usage_counters — read-only for users; writes via RPC (security definer)
-- ============================================================================

create policy "users read own usage" on public.usage_counters
  for select using (auth.uid() = user_id);

-- ============================================================================
-- moderation_logs — users can read their own audit trail
-- ============================================================================

create policy "users read own moderation logs" on public.moderation_logs
  for select using (auth.uid() = user_id);

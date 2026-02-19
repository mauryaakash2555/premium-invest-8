-- Onboarding event log: tracks step completion, skip, assist actions.
-- Safe to apply multiple times (uses IF NOT EXISTS).

create extension if not exists pgcrypto;

create table if not exists onboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  session_id text null,
  step_number int not null,
  action_type text not null check (action_type in ('complete','skip','assist')),
  skip_reason text null,
  meta jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_events_user_idx on onboarding_events (user_id);
create index if not exists onboarding_events_session_idx on onboarding_events (session_id);
create index if not exists onboarding_events_step_idx on onboarding_events (step_number, action_type);

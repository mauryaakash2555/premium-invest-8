-- Onboarding leads: public traffic conversion from onboarding page.
-- Safe to apply multiple times (uses IF NOT EXISTS).

create extension if not exists pgcrypto;

create table if not exists onboarding_leads (
  id uuid primary key default gen_random_uuid(),
  name text null,
  phone text null,
  email text null,
  step_stuck int null,
  source text null default 'onboarding_public',
  created_at timestamptz not null default now()
);

create index if not exists onboarding_leads_email_idx on onboarding_leads (email);
create index if not exists onboarding_leads_phone_idx on onboarding_leads (phone);


-- Onboarding clicks: monetisation tracking (whatsapp / advisor_call / sip_start).

create table if not exists onboarding_clicks (
  id uuid primary key default gen_random_uuid(),
  step_number int null,
  click_type text not null,
  user_id text null,
  session_id text null,
  meta jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_clicks_type_idx on onboarding_clicks (click_type);
create index if not exists onboarding_clicks_step_idx on onboarding_clicks (step_number);

-- BM Wealth AI Bot - Micro MVP schema
-- Run this in Supabase SQL Editor (staging project).

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  lead_score integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  message text,
  sender text check (sender in ('user', 'bot')),
  created_at timestamp with time zone default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  event_type text,
  data jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_conversations_lead_created on public.conversations(lead_id, created_at desc);
create index if not exists idx_events_lead_created on public.events(lead_id, created_at desc);


-- Affiliate tracking (FEATURE 10)
-- Note: All initial links can be placeholders until real affiliate partnerships are available.

create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  category text, -- 'trading', 'mutual_fund', 'insurance'
  affiliate_url text,
  commission_rate numeric,
  commission_type text, -- 'per_signup', 'percentage', 'fixed'
  is_active boolean default true,
  placeholder boolean default false, -- true until real link
  created_at timestamp with time zone default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliate_links(id),
  lead_id uuid references public.leads(id) on delete set null,
  platform text,
  clicked_at timestamp with time zone default now(),
  converted boolean default false,
  conversion_amount numeric,
  converted_at timestamp with time zone
);

create index if not exists idx_clicks_platform on public.affiliate_clicks(platform);
create index if not exists idx_clicks_lead on public.affiliate_clicks(lead_id);


-- Email notifications (FEATURE 12)
create table if not exists public.email_preferences (
  id uuid primary key,
  email_address text not null,
  hot_lead_alerts boolean default true,
  daily_summary boolean default true,
  weekly_summary boolean default true,
  conversion_alerts boolean default true,
  error_alerts boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Singleton row (used by app code as a fixed id)
insert into public.email_preferences (id, email_address)
values ('00000000-0000-0000-0000-000000000001', 'akash@bmwealth.co.in')
on conflict (id) do nothing;



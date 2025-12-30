-- BM Wealth AI Bot - Micro MVP schema
-- Run this in Supabase SQL Editor (staging project).

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
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



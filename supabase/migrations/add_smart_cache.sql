-- Add Smart Cache table (persistent Q&A cache)

create table if not exists public.smart_cache (
  scope text not null check (scope in ('public','family_admin','super_admin')),
  question_hash text not null,
  normalized_question text,
  answer text not null,
  provider text,
  hits bigint not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_hit_at timestamp with time zone,
  primary key (scope, question_hash)
);

create index if not exists idx_smart_cache_hits on public.smart_cache(hits desc);
create index if not exists idx_smart_cache_last_hit on public.smart_cache(last_hit_at desc);

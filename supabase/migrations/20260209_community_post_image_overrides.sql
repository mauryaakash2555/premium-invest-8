-- Creates the table used by the Super Admin Community Posts image override flow.
-- Error observed when missing:
-- "Could not find the table 'public.community_post_image_overrides' in the schema cache"

create table if not exists public.community_post_image_overrides (
  post_id text primary key,
  image_url text not null,
  image_keywords text[] not null default '{}'::text[],
  image_source text not null default 'manual',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_community_post_image_overrides_updated_at
  on public.community_post_image_overrides(updated_at desc);

-- If PostgREST schema cache doesn't refresh automatically, run this once:
-- notify pgrst, 'reload schema';

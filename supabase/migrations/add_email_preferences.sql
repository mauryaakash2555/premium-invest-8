create table if not exists public.email_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id text default 'admin',
  hot_lead_alerts boolean default true,
  daily_summary boolean default true,
  weekly_summary boolean default true,
  conversion_alerts boolean default true,
  error_alerts boolean default true,
  email_address text default 'mauryaakash2555@gmail.com',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert default preferences
insert into public.email_preferences (user_id, email_address)
values ('admin', 'mauryaakash2555@gmail.com')
on conflict do nothing;

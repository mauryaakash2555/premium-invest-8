-- WhatsApp follow-up queue for scheduled outbound messages.
-- Safe to apply multiple times (uses IF NOT EXISTS where possible).

create extension if not exists pgcrypto;

create table if not exists whatsapp_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid null,
  phone text not null,
  source text not null default 'unknown',
  step int not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','stopped','skipped')),
  due_at timestamptz not null,
  sent_at timestamptz null,
  replied_at timestamptz null,
  provider text null,
  provider_message_id text null,
  last_error text null,
  context jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_followups_due_idx on whatsapp_followups (status, due_at);
create index if not exists whatsapp_followups_phone_idx on whatsapp_followups (phone);
create index if not exists whatsapp_followups_lead_idx on whatsapp_followups (lead_id);

-- Keep updated_at fresh
create or replace function set_updated_at_whatsapp_followups()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_whatsapp_followups_updated_at on whatsapp_followups;
create trigger trg_whatsapp_followups_updated_at
before update on whatsapp_followups
for each row execute function set_updated_at_whatsapp_followups();

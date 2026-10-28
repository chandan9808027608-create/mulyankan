-- Mulyankan: one-time Supabase setup. Run it in the Supabase dashboard:
-- SQL Editor -> New query -> paste this file -> Run. Safe to run again.

-- All marketplace data (postings, bids, messages, staff chat) as one JSON document.
-- `version` lets the app detect two servers saving at the same moment and retry.
create table if not exists public.mulyankan_store (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{"postings":[],"bids":[],"messages":[],"staffMessages":[]}'::jsonb,
  version bigint not null default 0
);
insert into public.mulyankan_store (id) values (1) on conflict (id) do nothing;

-- One counter per topic (postings, bids, messages, staffMessages); the app polls
-- these to push live updates to every open phone.
create table if not exists public.mulyankan_changes (
  topic text primary key,
  counter bigint not null default 0
);

-- Only the server (service role key) may read or write. With RLS on and no
-- policies, the public anon key gets nothing.
alter table public.mulyankan_store enable row level security;
alter table public.mulyankan_changes enable row level security;

-- Save only if nobody else saved since we read, and bump the topic's counter.
create or replace function public.mulyankan_save(expected bigint, new_data jsonb, changed_topic text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.mulyankan_store
     set data = new_data, version = version + 1
   where id = 1 and version = expected;
  if not found then
    return false;
  end if;
  insert into public.mulyankan_changes (topic, counter) values (changed_topic, 1)
  on conflict (topic) do update set counter = public.mulyankan_changes.counter + 1;
  return true;
end;
$$;

revoke execute on function public.mulyankan_save(bigint, jsonb, text) from public, anon, authenticated;
grant execute on function public.mulyankan_save(bigint, jsonb, text) to service_role;

-- Public bucket for bike photos (anyone can view; only the server can upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bike-photos',
  'bike-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

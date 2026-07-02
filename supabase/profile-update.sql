-- Profile extras: photo, occupation, gym name.
-- Run once in Supabase SQL Editor (safe to re-run).

alter table public.profiles
  add column if not exists occupation text,
  add column if not exists gym_name text,
  add column if not exists avatar_url text;

-- Public bucket for profile photos (small images; public read, owner write).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars own insert" on storage.objects;
create policy "avatars own insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects
  for update using (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars own delete" on storage.objects;
create policy "avatars own delete" on storage.objects
  for delete using (bucket_id = 'avatars' and owner = auth.uid());

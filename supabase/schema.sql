-- FitTrack database schema + Row Level Security.
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ---------------------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',          -- 'user' | 'admin'
  plan_tier text not null default 'free',      -- 'free' | 'premium' (monetization hook)
  gender text,
  age int,
  height_cm numeric,
  current_weight_kg numeric,
  target_weight_kg numeric,
  goal text,                                   -- lose_weight | gain_weight | build_muscle | recomp | maintain
  activity_level text,
  experience text,
  days_per_week int,
  equipment text,
  diet_type text,
  allergies text[] default '{}',
  conditions text[] default '{}',
  medical_ack boolean not null default false,
  medical_ack_at timestamptz,
  -- generated targets
  target_calories int,
  target_protein int,
  target_carbs int,
  target_fat int,
  target_water_l numeric,
  active_split text,
  onboarding_complete boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FOOD ITEMS (global library when owner_id is null)
-- ---------------------------------------------------------------------------
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,  -- null = global
  name text not null,
  serving_label text not null default '1 serving',
  calories int not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  meal_slot text not null default 'snack',     -- breakfast | lunch | dinner | snack
  tags text[] not null default '{}',           -- e.g. ['high_fodmap','dairy','gluten']
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- LOGS
-- ---------------------------------------------------------------------------
create table if not exists public.diet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  food_item_id uuid references public.food_items(id) on delete set null,
  food_name text,
  calories int default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  meal_slot text default 'snack',
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  liters numeric not null default 0,
  unique (user_id, log_date)
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  weight_kg numeric not null,
  waist_cm numeric,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  day_type text,
  exercise_id text,
  exercise_name text,
  set_number int,
  reps int,
  weight_kg numeric,
  duration_seconds int,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_diet_logs_user_date on public.diet_logs(user_id, log_date);
create index if not exists idx_water_logs_user_date on public.water_logs(user_id, log_date);
create index if not exists idx_weight_logs_user_date on public.weight_logs(user_id, log_date);
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, log_date);
create index if not exists idx_food_items_owner on public.food_items(owner_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?  (avoids RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles    enable row level security;
alter table public.food_items  enable row level security;
alter table public.diet_logs   enable row level security;
alter table public.water_logs  enable row level security;
alter table public.weight_logs enable row level security;
alter table public.workout_logs enable row level security;

-- ---- profiles ----
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

-- (Admins update any profile — e.g. suspend — via service role in server actions.)

-- ---- food_items ----
-- everyone can read global items + their own; admins read all
drop policy if exists "food read" on public.food_items;
create policy "food read" on public.food_items
  for select using (owner_id is null or owner_id = auth.uid() or public.is_admin());

-- users manage their own personal items
drop policy if exists "food insert own" on public.food_items;
create policy "food insert own" on public.food_items
  for insert with check (owner_id = auth.uid());

drop policy if exists "food update own" on public.food_items;
create policy "food update own" on public.food_items
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "food delete own" on public.food_items;
create policy "food delete own" on public.food_items
  for delete using (owner_id = auth.uid());

-- (Global items / condition tags are written by admins via the service role.)

-- ---- per-user log tables: identical policy shape ----
do $$
declare t text;
begin
  foreach t in array array['diet_logs','water_logs','weight_logs','workout_logs']
  loop
    execute format('drop policy if exists "%1$s owner all" on public.%1$s;', t);
    execute format($f$
      create policy "%1$s owner all" on public.%1$s
        for all
        using (user_id = auth.uid() or public.is_admin())
        with check (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- STORAGE: private bucket for progress photos / body measurements
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('progress', 'progress', false)
on conflict (id) do nothing;

drop policy if exists "progress own read" on storage.objects;
create policy "progress own read" on storage.objects
  for select using (bucket_id = 'progress' and owner = auth.uid());

drop policy if exists "progress own write" on storage.objects;
create policy "progress own write" on storage.objects
  for insert with check (bucket_id = 'progress' and owner = auth.uid());

drop policy if exists "progress own delete" on storage.objects;
create policy "progress own delete" on storage.objects
  for delete using (bucket_id = 'progress' and owner = auth.uid());

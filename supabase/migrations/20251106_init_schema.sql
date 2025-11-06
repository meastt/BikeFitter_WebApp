-- 2025-11-06_init_schema.sql
-- Schema for BikeFitter MVP: users, bikes, frames, fits
-- NOTE: Run with Supabase CLI (local) or push to remote project.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  plan text not null default 'free',
  height_cm numeric,
  inseam_cm numeric,
  torso_length_cm numeric,
  arm_length_cm numeric,
  flexibility text,          -- low | medium | high
  riding_style text,         -- comfort | endurance | race
  created_at timestamp with time zone default now()
);

-- FRAMES
create table if not exists public.frames (
  id uuid primary key default uuid_generate_v4(),
  brand text not null,
  model text not null,
  size_label text not null,
  stack_mm numeric not null,
  reach_mm numeric not null,
  seat_tube_angle_deg numeric,
  head_tube_angle_deg numeric,
  wheelbase_mm numeric,
  unique (brand, model, size_label)
);

-- BIKES
create table if not exists public.bikes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  frame_id uuid references public.frames(id) on delete set null,
  stem_length_mm numeric,
  spacer_stack_mm numeric,
  bar_reach_mm numeric,
  saddle_height_mm numeric,
  saddle_setback_mm numeric,
  created_at timestamp with time zone default now()
);

-- FITS
create table if not exists public.fits (
  id uuid primary key default uuid_generate_v4(),
  bike_id uuid not null references public.bikes(id) on delete cascade,
  calculated_target_reach_mm numeric,
  calculated_stem_mm numeric,
  calculated_spacers_mm numeric,
  confidence numeric,  -- 0..1
  created_at timestamp with time zone default now()
);

create index if not exists idx_bikes_user on public.bikes(user_id);
create index if not exists idx_bikes_frame on public.bikes(frame_id);
create index if not exists idx_frames_brand_model on public.frames(brand, model);
create index if not exists idx_fits_bike on public.fits(bike_id);

alter table public.users enable row level security;
alter table public.bikes enable row level security;
alter table public.frames enable row level security;
alter table public.fits enable row level security;

-- USERS: each user can see/update only their row (assumes auth.uid() matches users.id::text)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users read own') then
    create policy "Users read own" on public.users for select
      using (id::text = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users update own') then
    create policy "Users update own" on public.users for update
      using (id::text = auth.uid());
  end if;
end $$;

-- BIKES: owner can CRUD their bikes
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bikes' and policyname='Bikes read own') then
    create policy "Bikes read own" on public.bikes for select
      using (user_id::text = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='bikes' and policyname='Bikes insert own') then
    create policy "Bikes insert own" on public.bikes for insert
      with check (user_id::text = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='bikes' and policyname='Bikes update own') then
    create policy "Bikes update own" on public.bikes for update
      using (user_id::text = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='bikes' and policyname='Bikes delete own') then
    create policy "Bikes delete own" on public.bikes for delete
      using (user_id::text = auth.uid());
  end if;
end $$;

-- FRAMES: read for everyone; writes via admin/service role only
do $$ begin
  if not exists (select 1 from pg_policies where tablename='frames' and policyname='Frames readable') then
    create policy "Frames readable" on public.frames for select using (true);
  end if;
end $$;

-- FITS: owner-only
do $$ begin
  if not exists (select 1 from pg_policies where tablename='fits' and policyname='Fits read own') then
    create policy "Fits read own" on public.fits for select
      using (exists (select 1 from public.bikes b where b.id = bike_id and b.user_id::text = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='fits' and policyname='Fits insert own') then
    create policy "Fits insert own" on public.fits for insert
      with check (exists (select 1 from public.bikes b where b.id = bike_id and b.user_id::text = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='fits' and policyname='Fits update own') then
    create policy "Fits update own" on public.fits for update
      using (exists (select 1 from public.bikes b where b.id = bike_id and b.user_id::text = auth.uid()));
  end if;
end $$;

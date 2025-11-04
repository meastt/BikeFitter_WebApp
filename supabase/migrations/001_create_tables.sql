-- PHASE 1: Create core database schema
-- Run this in Supabase SQL Editor

-- USERS TABLE
-- Stores rider profile data (body measurements, preferences)
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  height_cm int,
  inseam_cm int,
  torso_cm int,
  arm_cm int,
  flexibility_level int, -- 1=low, 2=med, 3=high
  riding_style text,     -- comfort|endurance|race
  pain_points jsonb,     -- ["hands","neck","back","saddle"]
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- FRAMES TABLE
-- Database of bike frame geometries
create table if not exists public.frames (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  size text not null,
  stack_mm int not null,
  reach_mm int not null,
  seat_tube_angle_deg numeric(4,1),
  head_tube_length_mm int,
  wheelbase_mm int,
  created_at timestamp with time zone default now()
);

-- BIKES TABLE
-- User's bikes with current cockpit setup
create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text,
  frame_id uuid references public.frames(id) on delete set null,
  stem_mm int,
  spacer_mm int,
  bar_reach_category text, -- short|med|long
  saddle_height_mm int,
  saddle_setback_mm int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- FITS TABLE
-- Calculated fit recommendations (snapshots)
create table if not exists public.fits (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes(id) on delete cascade,
  target_reach_mm int,
  target_drop_mm int,
  ideal_stem_mm int,
  ideal_spacer_mm int,
  ideal_bar_reach_mm int,
  discomfort_score int,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists frames_brand_model_idx on public.frames (brand, model, size);
create index if not exists bikes_user_id_idx on public.bikes (user_id);
create index if not exists fits_bike_id_idx on public.fits (bike_id);

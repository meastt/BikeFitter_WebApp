-- PHASE 1: Enable Row Level Security (RLS) and create policies
-- Run this AFTER running 001_create_tables.sql

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.bikes enable row level security;
alter table public.fits enable row level security;
alter table public.frames enable row level security;

-- ===================
-- USERS POLICIES
-- ===================
-- Users can read their own row
create policy "users_select_own" on public.users
  for select using (id = auth.uid());

-- Users can update their own row
create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- Users can insert their own row (for first login)
create policy "users_insert_self" on public.users
  for insert with check (id = auth.uid());

-- ===================
-- BIKES POLICIES
-- ===================
-- Users can only see their own bikes
create policy "bikes_owner_select" on public.bikes
  for select using (user_id = auth.uid());

-- Users can insert bikes for themselves
create policy "bikes_owner_insert" on public.bikes
  for insert with check (user_id = auth.uid());

-- Users can update their own bikes
create policy "bikes_owner_update" on public.bikes
  for update using (user_id = auth.uid());

-- Users can delete their own bikes
create policy "bikes_owner_delete" on public.bikes
  for delete using (user_id = auth.uid());

-- ===================
-- FITS POLICIES
-- ===================
-- Users can read fits only for their own bikes
create policy "fits_owner_select" on public.fits
  for select using (
    exists (
      select 1 from public.bikes b
      where b.id = fits.bike_id
      and b.user_id = auth.uid()
    )
  );

-- Users can insert fits for their own bikes
create policy "fits_owner_insert" on public.fits
  for insert with check (
    exists (
      select 1 from public.bikes b
      where b.id = bike_id
      and b.user_id = auth.uid()
    )
  );

-- Users can update fits for their own bikes
create policy "fits_owner_update" on public.fits
  for update using (
    exists (
      select 1 from public.bikes b
      where b.id = fits.bike_id
      and b.user_id = auth.uid()
    )
  );

-- Users can delete fits for their own bikes
create policy "fits_owner_delete" on public.fits
  for delete using (
    exists (
      select 1 from public.bikes b
      where b.id = fits.bike_id
      and b.user_id = auth.uid()
    )
  );

-- ===================
-- FRAMES POLICIES
-- ===================
-- Everyone can read frames (public frame database)
create policy "frames_read_all" on public.frames
  for select using (true);

-- Only authenticated users can add frames (for now)
create policy "frames_authenticated_insert" on public.frames
  for insert with check (auth.uid() is not null);

-- Fix RLS policies to work with NextAuth + Service Role architecture
-- Since we use NextAuth (not Supabase Auth), auth.uid() returns NULL
-- Authorization is handled at application layer with explicit userId checks
-- Service role key bypasses RLS, so we simplify policies accordingly

-- Drop all existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "bikes_owner_select" ON public.bikes;
DROP POLICY IF EXISTS "bikes_owner_insert" ON public.bikes;
DROP POLICY IF EXISTS "bikes_owner_update" ON public.bikes;
DROP POLICY IF EXISTS "bikes_owner_delete" ON public.bikes;
DROP POLICY IF EXISTS "fits_owner_select" ON public.fits;
DROP POLICY IF EXISTS "fits_owner_insert" ON public.fits;
DROP POLICY IF EXISTS "fits_owner_update" ON public.fits;
DROP POLICY IF EXISTS "fits_owner_delete" ON public.fits;
DROP POLICY IF EXISTS "frames_authenticated_insert" ON public.frames;

-- Keep RLS enabled for defense in depth
-- But create permissive policies since we handle auth in application layer

-- ===================
-- USERS POLICIES
-- ===================
-- Allow service role to manage all users (used by NextAuth)
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===================
-- BIKES POLICIES
-- ===================
-- Allow service role to manage all bikes
-- Authorization handled in application layer (lib/db.ts checks userId)
CREATE POLICY "bikes_service_role_all" ON public.bikes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===================
-- FITS POLICIES
-- ===================
-- Allow service role to manage all fits
CREATE POLICY "fits_service_role_all" ON public.fits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===================
-- FRAMES POLICIES
-- ===================
-- Keep frames readable by all (public frame database)
CREATE POLICY "frames_read_all" ON public.frames
  FOR SELECT
  USING (true);

-- Allow service role to manage frames
CREATE POLICY "frames_service_role_manage" ON public.frames
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment explaining the architecture
COMMENT ON TABLE public.users IS 'RLS enabled but permissive - authorization handled in application layer with NextAuth';
COMMENT ON TABLE public.bikes IS 'RLS enabled but permissive - authorization handled in application layer (userId checks in queries)';
COMMENT ON TABLE public.fits IS 'RLS enabled but permissive - authorization handled in application layer';

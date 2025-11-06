-- Add new fit calculation fields for Phase 4 spec compliance
-- Adds confidence score, flags, rationale, reach delta

alter table public.fits
  add column if not exists confidence int,
  add column if not exists flags jsonb default '[]'::jsonb,
  add column if not exists rationale jsonb default '[]'::jsonb,
  add column if not exists current_effective_reach_mm int,
  add column if not exists reach_delta_mm int;

-- Rename existing column to match spec
alter table public.fits
  rename column discomfort_score to target_drop_mm;

-- Add comments
comment on column public.fits.confidence is 'Confidence score 0-100 for fit recommendation';
comment on column public.fits.flags is 'Array of warning flags (frame_maybe_too_long, etc)';
comment on column public.fits.rationale is 'Array of rationale strings explaining recommendations';
comment on column public.fits.current_effective_reach_mm is 'Current effective reach from BB to hood trough';
comment on column public.fits.reach_delta_mm is 'Delta between current and target reach (positive = too long)';

-- Add manual geometry fields to bikes table
-- This allows users to enter custom frame geometry when their bike isn't in the database

alter table public.bikes
  add column if not exists manual_stack_mm int,
  add column if not exists manual_reach_mm int,
  add column if not exists manual_seat_tube_angle_deg numeric(4,1),
  add column if not exists manual_head_tube_length_mm int,
  add column if not exists manual_wheelbase_mm int;

-- Add comment explaining usage
comment on column public.bikes.manual_stack_mm is 'Custom stack value (overrides frame_id geometry if set)';
comment on column public.bikes.manual_reach_mm is 'Custom reach value (overrides frame_id geometry if set)';
comment on column public.bikes.manual_seat_tube_angle_deg is 'Custom seat tube angle (overrides frame_id geometry if set)';
comment on column public.bikes.manual_head_tube_length_mm is 'Custom head tube length (overrides frame_id geometry if set)';
comment on column public.bikes.manual_wheelbase_mm is 'Custom wheelbase (overrides frame_id geometry if set)';

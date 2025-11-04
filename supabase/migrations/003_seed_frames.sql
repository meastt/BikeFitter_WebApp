-- PHASE 1: Seed initial frame data
-- Run this AFTER running 001 and 002
-- Popular gravel/endurance road bikes

insert into public.frames (brand, model, size, stack_mm, reach_mm, seat_tube_angle_deg, head_tube_length_mm, wheelbase_mm)
values
  ('Specialized', 'Roubaix', '56', 605, 370, 73.5, 175, 1015),
  ('Specialized', 'Diverge', '56', 595, 378, 73.0, 165, 1029),
  ('Marin', 'DSX FS', 'L', 610, 440, 73.0, 140, 1089),
  ('Trek', 'Checkpoint SL', '56', 603, 386, 73.2, 170, 1033),
  ('Cervelo', 'Áspero', '56', 575, 386, 73.0, 155, 1031),
  ('Canyon', 'Grizl CF', 'L', 633, 394, 73.5, 184, 1046),
  ('Giant', 'Revolt Advanced', 'M', 588, 380, 72.5, 158, 1026),
  ('Cannondale', 'Topstone Carbon', '56', 603, 385, 73.0, 163, 1038),
  ('Orbea', 'Terra', 'M', 591, 373, 73.5, 161, 1019),
  ('Lauf', 'Seigla', 'M', 597, 385, 73.0, 168, 1024)
on conflict do nothing;

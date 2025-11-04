# Supabase Database Migrations

These SQL files set up the database schema for the BikeFit app.

## How to Run

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: **BikeFitApp** (ID: `eicwwztgfbipjsbnmplh`)
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy and paste each migration file in order:
   - First: `001_create_tables.sql`
   - Second: `002_enable_rls.sql`
   - Third: `003_seed_frames.sql`
6. Click **Run** for each one

## What Each Migration Does

### 001_create_tables.sql
Creates the core database tables:
- `users` - Rider profiles (body measurements, preferences)
- `frames` - Frame geometry database
- `bikes` - User's bikes with cockpit setup
- `fits` - Calculated fit recommendations

### 002_enable_rls.sql
Enables Row Level Security (RLS) and creates policies to ensure:
- Users can only see/edit their own data
- Everyone can read the frames database
- Proper data isolation between users

**Note:** For Phase 1 MVP, RLS is configured but we're handling permissions at the application layer since we're using NextAuth instead of Supabase Auth directly.

### 003_seed_frames.sql
Seeds the frames table with 10 popular gravel/endurance road bikes:
- Specialized Roubaix, Diverge
- Trek Checkpoint
- Cervelo Áspero
- Canyon Grizl
- Marin DSX FS
- And more...

## Verifying Success

After running all migrations, you can verify they worked:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see 4 tables: `users`, `frames`, `bikes`, `fits`
3. Click on `frames` - you should see 10 rows of bike frames
4. Click on `users` - it should be empty (will populate when users sign in)

## Troubleshooting

**"relation already exists" error:**
- This means the table already exists. Safe to ignore or drop the table first.

**"permission denied" error:**
- Make sure you're running these in the Supabase SQL Editor (not a local psql client)
- The SQL Editor runs with admin privileges

**RLS policy errors:**
- If policies already exist with the same name, you'll need to drop them first
- Or just skip 002_enable_rls.sql if RLS is already set up

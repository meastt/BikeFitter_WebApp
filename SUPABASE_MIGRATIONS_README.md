## Supabase: migrations & seeding

### One-time setup
```bash
npm i @supabase/supabase-js dotenv
npm i -D ts-node csv-parse
npm pkg set scripts.migrate="supabase db push"
npm pkg set scripts.seed="ts-node scripts/seed_frames.ts"
```

### Local dev (Docker) workflow

```bash
supabase start
supabase db reset    # runs all migrations and supabase/seed.sql if present
```

### Remote (apply schema to hosted Supabase)

```bash
supabase link --project-ref <your-project-ref>   # once per machine
npm run migrate                                  # runs migrations to remote
```

### Seed frames from CSV (remote or local, uses service role key)

1. Create `.env` in project root:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

2. Run:

```bash
npm run seed
```

> Note: SERVICE_ROLE key is sensitive. Keep `.env` out of client bundle and version control.

/**
 * scripts/seed_frames.ts
 * Usage:
 *   1) npm i -D ts-node csv-parse
 *      npm i @supabase/supabase-js dotenv
 *   2) Put SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in a root .env (NOT committed)
 *   3) npx ts-node scripts/seed_frames.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

type FrameRow = {
  brand: string
  model: string
  size_label: string
  stack_mm: string
  reach_mm: string
  seat_tube_angle_deg?: string
  head_tube_angle_deg?: string
  wheelbase_mm?: string
}

async function main() {
  const csvPath = path.resolve('supabase', 'frames_seed.csv')
  const file = fs.readFileSync(csvPath, 'utf-8')
  const rows = parse(file, { columns: true, skip_empty_lines: true }) as FrameRow[]

  for (const row of rows) {
    const payload = {
      brand: row.brand.trim(),
      model: row.model.trim(),
      size_label: row.size_label.trim(),
      stack_mm: Number(row.stack_mm),
      reach_mm: Number(row.reach_mm),
      seat_tube_angle_deg: row.seat_tube_angle_deg ? Number(row.seat_tube_angle_deg) : null,
      head_tube_angle_deg: row.head_tube_angle_deg ? Number(row.head_tube_angle_deg) : null,
      wheelbase_mm: row.wheelbase_mm ? Number(row.wheelbase_mm) : null
    }

    const { error } = await supabase
      .from('frames')
      .upsert(payload, { onConflict: 'brand,model,size_label' })

    if (error) {
      console.error('Upsert error for', payload, error.message)
      process.exitCode = 1
    } else {
      console.log('Upserted:', payload.brand, payload.model, payload.size_label)
    }
  }

  console.log('Done seeding frames.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

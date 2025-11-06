import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * IMPORTANT: This file MUST only be imported in server-side code
 * - Server Components (app directory)
 * - Server Actions (use server)
 * - API Routes
 *
 * Using SERVICE ROLE key which bypasses RLS - this is INTENTIONAL
 * Authorization is handled at application layer in lib/db.ts
 */

// Runtime guard to prevent client-side imports
if (typeof window !== 'undefined') {
  throw new Error(
    '🚨 SECURITY: lib/supabase/server.ts imported on client-side! ' +
    'This file contains the service role key and must ONLY be imported in server code.'
  )
}

// Build-time type guard for extra safety
type ServerOnly = {
  __SERVER_ONLY__: true
}

/**
 * Server-side Supabase client using SERVICE ROLE key
 *
 * This bypasses RLS intentionally - we handle authorization in lib/db.ts
 * by explicitly filtering queries with userId checks.
 *
 * @returns Supabase client with service role permissions
 */
export async function createClient(): Promise<ReturnType<typeof createSupabaseClient> & ServerOnly> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  const client = createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return client as typeof client & ServerOnly
}

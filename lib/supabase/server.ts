import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client using SERVICE ROLE key
 * This bypasses RLS and should ONLY be used in server-side code
 * Never expose this client to the browser
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-only key, bypasses RLS
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

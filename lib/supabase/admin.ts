import { createClient } from "@supabase/supabase-js"

/**
 * Server-side admin client using SUPABASE_SERVICE_ROLE_KEY.
 * This bypasses RLS and can create/delete auth users.
 * NEVER expose this on the client side.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

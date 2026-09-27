import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Service-role client. BYPASSES ROW LEVEL SECURITY. This must only ever
// be imported from server-only code (Route Handlers, Server Actions) —
// the `server-only` import above makes Next.js throw a build error if
// something tries to pull this into a Client Component bundle.
//
// This client is used exactly where an anonymous customer needs to write
// data (submitting feedback, logging a scan) — see the tenant-isolation
// note at the top of supabase/migrations/0001_init.sql for why that's a
// deliberate choice, not a shortcut. EVERY caller of this client is
// responsible for validating its own inputs before writing, since RLS
// won't do it for them here.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin client is missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them in .env.local (see .env.example).'
    )
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

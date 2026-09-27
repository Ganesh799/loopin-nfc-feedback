'use client'

// Browser client — uses the public anon key only. This is the client
// bundled into the browser, so it must never see the service role key.
// RLS (see supabase/migrations/0001_init.sql) is what keeps a logged-in
// business user from reading another business's data through this client.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

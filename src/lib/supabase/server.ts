import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

// Server client for use in Server Components / Route Handlers / Server
// Actions. Still uses the anon key + the signed-in user's session cookie,
// so RLS applies exactly as it would in the browser — this is NOT a way
// to bypass row-level security, just a way to read the session on the
// server. Use lib/supabase/admin.ts when you deliberately need to bypass
// RLS (only for the anonymous public feedback endpoints).
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component (not a Route Handler / Server
            // Action) — the middleware below already refreshes the session
            // cookie on every request, so this can be safely ignored.
          }
        },
      },
    }
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Business, BusinessRole } from '@/lib/database.types'

export interface CurrentBusinessContext {
  business: Business
  role: BusinessRole
  userId: string
}

/**
 * Loads the signed-in user's business for dashboard pages. Redirects to
 * /login if there's no session, and to /onboarding if the user has no
 * business yet. RLS on `businesses`/`business_users` is what actually
 * enforces that this query can only ever return a business the current
 * user belongs to — this helper just makes that ergonomic to use from
 * Server Components.
 *
 * MVP simplification: a user is assumed to belong to a single business.
 * Supporting multiple businesses per user (e.g. an agency) is a
 * straightforward follow-up: add a business switcher that sets the
 * active business id in a cookie and filters this query by it.
 */
export async function requireCurrentBusiness(): Promise<CurrentBusinessContext> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_users')
    .select('role, business_id, businesses(*)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership || !membership.businesses) {
    redirect('/onboarding')
  }

  return {
    business: membership.businesses as unknown as Business,
    role: membership.role,
    userId: user.id,
  }
}

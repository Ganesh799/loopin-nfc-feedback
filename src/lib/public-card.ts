import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Business, Card, FeedbackCategory } from '@/lib/database.types'

export interface PublicCardContext {
  business: Business
  card: Card
  categories: FeedbackCategory[]
}

/**
 * Resolves a (business slug, card token) pair from a public URL to the
 * actual business/card rows, using the service-role client (this runs
 * for anonymous visitors, so there's no user session/RLS to rely on —
 * see the note at the top of supabase/migrations/0001_init.sql).
 *
 * Returns null if the business or card doesn't exist, or either has
 * been deactivated — callers should render a 404 in that case rather
 * than leak which part failed.
 */
export async function resolvePublicCard(
  slug: string,
  cardToken: string
): Promise<PublicCardContext | null> {
  const supabase = createAdminClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!business) return null

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('business_id', business.id)
    .eq('public_token', cardToken)
    .eq('is_active', true)
    .maybeSingle()

  if (!card) return null

  const { data: categories } = await supabase
    .from('feedback_categories')
    .select('*')
    .eq('business_id', business.id)
    .order('sort_order')

  return { business, card, categories: categories ?? [] }
}

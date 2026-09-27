import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePublicCard } from '@/lib/public-card'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  slug: z.string().min(1).max(80),
  cardToken: z.string().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  categoryIds: z.array(z.string().uuid()).max(20).optional(),
  // Honeypot: a real customer never fills this hidden field. If it's
  // non-empty, silently pretend success so the bot doesn't learn anything.
  website: z.string().max(0).optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)

  const { success } = await rateLimit(`feedback:${ip}`, 8, 60)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const json = await request.json().catch(() => null)
  const parsed = schema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }

  // Honeypot tripped — respond as if it worked, do not write anything.
  if (parsed.data.website) {
    return NextResponse.json({ id: 'ok' })
  }

  const context = await resolvePublicCard(parsed.data.slug, parsed.data.cardToken)
  if (!context) {
    return NextResponse.json({ error: 'This feedback link is no longer active.' }, { status: 404 })
  }

  const supabase = createAdminClient()

  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      business_id: context.business.id,
      card_id: context.card.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })
    .select('id')
    .single()

  if (error || !feedback) {
    return NextResponse.json({ error: 'Could not save your feedback. Please try again.' }, { status: 500 })
  }

  const requestedCategoryIds = parsed.data.categoryIds ?? []
  if (requestedCategoryIds.length > 0) {
    // Only link categories that actually belong to this business — never
    // trust category ids the client sent at face value.
    const validIds = new Set(context.categories.map((c) => c.id))
    const links = requestedCategoryIds
      .filter((id) => validIds.has(id))
      .map((categoryId) => ({ feedback_id: feedback.id, category_id: categoryId }))

    if (links.length > 0) {
      await supabase.from('feedback_category_links').insert(links)
    }
  }

  return NextResponse.json({ id: feedback.id })
}

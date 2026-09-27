import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Marks which thank-you-screen action the customer took. This is what
// powers the "Google review clicks" vs "private feedback submissions"
// counts on the dashboard. A given feedback row can have both flags set
// (nothing here should ever gate one option on the other, per product
// requirements — a customer can click both).
const schema = z.object({
  feedbackId: z.string().uuid(),
  outcome: z.enum(['clicked_google_review', 'sent_as_private_feedback']),
})

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(`feedback-outcome:${ip}`, 20, 60)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const json = await request.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('feedback')
    .update({ [parsed.data.outcome]: true })
    .eq('id', parsed.data.feedbackId)

  if (error) {
    return NextResponse.json({ error: 'Could not record this.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

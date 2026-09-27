import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getFeedbackUrl } from '@/lib/urls'

// Generates a QR code PNG for a card on demand. Protected by the normal
// authenticated Supabase client, so RLS ensures a business can only ever
// generate a QR for its own card (a stranger requesting an arbitrary
// cardId just gets a 404, same as if the row didn't exist for them).
export async function GET(
  _request: Request,
  { params }: { params: { cardId: string } }
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: card } = await supabase
    .from('cards')
    .select('*, businesses(slug)')
    .eq('id', params.cardId)
    .maybeSingle()

  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const slug = (card as unknown as { businesses: { slug: string } }).businesses.slug
  const url = getFeedbackUrl(slug, card.public_token)

  const png = await QRCode.toBuffer(url, {
    type: 'png',
    width: 512,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}

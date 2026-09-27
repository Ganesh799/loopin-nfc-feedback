import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolvePublicCard } from '@/lib/public-card'
import { createAdminClient } from '@/lib/supabase/admin'
import { FeedbackFlow } from './FeedbackFlow'

export const dynamic = 'force-dynamic' // always fresh — never cache someone else's branding

interface Props {
  params: { slug: string; cardId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const context = await resolvePublicCard(params.slug, params.cardId)
  return { title: context ? `Feedback — ${context.business.name}` : 'Feedback' }
}

async function logScan(businessId: string, cardId: string, userAgent: string | null) {
  try {
    const supabase = createAdminClient()
    await supabase.from('scans').insert({ business_id: businessId, card_id: cardId, user_agent: userAgent })
  } catch {
    // Never let analytics logging break the customer's feedback page.
  }
}

export default async function PublicFeedbackPage({ params }: Props) {
  const context = await resolvePublicCard(params.slug, params.cardId)

  if (!context) {
    notFound()
  }

  const { business, card, categories } = context

  // Best-effort, non-blocking scan log — awaited but swallow-on-error, so
  // a database hiccup never keeps a customer from leaving feedback.
  await logScan(business.id, card.id, null)

  return (
    <div className="min-h-screen bg-slate-50">
      {business.cover_image_url && (
        <div className="h-28 w-full sm:h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-md px-5 pb-16 pt-8">
        <div className="mb-8 flex flex-col items-center text-center">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ backgroundColor: business.brand_color }}
            >
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="mt-3 text-sm font-medium text-slate-500">{business.name}</p>
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ ['--brand-color' as string]: business.brand_color }}
        >
          <FeedbackFlow
            slug={business.slug}
            cardToken={card.public_token}
            categories={categories}
            welcomeMessage={business.welcome_message}
            thankYouMessage={business.thank_you_message}
            googleReviewUrl={business.google_review_url}
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-300">Powered by Loopin</p>
      </div>
    </div>
  )
}

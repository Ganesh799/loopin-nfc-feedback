import { requireCurrentBusiness } from '@/lib/current-business'
import { createClient } from '@/lib/supabase/server'
import { getFeedbackUrl } from '@/lib/urls'
import { CreateCardForm } from './CreateCardForm'
import { CardRow } from './CardRow'

export default async function CardsPage() {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const cardList = cards ?? []

  const [{ data: scans }, { data: feedback }] = await Promise.all([
    supabase.from('scans').select('card_id').eq('business_id', business.id),
    supabase.from('feedback').select('card_id').eq('business_id', business.id),
  ])

  const scanCounts = new Map<string, number>()
  for (const scan of scans ?? []) {
    scanCounts.set(scan.card_id, (scanCounts.get(scan.card_id) ?? 0) + 1)
  }
  const feedbackCounts = new Map<string, number>()
  for (const item of feedback ?? []) {
    if (!item.card_id) continue
    feedbackCounts.set(item.card_id, (feedbackCounts.get(item.card_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">NFC cards & QR codes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create one card per location (front desk, table, counter…). Write its link to an
          NFC card with any NFC-writer app, and print its QR code as a backup.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <CreateCardForm />
      </div>

      <div className="space-y-3">
        {cardList.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            No cards yet — create your first one above.
          </p>
        )}
        {cardList.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            feedbackUrl={getFeedbackUrl(business.slug, card.public_token)}
            scanCount={scanCounts.get(card.id) ?? 0}
            feedbackCount={feedbackCounts.get(card.id) ?? 0}
          />
        ))}
      </div>
    </div>
  )
}

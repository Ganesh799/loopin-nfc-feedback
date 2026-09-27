import { requireCurrentBusiness } from '@/lib/current-business'
import { createClient } from '@/lib/supabase/server'
import { FeedbackListItem } from '@/components/FeedbackListItem'

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { rating?: string }
}) {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  let query = supabase
    .from('feedback')
    .select('*, feedback_category_links(feedback_categories(name)), cards(label)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const ratingFilter = Number(searchParams.rating)
  if (ratingFilter >= 1 && ratingFilter <= 5) {
    query = query.eq('rating', ratingFilter)
  }

  const { data: feedback } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">Every submission, most recent first.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/dashboard/feedback"
          className={`rounded-full border px-3 py-1 text-sm ${
            !searchParams.rating
              ? 'border-brand bg-brand-50 text-brand'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          All
        </a>
        {[5, 4, 3, 2, 1].map((r) => (
          <a
            key={r}
            href={`/dashboard/feedback?rating=${r}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              Number(searchParams.rating) === r
                ? 'border-brand bg-brand-50 text-brand'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            {r}★
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-4">
          {(feedback ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No feedback found.</p>
          )}
          {(feedback ?? []).map((item) => (
            <div key={item.id}>
              {(item as unknown as { cards: { label: string } | null }).cards?.label && (
                <p className="mb-1 text-xs font-medium text-slate-400">
                  {(item as unknown as { cards: { label: string } | null }).cards?.label}
                </p>
              )}
              <FeedbackListItem feedback={item as never} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

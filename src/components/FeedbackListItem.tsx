import type { Feedback } from '@/lib/database.types'

type FeedbackWithCategories = Feedback & {
  feedback_category_links: { feedback_categories: { name: string } | null }[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-slate-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export function FeedbackListItem({ feedback }: { feedback: FeedbackWithCategories }) {
  const categories = feedback.feedback_category_links
    .map((link) => link.feedback_categories?.name)
    .filter((n): n is string => Boolean(n))

  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <Stars rating={feedback.rating} />
        <time className="text-xs text-slate-400">
          {new Date(feedback.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </time>
      </div>
      {feedback.comment && <p className="mt-1 text-sm text-slate-700">{feedback.comment}</p>}
      {categories.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {categories.map((name) => (
            <span
              key={name}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

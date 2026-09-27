import { requireCurrentBusiness } from '@/lib/current-business'
import { createClient } from '@/lib/supabase/server'
import { getBusinessAnalytics } from '@/lib/analytics'
import { StatCard } from '@/components/StatCard'
import { RatingDistributionChart, FeedbackTrendChart } from './AnalyticsCharts'
import { FeedbackListItem } from '@/components/FeedbackListItem'

export default async function DashboardOverviewPage() {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const [analytics, { data: recentFeedback }] = await Promise.all([
    getBusinessAnalytics(supabase, business.id),
    supabase
      .from('feedback')
      .select('*, feedback_category_links(feedback_categories(name))')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const conversionRate =
    analytics.totalScans > 0
      ? Math.round((analytics.totalFeedback / analytics.totalScans) * 100)
      : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          How {business.name} is doing across every NFC card and QR code.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total scans" value={String(analytics.totalScans)} />
        <StatCard label="Feedback submissions" value={String(analytics.totalFeedback)} />
        <StatCard
          label="Average rating"
          value={analytics.averageRating !== null ? analytics.averageRating.toFixed(1) : '—'}
        />
        <StatCard
          label="Scan → feedback rate"
          value={conversionRate !== null ? `${conversionRate}%` : '—'}
        />
        <StatCard label="Google review clicks" value={String(analytics.googleReviewClicks)} />
        <StatCard label="Private feedback" value={String(analytics.privateFeedbackCount)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Rating distribution</h2>
          <RatingDistributionChart data={analytics.ratingDistribution} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Feedback trend (last 14 days)</h2>
          <FeedbackTrendChart data={analytics.trend} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent feedback</h2>
            <a href="/dashboard/feedback" className="text-sm text-brand hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {(recentFeedback ?? []).length === 0 && (
              <p className="text-sm text-slate-400">No feedback yet.</p>
            )}
            {(recentFeedback ?? []).map((item) => (
              <FeedbackListItem key={item.id} feedback={item as never} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Most common categories</h2>
          <div className="space-y-2">
            {analytics.topCategories.length === 0 && (
              <p className="text-sm text-slate-400">No category data yet.</p>
            )}
            {analytics.topCategories.map((category) => (
              <div key={category.name} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm text-slate-600">{category.name}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{
                      width: `${(category.count / analytics.topCategories[0]!.count) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm text-slate-500">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

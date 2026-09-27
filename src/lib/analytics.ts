import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export interface BusinessAnalytics {
  totalScans: number
  totalFeedback: number
  averageRating: number | null
  ratingDistribution: { rating: string; count: number }[]
  trend: { date: string; count: number }[]
  googleReviewClicks: number
  privateFeedbackCount: number
  topCategories: { name: string; count: number }[]
}

/**
 * Computes the dashboard summary stats for one business.
 *
 * MVP note: this pulls raw rows and aggregates them in JS, which is
 * simple and fine at the volumes a single small business generates. If
 * this needs to scale to thousands of submissions per business, move
 * these aggregations into SQL (views or an RPC) instead of growing this
 * function — the queries below are written so that swap is a drop-in
 * replacement (same return shape).
 */
export async function getBusinessAnalytics(
  supabase: SupabaseClient<Database>,
  businessId: string,
  trendDays = 14
): Promise<BusinessAnalytics> {
  const trendStart = new Date()
  trendStart.setDate(trendStart.getDate() - (trendDays - 1))
  trendStart.setHours(0, 0, 0, 0)

  const [{ count: totalScans }, { data: feedbackRows }, { data: categoryLinks }] =
    await Promise.all([
      supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId),
      supabase
        .from('feedback')
        .select('id, rating, created_at, clicked_google_review, sent_as_private_feedback')
        .eq('business_id', businessId),
      supabase
        .from('feedback_category_links')
        .select('category_id, feedback_categories(name), feedback!inner(business_id)')
        .eq('feedback.business_id', businessId),
    ])

  const feedback = feedbackRows ?? []
  const totalFeedback = feedback.length

  const averageRating =
    totalFeedback > 0
      ? Math.round((feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback) * 100) / 100
      : null

  const ratingCounts = new Map<number, number>([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ])
  for (const f of feedback) {
    ratingCounts.set(f.rating, (ratingCounts.get(f.rating) ?? 0) + 1)
  }
  const ratingDistribution = Array.from(ratingCounts.entries()).map(([rating, count]) => ({
    rating: `${rating}★`,
    count,
  }))

  const trendCounts = new Map<string, number>()
  for (let i = 0; i < trendDays; i++) {
    const d = new Date(trendStart)
    d.setDate(d.getDate() + i)
    trendCounts.set(d.toISOString().slice(0, 10), 0)
  }
  for (const f of feedback) {
    const day = f.created_at.slice(0, 10)
    if (trendCounts.has(day)) {
      trendCounts.set(day, (trendCounts.get(day) ?? 0) + 1)
    }
  }
  const trend = Array.from(trendCounts.entries()).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }))

  const googleReviewClicks = feedback.filter((f) => f.clicked_google_review).length
  const privateFeedbackCount = feedback.filter((f) => f.sent_as_private_feedback).length

  const categoryCounts = new Map<string, number>()
  for (const link of categoryLinks ?? []) {
    const name = (link as unknown as { feedback_categories: { name: string } | null })
      .feedback_categories?.name
    if (!name) continue
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1)
  }
  const topCategories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalScans: totalScans ?? 0,
    totalFeedback,
    averageRating,
    ratingDistribution,
    trend,
    googleReviewClicks,
    privateFeedbackCount,
    topCategories,
  }
}

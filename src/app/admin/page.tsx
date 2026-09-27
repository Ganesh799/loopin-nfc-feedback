import { createClient } from '@/lib/supabase/server'
import { getBusinessAnalytics } from '@/lib/analytics'
import { StatCard } from '@/components/StatCard'

export default async function AdminPage() {
  const supabase = createClient()

  // Admins can see every business — this relies on the
  // "...or public.is_platform_admin()" clause in each RLS policy
  // (see supabase/migrations/0001_init.sql), not a service-role
  // bypass, so it's still subject to the same audited access path as
  // everything else in the dashboard.
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = await Promise.all(
    (businesses ?? []).map(async (business) => {
      const analytics = await getBusinessAnalytics(supabase, business.id)
      return { business, analytics }
    })
  )

  const totals = rows.reduce(
    (acc, row) => ({
      businesses: acc.businesses + 1,
      scans: acc.scans + row.analytics.totalScans,
      feedback: acc.feedback + row.analytics.totalFeedback,
    }),
    { businesses: 0, scans: 0, feedback: 0 }
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">All businesses</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide overview.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Businesses" value={String(totals.businesses)} />
        <StatCard label="Total scans" value={String(totals.scans)} />
        <StatCard label="Total feedback" value={String(totals.feedback)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Scans</th>
              <th className="px-4 py-3">Feedback</th>
              <th className="px-4 py-3">Avg rating</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ business, analytics }) => (
              <tr key={business.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{business.name}</div>
                  <div className="text-xs text-slate-400">/{business.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      business.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {business.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">{analytics.totalScans}</td>
                <td className="px-4 py-3">{analytics.totalFeedback}</td>
                <td className="px-4 py-3">
                  {analytics.averageRating !== null ? analytics.averageRating.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(business.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No businesses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

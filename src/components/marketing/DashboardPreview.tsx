// A CSS-only stylized mockup of the dashboard — no image assets needed,
// loads instantly, and stays in sync with the real brand colors.
export function DashboardPreview() {
  const bars = [40, 65, 30, 80, 55, 90, 70]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">ABC Café</p>
          <p className="text-sm font-semibold text-slate-900">Overview</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Scans', value: '327' },
          { label: 'Feedback', value: '214' },
          { label: 'Avg rating', value: '4.6' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Feedback trend</p>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-brand/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {[5, 5, 4].map((rating, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
            <span className="text-xs text-amber-400">{'★'.repeat(rating)}</span>
            <span className="truncate text-xs text-slate-500">
              {['Loved the espresso!', 'Fast, friendly service.', 'Great spot, a bit loud.'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

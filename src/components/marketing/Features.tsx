const features = [
  {
    title: 'Branded feedback page',
    body: 'Your logo, cover image and brand color, applied automatically to every card.',
  },
  {
    title: 'No gated reviews',
    body: 'Every customer sees the Google review option, whatever they rated — no filtering, ever.',
  },
  {
    title: 'Multi-location cards',
    body: 'Name a card per table, counter or desk, and see which ones drive the most feedback.',
  },
  {
    title: 'Real-time dashboard',
    body: 'Scans, submissions, rating trends and category breakdowns, updated as they happen.',
  },
  {
    title: 'Private feedback inbox',
    body: 'Catch a frustrated customer before they post publicly — feedback that stays with you.',
  },
  {
    title: 'Built for teams',
    body: 'Multi-tenant from day one: your data is isolated from every other business on Loopin.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-slate-600">
            Built for the MVP stage — the essentials, done properly, without a bloated setup
            flow.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    step: '1',
    title: 'Tap or scan',
    body: 'A customer taps your NFC card or scans the printed QR code — no app to download.',
  },
  {
    step: '2',
    title: 'Rate in seconds',
    body: 'A branded page opens instantly: a 1–5 star rating, with an optional comment and category tags.',
  },
  {
    step: '3',
    title: 'Two honest options',
    body: 'They can share the experience on Google, send it straight to you privately, or both — never gated.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            From tap to insight in under a minute
          </h2>
          <p className="mt-3 text-slate-600">
            Every card and QR code links back to your business automatically — no manual
            setup per location beyond naming it.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h3 className="font-semibold text-slate-900">What&apos;s NFC, exactly?</h3>
            <p className="mt-2 text-sm text-slate-600">
              NFC (Near Field Communication) is the same tap-to-pay technology in
              contactless cards. Your Loopin card holds a link to your feedback page — any
              modern phone opens it with a single tap, no app required.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Why also print a QR code?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Every card gets a matching QR code automatically, so customers whose phones
              don&apos;t support NFC (or who&apos;d rather scan) always have a way in — same
              link, same analytics.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

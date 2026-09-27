import Link from 'next/link'
import { DashboardPreview } from './DashboardPreview'

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            NFC + QR customer feedback
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Turn every customer interaction into actionable feedback.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            One tap or scan. A 10-second rating. A direct line to more Google reviews and
            honest private feedback — without ever gating one behind the other.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Start free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            No credit card required · Set up your first card in minutes
          </p>
        </div>
        <DashboardPreview />
      </div>
    </section>
  )
}

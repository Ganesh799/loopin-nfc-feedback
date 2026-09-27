import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: '€19',
    period: '/mo',
    description: 'One location, getting started.',
    features: ['1 business profile', 'Up to 3 NFC/QR cards', 'Core dashboard analytics'],
  },
  {
    name: 'Growth',
    price: '€49',
    period: '/mo',
    description: 'Most popular for single-location teams.',
    features: ['Unlimited cards', 'Full analytics + trends', 'Team member access'],
    highlighted: true,
  },
  {
    name: 'Multi-location',
    price: 'Custom',
    period: '',
    description: 'Multiple branches or franchise locations.',
    features: ['Everything in Growth', 'Per-location breakdowns', 'Priority support'],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Simple pricing
          </h2>
          <p className="mt-3 text-slate-600">
            Placeholder pricing for the MVP — billing isn&apos;t wired up yet.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlighted
                  ? 'border-brand bg-white shadow-lg shadow-brand-100'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-brand text-white hover:bg-brand-700'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

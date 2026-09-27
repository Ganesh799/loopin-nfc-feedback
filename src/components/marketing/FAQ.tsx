const faqs = [
  {
    q: 'Do you filter or gate reviews by rating?',
    a: 'No. Every customer sees the Google review option after submitting feedback, regardless of the rating they gave. Review gating violates Google’s policies and we don’t do it.',
  },
  {
    q: 'Does the customer need to create an account?',
    a: 'No. The feedback flow is fully anonymous — tap, rate, optionally comment, done. Accounts are only for business owners.',
  },
  {
    q: 'What if a customer’s phone doesn’t support NFC?',
    a: 'Every card also gets a printed QR code as a backup, linking to the exact same feedback page.',
  },
  {
    q: 'Where is our data stored?',
    a: 'Each business’s data is isolated at the database level. We only collect what’s needed to run the product — no unnecessary personal data.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                {faq.q}
                <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

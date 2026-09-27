'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createBusinessAction } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? 'Setting up…' : 'Create my business'}
    </button>
  )
}

export function OnboardingForm() {
  const [state, formAction] = useFormState(createBusinessAction, { error: null })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Business name</label>
        <input
          required
          name="name"
          type="text"
          placeholder="e.g. ABC Café"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="mt-1 text-xs text-slate-400">
          You can add your logo, colors and Google review link next.
        </p>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}

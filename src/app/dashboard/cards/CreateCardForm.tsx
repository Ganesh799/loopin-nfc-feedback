'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createCardAction } from './actions'

function AddButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="brand-bg rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? 'Creating…' : 'Create card'}
    </button>
  )
}

export function CreateCardForm() {
  const [state, formAction] = useFormState(createCardAction, { error: null })

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Card name</label>
        <input
          name="label"
          type="text"
          placeholder="e.g. Front Desk, Table 4"
          required
          maxLength={60}
          className="mt-1 w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <AddButton />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}

'use client'

import { useFormState, useFormStatus } from 'react-dom'
import type { Business } from '@/lib/database.types'
import { updateBusinessAction } from './actions'

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string | null
  type?: string
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function BusinessForm({ business }: { business: Business }) {
  const [state, formAction] = useFormState(updateBusinessAction, {
    error: null,
    success: false,
  })

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Business name" name="name" defaultValue={business.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" defaultValue={business.phone} />
        <Field
          label="Website"
          name="website"
          type="url"
          defaultValue={business.website}
          placeholder="https://"
        />
      </div>
      <Field label="Address" name="address" defaultValue={business.address} />
      <Field
        label="Google review link"
        name="google_review_url"
        type="url"
        defaultValue={business.google_review_url}
        placeholder="https://g.page/r/..."
        hint="Find this in Google Business Profile → Ask for reviews → Get link."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              name="brand_color"
              type="color"
              defaultValue={business.brand_color}
              className="h-9 w-12 cursor-pointer rounded border border-slate-300"
            />
          </div>
        </div>
      </div>
      <Field
        label="Welcome message"
        name="welcome_message"
        defaultValue={business.welcome_message}
      />
      <Field
        label="Thank-you message"
        name="thank_you_message"
        defaultValue={business.thank_you_message}
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}
      <SaveButton />
    </form>
  )
}

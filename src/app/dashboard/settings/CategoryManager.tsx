'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useTransition } from 'react'
import type { FeedbackCategory } from '@/lib/database.types'
import { addCategoryAction, deleteCategoryAction } from './actions'

function AddButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      Add
    </button>
  )
}

export function CategoryManager({ categories }: { categories: FeedbackCategory[] }) {
  const [state, formAction] = useFormState(addCategoryAction, { error: null })
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
          >
            {category.name}
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => deleteCategoryAction(category.id))}
              className="text-slate-400 hover:text-red-600"
              aria-label={`Remove ${category.name}`}
            >
              ×
            </button>
          </span>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-slate-400">No categories yet.</p>
        )}
      </div>
      <form action={formAction} className="mt-3 flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="e.g. Ambience"
          maxLength={40}
          className="w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <AddButton />
      </form>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  )
}

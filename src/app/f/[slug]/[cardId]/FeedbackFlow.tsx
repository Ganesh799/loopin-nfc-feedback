'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { FeedbackCategory } from '@/lib/database.types'

type Step = 'rating' | 'details' | 'thanks'

export function FeedbackFlow({
  slug,
  cardToken,
  categories,
  welcomeMessage,
  thankYouMessage,
  googleReviewUrl,
}: {
  slug: string
  cardToken: string
  categories: FeedbackCategory[]
  welcomeMessage: string
  thankYouMessage: string
  googleReviewUrl: string | null
}) {
  const [step, setStep] = useState<Step>('rating')
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [privateSent, setPrivateSent] = useState(false)

  function selectRating(value: number) {
    setRating(value)
    setStep('details')
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          cardToken,
          rating,
          comment: comment.trim() || undefined,
          categoryIds: Array.from(selectedCategories),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setFeedbackId(data.id)
      setStep('thanks')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function recordOutcome(outcome: 'clicked_google_review' | 'sent_as_private_feedback') {
    if (!feedbackId) return
    // Fire and forget — never block the customer's action on this.
    fetch('/api/feedback-outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId, outcome }),
    }).catch(() => {})
  }

  function handleGoogleClick() {
    recordOutcome('clicked_google_review')
  }

  function handlePrivateClick() {
    recordOutcome('sent_as_private_feedback')
    setPrivateSent(true)
  }

  if (step === 'thanks') {
    return (
      <div className="text-center">
        <div className="brand-bg mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white">
          ✓
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">{thankYouMessage}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your feedback helps this business improve.
        </p>

        <div className="mt-8 space-y-3">
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoogleClick}
              className="brand-bg block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
            >
              Share your experience on Google
            </a>
          )}
          <button
            type="button"
            onClick={handlePrivateClick}
            disabled={privateSent}
            className={clsx(
              'block w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold transition active:scale-[0.99]',
              privateSent
                ? 'border-slate-200 bg-slate-50 text-slate-400'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
          >
            {privateSent ? 'Sent to the business ✓' : 'Send feedback directly to the business'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep('rating')}
          className="mb-4 text-sm text-slate-400 hover:text-slate-600"
        >
          ← Change rating
        </button>
        <h1 className="text-lg font-semibold text-slate-900">
          Anything you&apos;d like to add?
        </h1>
        <p className="mt-1 text-sm text-slate-500">Optional — this stays private to the business.</p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Tell us more…"
          className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />

        {categories.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">What was it about?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = selectedCategories.has(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={clsx(
                      'rounded-full border px-3 py-1.5 text-sm transition',
                      selected
                        ? 'brand-border brand-text bg-brand-50 border-2'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="brand-bg mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit feedback'}
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold text-slate-900">{welcomeMessage}</h1>
      <div className="mt-6 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = (hoverRating ?? rating ?? 0) >= value
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => selectRating(value)}
              className="p-1 transition active:scale-90"
            >
              <svg
                viewBox="0 0 24 24"
                className={clsx('h-10 w-10 sm:h-12 sm:w-12', filled ? 'brand-text' : 'text-slate-200')}
                fill="currentColor"
              >
                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
              </svg>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-slate-400">Tap a star to continue</p>
    </div>
  )
}

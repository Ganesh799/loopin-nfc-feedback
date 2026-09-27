'use client'

import { useState, useTransition } from 'react'
import clsx from 'clsx'
import type { Card } from '@/lib/database.types'
import { toggleCardAction } from './actions'

export function CardRow({
  card,
  feedbackUrl,
  scanCount,
  feedbackCount,
}: {
  card: Card
  feedbackUrl: string
  scanCount: number
  feedbackCount: number
}) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(feedbackUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/cards/${card.id}/qr`}
        alt={`QR code for ${card.label}`}
        className="h-20 w-20 rounded-lg border border-slate-100"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900">{card.label}</h3>
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              card.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            )}
          >
            {card.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-slate-400">{feedbackUrl}</p>
        <p className="mt-1 text-xs text-slate-500">
          {scanCount} scan{scanCount === 1 ? '' : 's'} · {feedbackCount} feedback submission
          {feedbackCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <a
          href={`/api/cards/${card.id}/qr`}
          download={`${card.label}-qr.png`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Download QR
        </a>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleCardAction(card.id, !card.is_active))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {card.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/feedback', label: 'Feedback' },
  { href: '/dashboard/cards', label: 'Cards' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function DashboardNav({ businessName }: { businessName: string }) {
  const pathname = usePathname()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            Loopin
          </Link>
          <span className="hidden text-sm text-slate-400 sm:inline">/ {businessName}</span>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

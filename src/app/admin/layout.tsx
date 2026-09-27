import { requireAdmin } from '@/lib/require-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Loopin</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
              Platform admin
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-slate-300 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

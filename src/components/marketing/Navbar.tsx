import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Loopin
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#how-it-works" className="hover:text-slate-900">
            How it works
          </a>
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Pricing
          </a>
          <a href="#faq" className="hover:text-slate-900">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

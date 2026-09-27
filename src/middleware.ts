import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Run on everything except static assets and the public feedback
    // pages (those are anonymous and never read the auth cookie, so
    // skipping them keeps NFC-tap response times snappy).
    '/((?!_next/static|_next/image|favicon.ico|f/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

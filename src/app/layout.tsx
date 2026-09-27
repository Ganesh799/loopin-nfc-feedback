import type { Metadata } from 'next'
import './globals.css'

// Deliberately not using next/font/google here: it requires a network
// fetch to Google Fonts at build time, which fails in network-restricted
// build environments (CI runners behind a firewall, some Docker builds).
// The system font stack below looks native on every platform and keeps
// the build fully offline-capable. Swap in next/font or a self-hosted
// woff2 file later if a specific brand typeface is wanted.

export const metadata: Metadata = {
  title: 'Loopin — NFC Customer Feedback Made Simple',
  description:
    'Turn every customer interaction into actionable feedback with a tap or a scan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

export function getFeedbackUrl(slug: string, cardToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/f/${slug}/${cardToken}`
}

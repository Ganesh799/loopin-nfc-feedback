import 'server-only'

// Very small fixed-window rate limiter for the public, unauthenticated
// endpoints (feedback submission, scan logging). Two backends:
//
//   - Upstash Redis, if UPSTASH_REDIS_REST_URL/TOKEN are set — works
//     correctly across multiple serverless instances. Use this in
//     production (Vercel runs many instances; in-memory state below
//     would let each instance grant its own separate quota).
//   - An in-memory Map fallback — fine for local dev / a single
//     long-running server, NOT reliable across serverless instances.
//
// This limits abuse (spam/bot submissions) at the network level; it is
// a complement to, not a replacement for, the input validation done in
// each route handler.

interface RateLimitResult {
  success: boolean
  remaining: number
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.count += 1
  return { success: true, remaining: limit - entry.count }
}

async function upstashRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!

  // Atomic INCR + EXPIRE-if-new via a Redis pipeline over the REST API.
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds), 'NX'],
    ]),
    cache: 'no-store',
  })

  if (!res.ok) {
    // Fail open on infra errors rather than blocking real customers.
    return { success: true, remaining: limit }
  }

  const [incrResult] = (await res.json()) as [{ result: number }, unknown]
  const count = incrResult.result
  return { success: count <= limit, remaining: Math.max(0, limit - count) }
}

/**
 * @param key   unique bucket, e.g. `feedback:{ip}` or `scan:{cardId}:{ip}`
 * @param limit max requests allowed in the window
 * @param windowSeconds window length in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashRateLimit(key, limit, windowSeconds)
  }
  return memoryRateLimit(key, limit, windowSeconds * 1000)
}

/** Best-effort client identifier for rate limiting anonymous requests. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}

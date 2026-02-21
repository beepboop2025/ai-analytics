type RateLimitCategory = "auth" | "ai" | "upload" | "general"

const LIMITS: Record<RateLimitCategory, { max: number; windowMs: number }> = {
  auth: { max: 5, windowMs: 60_000 },       // 5 per minute
  ai: { max: 10, windowMs: 60_000 },        // 10 per minute
  upload: { max: 5, windowMs: 60_000 },     // 5 per minute
  general: { max: 30, windowMs: 60_000 },   // 30 per minute
}

// Map<key, timestamp[]> — sliding window per IP+category
const requests = new Map<string, number[]>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of requests) {
    const fresh = timestamps.filter((t) => now - t < 120_000)
    if (fresh.length === 0) {
      requests.delete(key)
    } else {
      requests.set(key, fresh)
    }
  }
}, 300_000)

export function checkRateLimit(category: RateLimitCategory, ip: string) {
  const { max, windowMs } = LIMITS[category]
  const key = `${category}:${ip}`
  const now = Date.now()

  const timestamps = requests.get(key) ?? []
  const windowStart = now - windowMs
  const recent = timestamps.filter((t) => t > windowStart)

  if (recent.length >= max) {
    const oldestInWindow = recent[0]
    const resetAt = new Date(oldestInWindow + windowMs)
    return {
      success: false,
      remaining: 0,
      limit: max,
      resetAt,
    }
  }

  recent.push(now)
  requests.set(key, recent)

  return {
    success: true,
    remaining: max - recent.length,
    limit: max,
    resetAt: new Date(now + windowMs),
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "127.0.0.1"
}

export function rateLimitResponse(resetAt: Date) {
  const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  )
}

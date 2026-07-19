import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit"

// Each test uses a unique IP so the module-level in-memory Map does not leak
// state between cases. The window is 60s, so within a single synchronous test
// no timestamps expire unless we advance fake timers.
let ipCounter = 0
function freshIp() {
  return `10.0.0.${ipCounter++}`
}

describe("checkRateLimit", () => {
  it("allows the first request and reports correct remaining/limit for the auth category", () => {
    const res = checkRateLimit("auth", freshIp())
    expect(res.success).toBe(true)
    expect(res.limit).toBe(5)
    // one request consumed -> 4 remaining
    expect(res.remaining).toBe(4)
    expect(res.resetAt).toBeInstanceOf(Date)
  })

  it("counts down remaining on each successive request within the window", () => {
    const ip = freshIp()
    const remainings = [0, 1, 2, 3, 4].map(() => checkRateLimit("ai", ip).remaining)
    // ai limit is 10: remaining decreases 9,8,7,6,5
    expect(remainings).toEqual([9, 8, 7, 6, 5])
  })

  it("blocks once the max for the category is exceeded", () => {
    const ip = freshIp()
    // upload limit is 5
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("upload", ip).success).toBe(true)
    }
    const blocked = checkRateLimit("upload", ip)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.limit).toBe(5)
  })

  it("isolates counters per category for the same IP", () => {
    const ip = freshIp()
    // exhaust auth (5) but ai must remain fully available
    for (let i = 0; i < 5; i++) checkRateLimit("auth", ip)
    expect(checkRateLimit("auth", ip).success).toBe(false)
    expect(checkRateLimit("ai", ip).success).toBe(true)
  })

  it("isolates counters per IP for the same category", () => {
    const a = freshIp()
    const b = freshIp()
    for (let i = 0; i < 5; i++) checkRateLimit("auth", a)
    expect(checkRateLimit("auth", a).success).toBe(false)
    // a different IP is unaffected
    expect(checkRateLimit("auth", b).success).toBe(true)
  })

  it("sets resetAt to the moment the oldest in-window request expires when blocked", () => {
    vi.useFakeTimers()
    try {
      const ip = freshIp()
      const t0 = new Date("2026-01-01T00:00:00.000Z").getTime()
      vi.setSystemTime(t0)
      // first (oldest) request at t0
      checkRateLimit("auth", ip)
      // advance 10s and fill the rest of the window
      vi.setSystemTime(t0 + 10_000)
      for (let i = 0; i < 4; i++) checkRateLimit("auth", ip)
      const blocked = checkRateLimit("auth", ip)
      expect(blocked.success).toBe(false)
      // resetAt is oldest (t0) + windowMs (60s)
      expect(blocked.resetAt.getTime()).toBe(t0 + 60_000)
    } finally {
      vi.useRealTimers()
    }
  })

  it("frees capacity again once old timestamps slide out of the window", () => {
    vi.useFakeTimers()
    try {
      const ip = freshIp()
      const t0 = Date.now()
      vi.setSystemTime(t0)
      for (let i = 0; i < 5; i++) checkRateLimit("auth", ip)
      expect(checkRateLimit("auth", ip).success).toBe(false)
      // advance just past the window so all 5 timestamps expire
      vi.setSystemTime(t0 + 60_001)
      expect(checkRateLimit("auth", ip).success).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("getClientIp", () => {
  it("prefers x-real-ip and trims surrounding whitespace", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "  203.0.113.7  " },
    })
    expect(getClientIp(req)).toBe("203.0.113.7")
  })

  it("falls back to the rightmost (most trusted) x-forwarded-for entry", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2, 9.9.9.9" },
    })
    // rightmost entry is the one added by the trusted proxy
    expect(getClientIp(req)).toBe("9.9.9.9")
  })

  it("defaults to loopback when no proxy headers are present", () => {
    const req = new Request("https://example.com")
    expect(getClientIp(req)).toBe("127.0.0.1")
  })
})

describe("rateLimitResponse", () => {
  it("returns a 429 with a rounded-up Retry-After header and JSON error body", async () => {
    vi.useFakeTimers()
    try {
      const now = Date.now()
      vi.setSystemTime(now)
      // 4.2s in the future -> Retry-After should ceil to 5
      const res = rateLimitResponse(new Date(now + 4_200))
      expect(res.status).toBe(429)
      expect(res.headers.get("Retry-After")).toBe("5")
      expect(res.headers.get("Content-Type")).toBe("application/json")
      const body = await res.json()
      expect(body).toEqual({
        error: "Too many requests. Please try again later.",
      })
    } finally {
      vi.useRealTimers()
    }
  })
})

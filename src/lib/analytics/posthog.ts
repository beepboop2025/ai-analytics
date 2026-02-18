import posthog from "posthog-js"

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

let initialized = false

export function initPostHog() {
  if (typeof window === "undefined" || initialized || !POSTHOG_KEY) return
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // We handle this manually for SPA route changes
    capture_pageleave: true,
  })
  initialized = true
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized) return
  posthog.identify(userId, properties)
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return
  posthog.capture(event, properties)
}

export function capturePageView(path: string) {
  if (!initialized) return
  posthog.capture("$pageview", { $current_url: path })
}

export { posthog }

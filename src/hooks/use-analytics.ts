"use client"

import { useCallback } from "react"
import { track, events } from "@/lib/analytics/events"

export function useTrack() {
  const trackEvent = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      track(event, properties)
    },
    [],
  )

  return { track: trackEvent, events }
}

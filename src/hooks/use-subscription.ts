"use client"

import { useState, useEffect } from "react"
import type { SubscriptionInfo } from "@/types"

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription")
        if (res.ok) {
          setSubscription(await res.json())
        }
      } catch {
        // Subscription fetch failed silently — user may not have one yet
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const canQuery = subscription
    ? subscription.queriesLimit === -1 || subscription.queriesUsed < subscription.queriesLimit
    : false

  const canUpload = subscription
    ? subscription.datasetsLimit === -1
    : false

  return { subscription, loading, canQuery, canUpload, refetch: () => setLoading(true) }
}

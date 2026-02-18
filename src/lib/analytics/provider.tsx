"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { initPostHog, capturePageView, identifyUser } from "./posthog"
import { useSession } from "next-auth/react"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      })
    }
  }, [session])

  useEffect(() => {
    capturePageView(pathname)
  }, [pathname])

  return <>{children}</>
}

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertTriangle, Loader2, X } from "lucide-react"

export function EmailVerificationBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)

  const emailVerified = session?.user?.emailVerified

  // Don't show if verified, dismissed, or no session
  if (!session?.user || emailVerified || dismissed) return null

  async function handleResend() {
    setResending(true)
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" })
      if (res.ok) {
        toast.success("Verification email sent!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send email")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">Please verify your email address to secure your account.</span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 border-amber-300 bg-transparent text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
        onClick={handleResend}
        disabled={resending}
      >
        {resending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
        Resend email
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

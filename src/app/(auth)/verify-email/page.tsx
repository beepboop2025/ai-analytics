"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Missing verification token.")
      return
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (res.ok) {
          setStatus("success")
        } else {
          const data = await res.json()
          setStatus("error")
          setErrorMessage(data.error || "Verification failed")
        }
      } catch {
        setStatus("error")
        setErrorMessage("Something went wrong")
      }
    }

    verify()
  }, [token])

  return (
    <Card className="glass-card border-border/40 shadow-[0_16px_48px_-16px_rgba(30,58,138,0.12)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
      <CardHeader className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifying email...</CardTitle>
            <CardDescription>Please wait while we verify your email address.</CardDescription>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 animate-check-pop">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Email Verified</CardTitle>
            <CardDescription>Your email has been verified successfully.</CardDescription>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 animate-fade-in-up">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardFooter className="justify-center">
        {status === "success" ? (
          <Link href="/dashboard" className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80">
            Go to Dashboard
          </Link>
        ) : status === "error" ? (
          <Link href="/login" className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80">
            Back to sign in
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Card className="glass-card border-border/40">
        <CardHeader className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </CardHeader>
      </Card>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

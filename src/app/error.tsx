"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.04] via-transparent to-destructive/[0.04] animate-gradient" />
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-8 rounded-full px-6">
          Try again
        </Button>
      </div>
    </div>
  )
}

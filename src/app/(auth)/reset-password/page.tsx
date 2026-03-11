"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { BarChart3, CheckCircle2, Loader2 } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password")
        return
      }

      setSuccess(true)
      toast.success("Password reset successfully!")
      setTimeout(() => router.push("/login"), 2000)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="glass-card border-border/40 shadow-[0_16px_48px_-16px_rgba(30,58,138,0.12)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Invalid Link</CardTitle>
          <CardDescription>This password reset link is invalid or has expired.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/forgot-password" className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80">
            Request a new reset link
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="glass-card border-border/40 shadow-[0_16px_48px_-16px_rgba(30,58,138,0.12)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 animate-check-pop">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Password Reset</CardTitle>
          <CardDescription>Your password has been reset. Redirecting to login...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-border/40 shadow-[0_16px_48px_-16px_rgba(30,58,138,0.12)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.52_0.12_280)] shadow-lg shadow-primary/20">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="btn-gradient w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="glass-card border-border/40">
        <CardHeader className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </CardHeader>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

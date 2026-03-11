"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Check, CreditCard, Loader2, ExternalLink } from "lucide-react"
import type { SubscriptionInfo } from "@/types"

const planFeatures: Record<string, string[]> = {
  FREE: ["3 datasets", "10 AI queries/month", "5MB uploads", "5 reports", "CSV export"],
  PRO: ["50 datasets", "500 AI queries/month", "50MB uploads", "Unlimited reports", "CSV & PDF export", "Email support"],
  ENTERPRISE: ["Unlimited datasets", "Unlimited AI queries", "500MB uploads", "All export formats", "Priority support", "API access"],
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("success")) toast.success("Subscription activated!")
    if (searchParams.get("canceled")) toast.info("Checkout canceled")
  }, [searchParams])

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription")
        if (res.ok) setSubscription(await res.json())
      } catch {
        // Default to free
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Failed to open billing portal")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPortalLoading(false)
    }
  }

  const plan = subscription?.plan || "FREE"
  const features = planFeatures[plan] || planFeatures.FREE

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="surface-panel border-border/50 animate-fade-in-up animate-delay-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </div>
            <Badge
              variant={plan === "FREE" ? "secondary" : "default"}
              className={`rounded-full px-3 py-1 text-base ${plan !== "FREE" ? "animate-subtle-pulse" : ""}`}
            >
              {plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-5 w-36 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {subscription?.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {subscription.status === "active" ? "Renews" : "Expires"} on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="surface-panel border-border/50 animate-fade-in-up animate-delay-200">
        <CardHeader>
          <CardTitle>Usage This Period</CardTitle>
          <CardDescription>Track your resource consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">AI Queries</span>
                  <span className="text-muted-foreground">
                    {subscription?.queriesUsed || 0} /{" "}
                    {subscription?.queriesLimit === -1 ? "Unlimited" : subscription?.queriesLimit || 10}
                  </span>
                </div>
                <Progress
                  value={
                    subscription?.queriesLimit === -1
                      ? 0
                      : ((subscription?.queriesUsed || 0) / (subscription?.queriesLimit || 10)) * 100
                  }
                />
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Datasets</span>
                  <span className="text-muted-foreground">
                    {subscription?.datasetsLimit === -1 ? "Unlimited" : `Limit: ${subscription?.datasetsLimit || 3}`}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="surface-panel border-border/50 animate-fade-in-up animate-delay-300">
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>Change your plan, update payment method, or view invoices</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          {plan === "FREE" ? (
            <Button asChild className="btn-gradient">
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          ) : (
            <Button onClick={openPortal} disabled={portalLoading} className="rounded-full transition-all duration-200">
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage in Stripe
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

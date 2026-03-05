"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ArrowRight, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { events } from "@/lib/analytics/events"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Validate the workflow with real operational exports.",
    features: [
      "3 datasets",
      "10 AI queries/month",
      "5MB file uploads",
      "5 reports",
      "CSV upload support",
      "Email authentication flows",
    ],
    cta: "Start free",
    popular: false,
    plan: "FREE" as const,
    bestFor: "Best for solo operators and initial evaluation.",
  },
  {
    name: "Pro",
    price: 29,
    description: "The default choice for recurring weekly and monthly reviews.",
    features: [
      "50 datasets",
      "500 AI queries/month",
      "50MB file uploads",
      "Unlimited reports",
      "Self-serve billing",
      "Higher operating headroom",
    ],
    cta: "Choose Pro",
    popular: true,
    plan: "PRO" as const,
    bestFor: "Best for finance, RevOps, and product teams running a real cadence.",
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For larger teams, larger files, and open-ended AI usage.",
    features: [
      "Unlimited datasets",
      "Unlimited AI queries",
      "500MB file uploads",
      "Unlimited reports",
      "Priority support",
      "Plan-level headroom",
      "Commercial flexibility",
    ],
    cta: "Choose Enterprise",
    popular: false,
    plan: "ENTERPRISE" as const,
    bestFor: "Best for teams treating the workspace as a core operating layer.",
  },
]

export function PricingCards() {
  const router = useRouter()
  const { data: session } = useSession()

  async function handleCheckout(plan: typeof plans[number]) {
    if (plan.plan === "FREE") {
      router.push(session ? "/dashboard" : "/signup")
      return
    }

    if (!session) {
      router.push("/signup")
      return
    }

    events.checkoutStarted(plan.name, plan.price)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative flex h-full flex-col overflow-hidden border-border/70 py-0 ${
            plan.popular
              ? "surface-panel scale-[1.01] shadow-[0_28px_80px_-38px_rgba(53,91,184,0.45)]"
              : "surface-panel"
          }`}
        >
          {plan.popular && (
            <Badge className="absolute left-6 top-6 rounded-full px-3 py-1">
              Most popular
            </Badge>
          )}
          <CardHeader className="p-6 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-3 text-sm leading-7">{plan.description}</CardDescription>
              </div>
              {!plan.popular && <Badge variant="outline" className="rounded-full px-3 py-1">Plan</Badge>}
            </div>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight">${plan.price}</span>
              <span className="pb-1 text-sm text-muted-foreground">
                {plan.price > 0 ? "/month" : "to start"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.bestFor}</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 rounded-[1.5rem] border border-border/70 bg-muted/35 p-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button
              className="h-11 w-full rounded-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleCheckout(plan)}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

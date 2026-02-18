"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { events } from "@/lib/analytics/events"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For individuals getting started",
    features: [
      "3 datasets",
      "10 AI queries/month",
      "5MB file uploads",
      "5 reports",
      "CSV export",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
    plan: "FREE" as const,
  },
  {
    name: "Pro",
    price: 29,
    description: "For professionals and growing teams",
    features: [
      "50 datasets",
      "500 AI queries/month",
      "50MB file uploads",
      "Unlimited reports",
      "CSV & PDF export",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    plan: "PRO" as const,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For teams that need the best",
    features: [
      "Unlimited datasets",
      "Unlimited AI queries",
      "500MB file uploads",
      "Unlimited reports",
      "CSV, PDF & API export",
      "Priority support",
      "API access",
      "5 team members",
    ],
    cta: "Upgrade to Enterprise",
    popular: false,
    plan: "ENTERPRISE" as const,
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
    <div className="grid gap-8 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleCheckout(plan)}
            >
              {plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

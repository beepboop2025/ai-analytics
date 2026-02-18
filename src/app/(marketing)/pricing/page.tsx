import { PricingCards } from "@/components/marketing/pricing-cards"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for AI data analytics. Free tier available, no credit card required.",
}

export default function PricingPage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free with 10 AI queries per month. Upgrade as you grow.
            No hidden fees, cancel anytime.
          </p>
        </div>
        <div className="mt-16">
          <PricingCards />
        </div>
      </div>
    </section>
  )
}

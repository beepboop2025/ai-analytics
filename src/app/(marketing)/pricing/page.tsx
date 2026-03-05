import type { Metadata } from "next"
import { PricingCards } from "@/components/marketing/pricing-cards"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for teams using AI analytics on operational data. Start free and upgrade when the workflow becomes recurring.",
}

export default function PricingPage() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Pricing</div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Commercially simple, operationally useful.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Start with the free workspace, prove the workflow with real exports, and upgrade when
            your team needs more volume, bigger files, or always-on usage.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="metric-chip text-left">
            <div className="text-sm font-semibold">No setup theater</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign up, upload a real dataset, and validate the workflow before you spend anything.
            </p>
          </div>
          <div className="metric-chip text-left">
            <div className="text-sm font-semibold">Usage-based progression</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Plans scale by query volume, dataset capacity, and upload size so pricing stays legible.
            </p>
          </div>
          <div className="metric-chip text-left">
            <div className="text-sm font-semibold">Billing already wired</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Checkout and billing portal support are built into the application layer.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <PricingCards />
        </div>
      </div>
    </section>
  )
}

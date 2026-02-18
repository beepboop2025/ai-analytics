import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() for lazy init. Kept for import compatibility. */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  PRO: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "50 datasets",
      "500 AI queries/month",
      "50MB file uploads",
      "Unlimited reports",
      "CSV & PDF export",
      "Email support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
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
  },
} as const

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
    metadata: { userId },
  })
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/billing`,
  })
}

export async function getOrCreateCustomer(email: string, name?: string | null) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return stripe.customers.create({ email, name: name ?? undefined })
}

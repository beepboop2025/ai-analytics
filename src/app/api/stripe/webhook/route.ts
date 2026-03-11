import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/types"
import type { Plan } from "@/generated/prisma/enums"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (!userId || !subscriptionId) break

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = stripeSubscription.items.data[0]?.price.id

        let plan: Plan = "FREE"
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "PRO"
        else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = "ENTERPRISE"

        const limits = PLAN_LIMITS[plan]

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            plan,
            status: "active",
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            queriesLimit: limits.queriesLimit,
            datasetsLimit: limits.datasetsLimit,
            maxFileSize: limits.maxFileSize,
          },
        })

        await prisma.auditLog.create({
          data: { action: "subscription.created", userId, details: { plan } },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        let plan: Plan = "FREE"
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "PRO"
        else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = "ENTERPRISE"

        const limits = PLAN_LIMITS[plan]

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            plan,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            queriesLimit: limits.queriesLimit,
            datasetsLimit: limits.datasetsLimit,
            maxFileSize: limits.maxFileSize,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const freeLimits = PLAN_LIMITS.FREE

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            status: "canceled",
            stripeSubscriptionId: null,
            queriesLimit: freeLimits.queriesLimit,
            datasetsLimit: freeLimits.datasetsLimit,
            maxFileSize: freeLimits.maxFileSize,
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Reset usage counter on new billing period
        if (invoice.billing_reason === "subscription_cycle") {
          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: { queriesUsed: 0 },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: { status: "past_due" },
        })
        break
      }
    }
  } catch (error) {
    // Return 200 to acknowledge receipt and prevent Stripe retry storms.
    // Permanent errors (e.g. missing subscription record) would keep failing
    // on retries, creating a 3-day retry loop. Log for investigation instead.
    console.error("Webhook processing error (acknowledged to prevent retries):", error)
  }

  return NextResponse.json({ received: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, getOrCreateCustomer } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const { plan } = await request.json()

    const priceId =
      plan === "PRO"
        ? process.env.STRIPE_PRO_PRICE_ID
        : plan === "ENTERPRISE"
          ? process.env.STRIPE_ENTERPRISE_PRICE_ID
          : null

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(session.user.email, session.user.name)

    // Update subscription record with real Stripe customer ID
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customer.id },
      create: {
        userId: session.user.id,
        stripeCustomerId: customer.id,
        plan: "FREE",
        queriesLimit: 10,
        datasetsLimit: 3,
        maxFileSize: 5,
      },
    })

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: { userId: session.user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

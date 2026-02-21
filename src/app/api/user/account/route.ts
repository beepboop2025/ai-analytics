import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { del } from "@vercel/blob"
import { z } from "zod"

const deleteSchema = z.object({
  confirmation: z.literal("DELETE"),
})

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please type DELETE to confirm account deletion" },
        { status: 400 },
      )
    }

    const userId = session.user.id

    // Create audit log first (SetNull preserves it after user deletion)
    await prisma.auditLog.create({
      data: {
        action: "account.deleted",
        userId,
        details: { email: session.user.email },
      },
    })

    // Cancel Stripe subscription if active
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (subscription?.stripeSubscriptionId) {
      try {
        const stripe = getStripe()
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      } catch (error) {
        console.error("Failed to cancel Stripe subscription:", error)
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete Vercel Blob files for each dataset
    const datasets = await prisma.dataset.findMany({
      where: { userId },
      select: { fileUrl: true },
    })

    for (const dataset of datasets) {
      try {
        await del(dataset.fileUrl)
      } catch (error) {
        console.error("Failed to delete blob:", error)
        // Continue — orphaned blobs are acceptable
      }
    }

    // Delete user — Prisma cascades handle related records
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

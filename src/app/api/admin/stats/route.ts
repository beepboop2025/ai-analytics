import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [
      totalUsers,
      totalDatasets,
      totalReports,
      subscriptionsByPlan,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dataset.count(),
      prisma.report.count(),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ])

    const planCounts = {
      FREE: 0,
      PRO: 0,
      ENTERPRISE: 0,
      ...Object.fromEntries(
        subscriptionsByPlan.map((s) => [s.plan, s._count.plan]),
      ),
    }

    const mrr = (planCounts.PRO * 29) + (planCounts.ENTERPRISE * 99)

    return NextResponse.json({
      totalUsers,
      totalDatasets,
      totalReports,
      mrr,
      planCounts,
      recentSignups,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

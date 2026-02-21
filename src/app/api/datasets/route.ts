import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

export async function GET(request: Request) {
  try {
    const rl = checkRateLimit("general", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const datasets = await prisma.dataset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        fileName: true,
        format: true,
        rowCount: true,
        fileSize: true,
        columns: true,
        createdAt: true,
      },
    })

    return NextResponse.json(datasets)
  } catch (error) {
    console.error("Datasets fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch datasets" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const rl = checkRateLimit("general", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing dataset ID" }, { status: 400 })
    }

    const dataset = await prisma.dataset.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // Delete associated reports first, then the dataset
    await prisma.report.deleteMany({ where: { datasetId: id } })
    await prisma.dataset.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        action: "dataset.deleted",
        userId: session.user.id,
        details: { datasetId: id, name: dataset.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Dataset delete error:", error)
    return NextResponse.json({ error: "Failed to delete dataset" }, { status: 500 })
  }
}

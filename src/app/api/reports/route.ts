import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createReportSchema = z.object({
  datasetId: z.string(),
  title: z.string().min(1),
  content: z.object({
    insights: z.array(z.any()),
    charts: z.array(z.any()),
    summary: z.string(),
  }),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        dataset: { select: { name: true } },
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { datasetId, title, content } = parsed.data

    // Verify dataset belongs to user
    const dataset = await prisma.dataset.findFirst({
      where: { id: datasetId, userId: session.user.id },
    })
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        title,
        content: JSON.parse(JSON.stringify(content)),
        datasetId,
        userId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "report.created",
        userId: session.user.id,
        details: { reportId: report.id, datasetId },
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Report create error:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 })
    }

    const report = await prisma.report.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    await prisma.report.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report delete error:", error)
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeDataset } from "@/lib/ai"
import { parseFile, getFileFormat } from "@/lib/upload"
import { z } from "zod"

const analyzeSchema = z.object({
  datasetId: z.string(),
  prompt: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = analyzeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { datasetId, prompt } = parsed.data

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (subscription) {
      const atLimit = subscription.queriesLimit !== -1 && subscription.queriesUsed >= subscription.queriesLimit
      if (atLimit) {
        return NextResponse.json(
          { error: "Query limit reached. Upgrade your plan for more queries." },
          { status: 429 },
        )
      }
    }

    // Fetch dataset
    const dataset = await prisma.dataset.findFirst({
      where: { id: datasetId, userId: session.user.id },
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // Fetch and parse file content
    const res = await fetch(dataset.fileUrl)
    const format = getFileFormat(dataset.fileName)
    let content: string | ArrayBuffer

    if (format === "xlsx" || format === "xls") {
      content = await res.arrayBuffer()
    } else {
      content = await res.text()
    }

    const { rows, columns } = parseFile(content, format)

    // Send to Claude for analysis
    const analysis = await analyzeDataset(columns, rows.slice(0, 500), prompt, dataset.rowCount)

    // Increment usage
    if (subscription) {
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: { queriesUsed: { increment: 1 } },
      })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "ai.analyze",
        userId: session.user.id,
        details: { datasetId, promptLength: prompt.length },
      },
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

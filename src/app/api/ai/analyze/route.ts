import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeDataset } from "@/lib/ai"
import { parseFile, getFileFormat } from "@/lib/upload"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import { z } from "zod"

const analyzeSchema = z.object({
  datasetId: z.string(),
  prompt: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit("ai", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

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

    // Check quota limit (but don't decrement yet — wait until dataset is validated)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (subscription && subscription.queriesLimit !== -1) {
      if (subscription.queriesUsed >= subscription.queriesLimit) {
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

    // Validate URL points to Vercel Blob to prevent SSRF
    try {
      const fileHost = new URL(dataset.fileUrl).hostname
      if (!fileHost.endsWith(".vercel-storage.com") && !fileHost.endsWith(".public.blob.vercel-storage.com")) {
        return NextResponse.json({ error: "Invalid file source" }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 })
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

    // Atomically increment usage just before the AI call
    if (subscription) {
      if (subscription.queriesLimit !== -1) {
        const updated = await prisma.subscription.updateMany({
          where: {
            userId: session.user.id,
            OR: [
              { queriesLimit: -1 },
              { queriesUsed: { lt: subscription.queriesLimit } },
            ],
          },
          data: { queriesUsed: { increment: 1 } },
        })
        if (updated.count === 0) {
          return NextResponse.json(
            { error: "Query limit reached. Upgrade your plan for more queries." },
            { status: 429 },
          )
        }
      } else {
        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: { queriesUsed: { increment: 1 } },
        })
      }
    }

    // Send to Claude for analysis
    const analysis = await analyzeDataset(columns, rows.slice(0, 500), prompt, dataset.rowCount)

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

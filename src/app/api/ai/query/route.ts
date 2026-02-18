import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { queryData } from "@/lib/ai"
import { parseFile, getFileFormat } from "@/lib/upload"
import { z } from "zod"

const querySchema = z.object({
  datasetId: z.string(),
  query: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = querySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { datasetId, query } = parsed.data

    // Check limits
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

    const dataset = await prisma.dataset.findFirst({
      where: { id: datasetId, userId: session.user.id },
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    const res = await fetch(dataset.fileUrl)
    const format = getFileFormat(dataset.fileName)
    const content = format === "xlsx" || format === "xls" ? await res.arrayBuffer() : await res.text()
    const { rows, columns } = parseFile(content, format)

    const result = await queryData(columns, rows.slice(0, 500), query, dataset.rowCount)

    if (subscription) {
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: { queriesUsed: { increment: 1 } },
      })
    }

    await prisma.auditLog.create({
      data: {
        action: "ai.query",
        userId: session.user.id,
        details: { datasetId, queryLength: query.length },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Query error:", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { parseFile, getFileFormat } from "@/lib/upload"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit("upload", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    // Check file size limit
    const maxSizeMB = subscription?.maxFileSize || 5
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return NextResponse.json(
        { error: `File too large. Max size for your plan: ${maxSizeMB}MB` },
        { status: 413 },
      )
    }

    // Check dataset count limit
    if (subscription && subscription.datasetsLimit !== -1) {
      const datasetCount = await prisma.dataset.count({
        where: { userId: session.user.id },
      })
      if (datasetCount >= subscription.datasetsLimit) {
        return NextResponse.json(
          { error: `Dataset limit reached (${subscription.datasetsLimit}). Upgrade for more.` },
          { status: 429 },
        )
      }
    }

    // Validate format
    const format = getFileFormat(file.name)

    // Parse file to detect schema
    let content: string | ArrayBuffer
    if (format === "xlsx" || format === "xls") {
      content = await file.arrayBuffer()
    } else {
      content = await file.text()
    }

    const parsed = parseFile(content, format)

    // Upload to Vercel Blob
    const blob = await put(`datasets/${session.user.id}/${Date.now()}-${file.name}`, file, {
      access: "private",
    })

    // Create dataset record
    const dataset = await prisma.dataset.create({
      data: {
        name: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        fileUrl: blob.url,
        format,
        rowCount: parsed.rowCount,
        columns: JSON.parse(JSON.stringify(parsed.columns)),
        fileSize: file.size,
        userId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "dataset.uploaded",
        userId: session.user.id,
        details: { datasetId: dataset.id, format, rowCount: parsed.rowCount, fileSize: file.size },
      },
    })

    return NextResponse.json(dataset, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

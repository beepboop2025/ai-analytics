import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          subscription: {
            select: { plan: true, status: true, queriesUsed: true },
          },
          _count: { select: { datasets: true, reports: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, role } = await request.json()
    if (!userId || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })

    await prisma.auditLog.create({
      data: {
        action: "admin.role_change",
        userId: session.user.id,
        details: { targetUserId: userId, newRole: role },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Admin role change error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

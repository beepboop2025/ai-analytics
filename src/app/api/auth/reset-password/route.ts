import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/email"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit("auth", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const { token, password } = parsed.data
    const hashed = hashToken(token)

    // Find the token record
    const record = await prisma.verificationToken.findFirst({
      where: {
        token: hashed,
        identifier: { startsWith: "pwd-reset:" },
        expires: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 },
      )
    }

    const email = record.identifier.replace("pwd-reset:", "")
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: record.identifier,
          token: record.token,
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "password.reset",
        details: { email },
      },
    })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

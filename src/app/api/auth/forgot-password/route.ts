import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail, hashToken } from "@/lib/email"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import crypto from "crypto"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit("auth", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const { email } = parsed.data

    // Always respond the same way to prevent user enumeration
    const successResponse = NextResponse.json({
      message: "If an account with that email exists, we've sent a reset link.",
    })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      // No account or OAuth-only — don't reveal this
      return successResponse
    }

    // Generate token and store hash
    const token = crypto.randomBytes(32).toString("hex")
    const hashed = hashToken(token)
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Clean up old reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: `pwd-reset:${email}` },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: `pwd-reset:${email}`,
        token: hashed,
        expires,
      },
    })

    await sendPasswordResetEmail(email, token)

    return successResponse
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

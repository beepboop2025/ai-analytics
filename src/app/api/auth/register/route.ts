import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit("auth", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscription: {
          create: {
            stripeCustomerId: `cus_pending_${Date.now()}`,
            plan: "FREE",
            queriesLimit: 10,
            datasetsLimit: 3,
            maxFileSize: 5,
          },
        },
      },
    })

    // Send verification email (fire-and-forget)
    import("@/lib/email").then(({ generateAndSendVerificationEmail }) => {
      generateAndSendVerificationEmail(email).catch((err) =>
        console.error("Failed to send verification email:", err),
      )
    })

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

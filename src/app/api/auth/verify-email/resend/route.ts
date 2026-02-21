import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateAndSendVerificationEmail } from "@/lib/email"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit("auth", getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    await generateAndSendVerificationEmail(session.user.email)

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}

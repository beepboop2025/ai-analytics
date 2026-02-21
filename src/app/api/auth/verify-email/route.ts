import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/email"
import { z } from "zod"

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const hashed = hashToken(parsed.data.token)

    const record = await prisma.verificationToken.findFirst({
      where: {
        token: hashed,
        identifier: { startsWith: "email-verify:" },
        expires: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 },
      )
    }

    const email = record.identifier.replace("email-verify:", "")

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
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

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

import { Resend } from "resend"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

const FROM_EMAIL = "DataLens AI <noreply@datalens.ai>"

function getAppUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000"
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your DataLens AI password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your DataLens AI account.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">DataLens AI</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DataLens AI email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Welcome to DataLens AI! Please verify your email address to get the most out of your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">DataLens AI</p>
      </div>
    `,
  })
}

/**
 * Generates a verification token, stores its hash in the DB, and sends the email.
 * Reusable by both registration and resend-verification flows.
 */
export async function generateAndSendVerificationEmail(email: string) {
  const token = crypto.randomBytes(32).toString("hex")
  const hashed = hashToken(token)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: `email-verify:${email}` },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: `email-verify:${email}`,
      token: hashed,
      expires,
    },
  })

  await sendVerificationEmail(email, token)
}

export { hashToken }

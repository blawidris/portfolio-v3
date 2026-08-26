import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest } from "@/lib/errors/api"
import { forgotPasswordSchema } from "@/lib/validation/auth"
import { canIssueResetToken, createResetToken } from "@/lib/auth/reset-tokens"
import { sendPasswordResetEmail } from "@/lib/email/resend"
import { logServerError } from "@/lib/logger"
import { getServerEnvironment } from "@/lib/env"

// Always the same response, whether the email is registered, inactive,
// cooling down, or email delivery is unconfigured — a public endpoint must
// never let a caller distinguish those cases from each other.
const GENERIC_RESPONSE = { message: "If that email is registered, a reset link has been sent." }

export async function POST(req: Request) {
  try {
    const input = forgotPasswordSchema.parse(await parseJsonRequest(req))
    const email = input.email.trim().toLowerCase()
    const admin = await prisma.admin.findUnique({ where: { email } })

    if (admin?.isActive && (await canIssueResetToken(admin.id))) {
      const token = await createResetToken(admin.id)
      const resetUrl = `${getServerEnvironment().NEXT_PUBLIC_SITE_URL}/admin/reset-password?token=${token}`

      try {
        await sendPasswordResetEmail(admin.email, resetUrl)
      } catch (error) {
        logServerError("Password reset email not sent.", error, { context: "admin.auth.forgot-password" })
      }
    }

    return Response.json(GENERIC_RESPONSE)
  } catch (error) {
    return handleApiError(error, "admin.auth.forgot-password")
  }
}

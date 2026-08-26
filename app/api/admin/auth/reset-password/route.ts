import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, parseJsonRequest } from "@/lib/errors/api"
import { resetPasswordSchema } from "@/lib/validation/auth"
import { consumeResetToken } from "@/lib/auth/reset-tokens"
import { hashPassword } from "@/lib/auth/password"

export async function POST(req: Request) {
  try {
    const input = resetPasswordSchema.parse(await parseJsonRequest(req))
    const admin = await consumeResetToken(input.token)

    if (!admin) {
      return apiError(400, "INVALID_TOKEN", "This reset link is invalid or has expired.")
    }

    const passwordHash = await hashPassword(input.password)
    // A successful reset is the escape hatch out of an account lockout, so it
    // must clear lockout state — otherwise a locked-out owner can reset their
    // password and still be unable to log in for another 15 minutes.
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    })

    return Response.json({ message: "Password updated. You can now sign in." })
  } catch (error) {
    return handleApiError(error, "admin.auth.reset-password")
  }
}

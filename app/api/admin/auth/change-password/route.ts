import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { changePasswordSchema } from "@/lib/validation/auth"
import { hashPassword, verifyPassword } from "@/lib/auth/password"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return unauthorizedResponse()

  try {
    const input = changePasswordSchema.parse(await parseJsonRequest(req))
    const admin = await prisma.admin.findUnique({ where: { email: session.user.email } })
    if (!admin) return unauthorizedResponse()

    const currentPasswordMatches = await verifyPassword(input.currentPassword, admin.passwordHash)
    if (!currentPasswordMatches) {
      return apiError(422, "VALIDATION_ERROR", "The submitted data is invalid.", {
        currentPassword: ["Current password is incorrect."],
      })
    }

    const passwordHash = await hashPassword(input.newPassword)
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } })

    return Response.json({ message: "Password updated." })
  } catch (error) {
    return handleApiError(error, "admin.auth.change-password")
  }
}

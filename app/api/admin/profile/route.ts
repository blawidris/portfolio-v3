import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { profileUpdateSchema } from "@/lib/validation/profile"
import { revalidateProfile } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const profile = await prisma.profile.findUnique({ where: { id: "profile" } })
  return Response.json(profile)
}

// Profile is a singleton (fixed id "profile", created by prisma/seed.ts) —
// there is no create/delete route, only read and update.
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = profileUpdateSchema.parse(await parseJsonRequest(req))
    const profile = await prisma.profile.update({ where: { id: "profile" }, data: input })
    revalidateProfile()
    return Response.json(profile)
  } catch (error) {
    return handleApiError(error, "profile.update")
  }
}

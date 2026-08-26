import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { experienceUpdateSchema } from "@/lib/validation/experience"
import { revalidateExperience } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = experienceUpdateSchema.parse(await parseJsonRequest(req))
    const experience = await prisma.experience.update({ where: { id }, data: input })
    revalidateExperience()
    return Response.json(experience)
  } catch (error) {
    return handleApiError(error, "experience.update")
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    await prisma.experience.delete({ where: { id } })
    revalidateExperience()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "experience.delete")
  }
}

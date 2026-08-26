import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { skillUpdateSchema } from "@/lib/validation/skills"
import { revalidateSkills } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = skillUpdateSchema.parse(await parseJsonRequest(req))
    const skill = await prisma.skill.update({ where: { id }, data: input })
    revalidateSkills()
    return Response.json(skill)
  } catch (error) {
    return handleApiError(error, "skills.update")
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
    await prisma.skill.delete({ where: { id } })
    revalidateSkills()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "skills.delete")
  }
}

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { skillCategoryUpdateSchema } from "@/lib/validation/skills"
import { revalidateSkills } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = skillCategoryUpdateSchema.parse(await parseJsonRequest(req))
    const category = await prisma.skillCategory.update({ where: { id }, data: input })
    revalidateSkills()
    return Response.json(category)
  } catch (error) {
    return handleApiError(error, "skill-categories.update")
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
    await prisma.skillCategory.delete({ where: { id } })
    revalidateSkills()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "skill-categories.delete")
  }
}

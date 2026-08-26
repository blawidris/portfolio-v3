import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { skillInputSchema } from "@/lib/validation/skills"
import { revalidateSkills } from "@/lib/content/cache"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = skillInputSchema.parse(await parseJsonRequest(req))
    const skill = await prisma.skill.create({ data: input })
    revalidateSkills()
    return Response.json(skill, { status: 201 })
  } catch (error) {
    return handleApiError(error, "skills.create")
  }
}

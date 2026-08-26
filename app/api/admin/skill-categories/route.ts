import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { skillCategoryInputSchema } from "@/lib/validation/skills"
import { revalidateSkills } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: { skills: { orderBy: { order: "asc" } } },
  })
  return Response.json(categories)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = skillCategoryInputSchema.parse(await parseJsonRequest(req))
    const category = await prisma.skillCategory.create({ data: input })
    revalidateSkills()
    return Response.json(category, { status: 201 })
  } catch (error) {
    return handleApiError(error, "skill-categories.create")
  }
}

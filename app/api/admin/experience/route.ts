import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { experienceInputSchema } from "@/lib/validation/experience"
import { revalidateExperience } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const experience = await prisma.experience.findMany({ orderBy: { order: "asc" } })
  return Response.json(experience)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = experienceInputSchema.parse(await parseJsonRequest(req))
    const experience = await prisma.experience.create({ data: input })
    revalidateExperience()
    return Response.json(experience, { status: 201 })
  } catch (error) {
    return handleApiError(error, "experience.create")
  }
}

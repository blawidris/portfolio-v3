import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { projectChallengeInputSchema } from "@/lib/validation/project-challenges"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = projectChallengeInputSchema.parse(await parseJsonRequest(req))
    const challenge = await prisma.projectChallenge.create({ data: input })
    const project = await prisma.project.findUnique({ where: { id: input.projectId }, select: { slug: true } })
    revalidateProjectContent(project?.slug)
    return Response.json(challenge, { status: 201 })
  } catch (error) {
    return handleApiError(error, "project-challenges.create")
  }
}

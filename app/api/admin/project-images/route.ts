import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { projectImageInputSchema } from "@/lib/validation/project-images"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = projectImageInputSchema.parse(await parseJsonRequest(req))
    const image = await prisma.projectImage.create({ data: input, include: { media: true } })
    const project = await prisma.project.findUnique({ where: { id: input.projectId }, select: { slug: true } })
    revalidateProjectContent(project?.slug)
    return Response.json(image, { status: 201 })
  } catch (error) {
    return handleApiError(error, "project-images.create")
  }
}

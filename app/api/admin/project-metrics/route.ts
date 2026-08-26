import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { projectMetricInputSchema } from "@/lib/validation/project-metrics"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = projectMetricInputSchema.parse(await parseJsonRequest(req))
    const metric = await prisma.projectMetric.create({ data: input })
    const project = await prisma.project.findUnique({ where: { id: input.projectId }, select: { slug: true } })
    revalidateProjectContent(project?.slug)
    return Response.json(metric, { status: 201 })
  } catch (error) {
    return handleApiError(error, "project-metrics.create")
  }
}

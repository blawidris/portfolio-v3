import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { caseStudyInputSchema } from "@/lib/validation/case-studies"
import { revalidateCaseStudyContent } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const caseStudies = await prisma.caseStudy.findMany({ orderBy: { order: "asc" } })
  return Response.json(caseStudies)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = caseStudyInputSchema.parse(await parseJsonRequest(req))
    const caseStudy = await prisma.caseStudy.create({
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        content: input.content,
        projectId: input.projectId,
        coverMediaId: input.coverMediaId,
        published: input.published,
        order: input.order,
      },
    })
    revalidateCaseStudyContent(caseStudy.slug)
    return Response.json(caseStudy, { status: 201 })
  } catch (error) {
    return handleApiError(error, "case-studies.create")
  }
}

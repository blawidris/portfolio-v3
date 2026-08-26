import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { caseStudyUpdateSchema } from "@/lib/validation/case-studies"
import { revalidateCaseStudyContent } from "@/lib/content/cache"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const { id } = await params
  const caseStudy = await prisma.caseStudy.findUnique({ where: { id } })
  if (!caseStudy) return apiError(404, "NOT_FOUND", "The requested case study was not found.")
  return Response.json(caseStudy)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = caseStudyUpdateSchema.parse(await parseJsonRequest(req))
    const existing = await prisma.caseStudy.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return apiError(404, "NOT_FOUND", "The requested case study was not found.")

    const caseStudy = await prisma.caseStudy.update({ where: { id }, data: input })
    revalidateCaseStudyContent(existing.slug, caseStudy.slug)
    return Response.json(caseStudy)
  } catch (error) {
    return handleApiError(error, "case-studies.update")
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
    const existing = await prisma.caseStudy.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return apiError(404, "NOT_FOUND", "The requested case study was not found.")

    await prisma.caseStudy.delete({ where: { id } })
    revalidateCaseStudyContent(existing.slug)
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "case-studies.delete")
  }
}

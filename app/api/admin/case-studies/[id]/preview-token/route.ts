import { randomBytes } from "node:crypto"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const existing = await prisma.caseStudy.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return apiError(404, "NOT_FOUND", "The requested case study was not found.")

    const previewToken = randomBytes(24).toString("hex")
    await prisma.caseStudy.update({ where: { id }, data: { previewToken } })
    return Response.json({ previewToken })
  } catch (error) {
    return handleApiError(error, "case-studies.preview-token")
  }
}

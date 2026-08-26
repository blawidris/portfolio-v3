import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const existing = await prisma.projectImage.findUnique({ where: { id }, include: { project: { select: { slug: true } } } })
    if (!existing) return apiError(404, "NOT_FOUND", "The requested record was not found.")

    await prisma.projectImage.delete({ where: { id } })
    revalidateProjectContent(existing.project.slug)
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "project-images.delete")
  }
}
